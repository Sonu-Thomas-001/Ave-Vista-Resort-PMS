'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import {
    Search,
    Users,
    Crown,
    Plus,
    RefreshCw,
    Building2,
    BedDouble,
    Mail,
    Phone,
    Edit2,
    Trash2,
    Key,
    LayoutGrid,
    List,
    X,
    ChevronUp,
    ChevronDown,
    Sparkles,
    UserCheck,
    Briefcase
} from 'lucide-react';
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
    company_name?: string;
    gst_number?: string;
    address?: string;
    is_vip: boolean;
    notes?: string;
    created_at?: string;
    bookings: {
        id?: string;
        status: string;
        rooms: { room_number: string; type?: string } | null;
        check_in_date: string;
        check_out_date: string;
    }[];
}

// Deterministic luxury gradients for avatars
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
];

const getAvatarBackground = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    return AVATAR_GRADIENTS[charCode % AVATAR_GRADIENTS.length];
};

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters & Views
    const [activeTab, setActiveTab] = useState<'all' | 'inhouse' | 'vip' | 'corporate' | 'upcoming'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [sortColumn, setSortColumn] = useState<string>('first_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

    const fetchGuests = async () => {
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('guests')
                .select(`
                    *,
                    bookings (
                        id,
                        status,
                        check_in_date,
                        check_out_date,
                        rooms (room_number, type)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Deduplicate logic by email/id
                const uniqueGuestsMap = new Map<string, Guest>();

                data.forEach((guest: any) => {
                    const key = guest.email ? guest.email.toLowerCase() : guest.id;

                    if (uniqueGuestsMap.has(key)) {
                        const existing = uniqueGuestsMap.get(key)!;
                        existing.bookings = [...existing.bookings, ...(guest.bookings || [])];
                    } else {
                        uniqueGuestsMap.set(key, { ...guest, bookings: guest.bookings || [] });
                    }
                });

                setGuests(Array.from(uniqueGuestsMap.values()));
            }
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGuests();

        const channel = supabase
            .channel('guest_updates_crm')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => {
                fetchGuests();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchGuests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDelete = async (guestId: string) => {
        if (window.confirm('Are you sure you want to delete this guest profile? This may fail if they have past bookings.')) {
            const { error } = await supabase.from('guests').delete().eq('id', guestId);
            if (error) {
                alert('Failed to delete guest. They likely have past reservations on record.');
                console.error(error);
            } else {
                fetchGuests();
            }
        }
    };

    const getGuestStatus = (bookings: Guest['bookings']) => {
        const today = new Date().toISOString().split('T')[0];
        const statusList: { status: string; room: string }[] = [];

        // Check for 'Checked In'
        bookings
            .filter(b => b.status === 'Checked In')
            .forEach(b => {
                const roomNum = Array.isArray(b.rooms) ? b.rooms[0]?.room_number : b.rooms?.room_number;
                statusList.push({ status: 'In-House', room: roomNum || '-' });
            });

        // Check for 'Confirmed'
        bookings
            .filter(b => b.status === 'Confirmed' && b.check_in_date >= today)
            .forEach(b => {
                const roomNum = Array.isArray(b.rooms) ? b.rooms[0]?.room_number : b.rooms?.room_number;
                statusList.push({ status: 'Reserved', room: roomNum || '-' });
            });

        if (statusList.length === 0) return { status: 'Past Guest', room: '-' };

        const status = statusList.some(s => s.status === 'In-House') ? 'In-House' : 'Reserved';
        const rooms = statusList.map(s => s.room).filter(r => r !== '-').join(', ') || '-';

        return { status, room: rooms };
    };

    // Calculate processed guests with computed status
    const processedGuests = useMemo(() => {
        return guests.map(guest => {
            const { status, room } = getGuestStatus(guest.bookings);
            return {
                ...guest,
                computedStatus: status,
                currentRoom: room,
                totalStays: guest.bookings ? guest.bookings.length : 0
            };
        });
    }, [guests]);

    // KPI Summary Metrics
    const kpiStats = useMemo(() => {
        const total = processedGuests.length;
        const inHouse = processedGuests.filter(g => g.computedStatus === 'In-House').length;
        const vip = processedGuests.filter(g => g.is_vip).length;
        const corporate = processedGuests.filter(g => g.company_name || g.gst_number).length;
        const upcoming = processedGuests.filter(g => g.computedStatus === 'Reserved').length;

        return {
            total,
            inHouse,
            vip,
            corporate,
            upcoming
        };
    }, [processedGuests]);

    // Filter by Tab and Search Term
    const filteredGuests = useMemo(() => {
        return processedGuests.filter(guest => {
            // Tab filter
            if (activeTab === 'inhouse' && guest.computedStatus !== 'In-House') return false;
            if (activeTab === 'vip' && !guest.is_vip) return false;
            if (activeTab === 'corporate' && !guest.company_name && !guest.gst_number) return false;
            if (activeTab === 'upcoming' && guest.computedStatus !== 'Reserved') return false;

            // Search query filter
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase().trim();
                const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
                const matchesName = fullName.includes(q);
                const matchesEmail = guest.email?.toLowerCase().includes(q);
                const matchesPhone = guest.phone?.includes(searchTerm);
                const matchesCompany = guest.company_name?.toLowerCase().includes(q);
                const matchesGst = guest.gst_number?.toLowerCase().includes(q);
                const matchesRoom = guest.currentRoom?.toLowerCase().includes(q);

                if (!matchesName && !matchesEmail && !matchesPhone && !matchesCompany && !matchesGst && !matchesRoom) {
                    return false;
                }
            }

            return true;
        });
    }, [processedGuests, activeTab, searchTerm]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedGuests = useMemo(() => {
        return [...filteredGuests].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortColumn) {
                case 'first_name':
                    aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'phone':
                    aVal = a.phone || '';
                    bVal = b.phone || '';
                    break;
                case 'company_name':
                    aVal = a.company_name?.toLowerCase() || '';
                    bVal = b.company_name?.toLowerCase() || '';
                    break;
                case 'status':
                    aVal = a.computedStatus;
                    bVal = b.computedStatus;
                    break;
                case 'room':
                    aVal = a.currentRoom;
                    bVal = b.currentRoom;
                    break;
                case 'stays':
                    aVal = a.totalStays;
                    bVal = b.totalStays;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredGuests, sortColumn, sortDirection]);

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
    };

    return (
        <>
            <Header title="Guest Management & CRM" />

            <div className={styles.container}>
                {/* 1. Luxury KPI Metric Overview Ribbon */}
                <div className={styles.kpiGrid}>
                    <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                        <div className={styles.kpiIconBox}>
                            <Users size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Total Guest CRM</span>
                            <span className={styles.kpiVal}>{kpiStats.total}</span>
                            <span className={styles.kpiHint}>Registered resort profiles</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                        <div className={styles.kpiIconBox}>
                            <UserCheck size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Currently In-House</span>
                            <span className={styles.kpiVal}>{kpiStats.inHouse}</span>
                            <span className={styles.kpiHint}>Occupying rooms right now</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiAmber}`}>
                        <div className={styles.kpiIconBox}>
                            <Crown size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>VIP Clientele</span>
                            <span className={styles.kpiVal}>{kpiStats.vip}</span>
                            <span className={styles.kpiHint}>Priority premium guests</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
                        <div className={styles.kpiIconBox}>
                            <Briefcase size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Corporate Accounts</span>
                            <span className={styles.kpiVal}>{kpiStats.corporate}</span>
                            <span className={styles.kpiHint}>Business & GST invoices</span>
                        </div>
                    </div>
                </div>

                {/* 2. Controls & Search Hub */}
                <div className={styles.toolbarCard}>
                    {/* Top Row: Search, Refresh, Add Guest */}
                    <div className={styles.topRow}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by name, phone, email, company, GST..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className={styles.clearSearchBtn} onClick={() => setSearchTerm('')}>
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div className={styles.actionsGroup}>
                            <button
                                className={styles.refreshBtn}
                                onClick={fetchGuests}
                                title="Refresh guest list"
                                disabled={refreshing}
                            >
                                <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                            </button>

                            <button
                                className={styles.addGuestBtn}
                                onClick={() => {
                                    setEditingGuest(null);
                                    setShowModal(true);
                                }}
                            >
                                <Plus size={16} /> Add New Guest
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Status Tabs & View Mode */}
                    <div className={styles.filterBar}>
                        <div className={styles.statusTabs}>
                            {[
                                { id: 'all', label: 'All Directory', count: kpiStats.total },
                                { id: 'inhouse', label: 'In-House', count: kpiStats.inHouse },
                                { id: 'upcoming', label: 'Upcoming', count: kpiStats.upcoming },
                                { id: 'vip', label: 'VIP Guests', count: kpiStats.vip },
                                { id: 'corporate', label: 'Corporate', count: kpiStats.corporate }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                                    onClick={() => setActiveTab(tab.id as any)}
                                >
                                    <span>{tab.label}</span>
                                    <span className={styles.tabCount}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.viewModeToggle}>
                            <button
                                className={`${styles.modeBtn} ${viewMode === 'table' ? styles.modeBtnActive : ''}`}
                                onClick={() => setViewMode('table')}
                                title="Data Table View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                className={`${styles.modeBtn} ${viewMode === 'cards' ? styles.modeBtnActive : ''}`}
                                onClick={() => setViewMode('cards')}
                                title="Profile Cards View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Guests List Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                        <RefreshCw size={28} className={styles.spinning} style={{ color: '#0284c7', margin: '0 auto 12px' }} />
                        <div>Loading resort guest profiles...</div>
                    </div>
                ) : sortedGuests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconBox}>
                            <Users size={32} />
                        </div>
                        <h3 className={styles.emptyTitle}>No Guest Profiles Found</h3>
                        <p className={styles.emptyDesc}>
                            {searchTerm
                                ? 'No guests matched your search criteria. Try a different query.'
                                : 'No guest records in this category.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #0284c7',
                                    background: '#fff',
                                    color: '#0284c7',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : viewMode === 'table' ? (
                    /* Luxury CRM Data Table */
                    <div className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 60, textAlign: 'center' }}>#</th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('first_name')}>
                                            Guest Profile <SortIcon column="first_name" />
                                        </th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('phone')}>
                                            Contact <SortIcon column="phone" />
                                        </th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('company_name')}>
                                            Corporate / GST <SortIcon column="company_name" />
                                        </th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('status')}>
                                            Status <SortIcon column="status" />
                                        </th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('room')}>
                                            Current Room <SortIcon column="room" />
                                        </th>
                                        <th className={styles.sortableTh} onClick={() => handleSort('stays')}>
                                            Stays <SortIcon column="stays" />
                                        </th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedGuests.map((guest, idx) => {
                                        const fullName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest';

                                        return (
                                            <tr key={guest.id} className={styles.tableRow}>
                                                {/* SI No */}
                                                <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                                    {idx + 1}
                                                </td>

                                                {/* Profile Cell */}
                                                <td>
                                                    <div className={styles.guestCell}>
                                                        <div
                                                            className={styles.avatar}
                                                            style={{ background: getAvatarBackground(fullName) }}
                                                        >
                                                            {fullName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className={styles.guestMeta}>
                                                            <div className={styles.guestNameRow}>
                                                                <span className={styles.guestName}>{fullName}</span>
                                                                {guest.is_vip && (
                                                                    <span className={styles.vipBadge}>
                                                                        <Crown size={11} /> VIP
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={styles.guestEmail}>
                                                                {guest.email || 'No email registered'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Cell */}
                                                <td>
                                                    {guest.phone ? (
                                                        <a
                                                            href={`tel:${guest.phone}`}
                                                            style={{
                                                                fontWeight: 600,
                                                                color: '#0f172a',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 4
                                                            }}
                                                        >
                                                            <Phone size={13} style={{ color: '#94a3b8' }} />
                                                            {guest.phone}
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>—</span>
                                                    )}
                                                </td>

                                                {/* Company / GST */}
                                                <td>
                                                    {guest.company_name ? (
                                                        <div>
                                                            <span className={styles.companyBadge}>
                                                                <Building2 size={12} />
                                                                {guest.company_name}
                                                            </span>
                                                            {guest.gst_number && (
                                                                <span className={styles.gstSub}>
                                                                    GST: {guest.gst_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : guest.gst_number ? (
                                                        <span className={styles.gstSub}>GST: {guest.gst_number}</span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>—</span>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td>
                                                    <span
                                                        className={`${styles.statusBadge} ${
                                                            guest.computedStatus === 'In-House'
                                                                ? styles.statusCheckedIn
                                                                : guest.computedStatus === 'Reserved'
                                                                ? styles.statusReserved
                                                                : styles.statusPast
                                                        }`}
                                                    >
                                                        {guest.computedStatus === 'In-House' && (
                                                            <span className={styles.pulseDot} />
                                                        )}
                                                        {guest.computedStatus}
                                                    </span>
                                                </td>

                                                {/* Assigned Room */}
                                                <td>
                                                    {guest.currentRoom && guest.currentRoom !== '-' ? (
                                                        <span className={styles.roomPill}>
                                                            <Key size={12} />
                                                            Room {guest.currentRoom}
                                                        </span>
                                                    ) : (
                                                        <span className={styles.noRoom}>None</span>
                                                    )}
                                                </td>

                                                {/* Total Stays */}
                                                <td>
                                                    <span className={styles.staysBadge}>
                                                        {guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className={styles.actionsCell}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="Edit Profile"
                                                            onClick={() => {
                                                                setEditingGuest(guest);
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                            title="Delete Guest"
                                                            onClick={() => handleDelete(guest.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* CRM Profile Cards Mode */
                    <div className={styles.cardsGrid}>
                        {sortedGuests.map(guest => {
                            const fullName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest';

                            return (
                                <div key={guest.id} className={styles.guestCardItem}>
                                    <div className={styles.cardTopRow}>
                                        <div className={styles.guestCell}>
                                            <div
                                                className={styles.avatar}
                                                style={{ background: getAvatarBackground(fullName) }}
                                            >
                                                {fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.guestMeta}>
                                                <div className={styles.guestNameRow}>
                                                    <span className={styles.guestName}>{fullName}</span>
                                                    {guest.is_vip && (
                                                        <span className={styles.vipBadge}>
                                                            <Crown size={11} /> VIP
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    className={`${styles.statusBadge} ${
                                                        guest.computedStatus === 'In-House'
                                                            ? styles.statusCheckedIn
                                                            : guest.computedStatus === 'Reserved'
                                                            ? styles.statusReserved
                                                            : styles.statusPast
                                                    }`}
                                                    style={{ marginTop: 4, width: 'fit-content' }}
                                                >
                                                    {guest.computedStatus === 'In-House' && (
                                                        <span className={styles.pulseDot} />
                                                    )}
                                                    {guest.computedStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardContactRow}>
                                        <div className={styles.contactItem}>
                                            <Phone size={14} />
                                            <span>{guest.phone || 'No phone recorded'}</span>
                                        </div>
                                        <div className={styles.contactItem}>
                                            <Mail size={14} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {guest.email || 'No email recorded'}
                                            </span>
                                        </div>
                                        {guest.company_name && (
                                            <div className={styles.contactItem}>
                                                <Building2 size={14} />
                                                <span>{guest.company_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <div>
                                            {guest.currentRoom && guest.currentRoom !== '-' ? (
                                                <span className={styles.roomPill}>
                                                    <Key size={12} /> Room {guest.currentRoom}
                                                </span>
                                            ) : (
                                                <span className={styles.staysBadge}>{guest.totalStays} Stays</span>
                                            )}
                                        </div>

                                        <div className={styles.actionsCell}>
                                            <button
                                                className={styles.actionBtn}
                                                title="Edit Profile"
                                                onClick={() => {
                                                    setEditingGuest(guest);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete Profile"
                                                onClick={() => handleDelete(guest.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Guest Create / Edit Modal */}
            {showModal && (
                <GuestModal
                    guest={editingGuest}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchGuests();
                    }}
                />
            )}
        </>
    );
}
