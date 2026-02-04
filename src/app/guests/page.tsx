'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Search, MoreHorizontal, Star, Crown, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import GuestModal from '@/components/GuestModal';

interface Guest {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_vip: boolean;
    notes?: string;
    bookings: {
        status: string;
        rooms: { room_number: string } | null;
        check_in_date: string;
        check_out_date: string;
    }[];
}

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState<string>('first_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [showActionsId, setShowActionsId] = useState<string | null>(null);

    // Click outside for actions menu
    const actionsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
                setShowActionsId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchGuests();

        const channel = supabase
            .channel('guest_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => {
                fetchGuests();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                // Refresh guests if bookings change (status updates)
                fetchGuests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchGuests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('guests')
            .select(`
                *,
                bookings (
                    status,
                    check_in_date,
                    check_out_date,
                    rooms (room_number)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) console.error(error);

        if (data) {
            // Deduplicate logic
            const uniqueGuestsMap = new Map<string, Guest>();

            data.forEach((guest: any) => {
                const key = guest.email ? guest.email.toLowerCase() : guest.id;

                if (uniqueGuestsMap.has(key)) {
                    // Merge bookings
                    const existing = uniqueGuestsMap.get(key)!;
                    existing.bookings = [...existing.bookings, ...guest.bookings];
                } else {
                    uniqueGuestsMap.set(key, { ...guest });
                }
            });

            setGuests(Array.from(uniqueGuestsMap.values()));
        }
        setLoading(false);
    };

    const handleDelete = async (guestId: string) => {
        if (window.confirm('Are you sure you want to delete this guest? This might fail if they have bookings.')) {
            const { error } = await supabase.from('guests').delete().eq('id', guestId);
            if (error) {
                alert('Failed to delete guest. They likely have past bookings.');
                console.error(error);
            } else {
                setShowActionsId(null);
                fetchGuests();
            }
        }
    };

    const getGuestStatus = (bookings: Guest['bookings']) => {
        const today = new Date().toISOString().split('T')[0];
        const statusList: { status: string, room: string }[] = [];

        // Check for 'Checked In'
        bookings.filter(b => b.status === 'Checked In').forEach(b => {
            const roomNum = Array.isArray(b.rooms) ? b.rooms[0]?.room_number : b.rooms?.room_number;
            statusList.push({ status: 'Checked In', room: roomNum || '-' });
        });

        // Check for 'Confirmed'
        bookings.filter(b => b.status === 'Confirmed' && b.check_in_date >= today).forEach(b => {
            const roomNum = Array.isArray(b.rooms) ? b.rooms[0]?.room_number : b.rooms?.room_number;
            statusList.push({ status: 'Reserved', room: roomNum || '-' });
        });

        if (statusList.length === 0) return { status: 'Checked Out', room: '-' };

        // Return accumulated status/room
        // Limit to 2 for display, or join
        const status = statusList[0].status; // Primary status
        const rooms = statusList.map(s => s.room).join(', ');

        return { status: statusList.some(s => s.status === 'Checked In') ? 'Checked In' : 'Reserved', room: rooms };
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortedGuests = () => {
        return filteredGuests.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'first_name':
                    aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email?.toLowerCase() || '';
                    bValue = b.email?.toLowerCase() || '';
                    break;
                case 'phone':
                    aValue = a.phone || '';
                    bValue = b.phone || '';
                    break;
                case 'status':
                    aValue = getGuestStatus(a.bookings).status;
                    bValue = getGuestStatus(b.bookings).status;
                    break;
                case 'room':
                    aValue = getGuestStatus(a.bookings).room;
                    bValue = getGuestStatus(b.bookings).room;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const filteredGuests = guests.filter(guest => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.phone?.includes(searchTerm);
    });

    return (
        <>
            <Header title="Guest Management" />

            <div className={styles.container}>
                <div className={styles.controls}>
                    <div className={styles.search}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search guests"
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingGuest(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={18} /> Add Guest
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading guests...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>SI No</th>
                                    <th className={styles.sortable} onClick={() => handleSort('first_name')}>
                                        Guest Name <SortIcon column="first_name" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('phone')}>
                                        Contact <SortIcon column="phone" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('status')}>
                                        Status <SortIcon column="status" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('room')}>
                                        Current Room <SortIcon column="room" />
                                    </th>
                                    <th>Tags</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuests.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>No guests found.</td></tr>
                                ) : (
                                    getSortedGuests().map((guest, index) => {
                                        const { status, room } = getGuestStatus(guest.bookings);
                                        return (
                                            <tr key={guest.id} className={styles.row}>
                                                <td className={styles.siNo}>{index + 1}</td>
                                                <td className={styles.nameCell}>
                                                    <div className={styles.avatar} data-letter={guest.first_name[0].toUpperCase()}>{guest.first_name[0]}</div>
                                                    <div>
                                                        <span className={styles.name}>{guest.first_name} {guest.last_name}</span>
                                                        <span className={styles.email}>{guest.email || 'No Email'}</span>
                                                    </div>
                                                </td>
                                                <td>{guest.phone || '-'}</td>
                                                <td>
                                                    <span className={`${styles.status} ${styles[status.toLowerCase().replace(' ', '')] || styles.checkedout}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>{room}</td>
                                                <td>
                                                    <div className={styles.tags}>
                                                        {guest.is_vip && (
                                                            <span className={`${styles.tag} ${styles.vip}`}><Crown size={12} /> VIP</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ position: 'relative' }}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => setShowActionsId(showActionsId === guest.id ? null : guest.id)}
                                                        aria-label="More Actions"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    {showActionsId === guest.id && (
                                                        <div className={styles.actionsMenu} ref={actionsRef}>
                                                            <button onClick={() => {
                                                                setEditingGuest(guest);
                                                                setShowModal(true);
                                                                setShowActionsId(null);
                                                            }}>
                                                                <Edit2 size={14} /> Edit
                                                            </button>
                                                            <button className={styles.deleteBtn} onClick={() => handleDelete(guest.id)}>
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {showModal && (
                <GuestModal
                    guest={editingGuest}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchGuests(); // Refresh
                    }}
                />
            )}
        </>
    );
}
