'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Mail, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './BookingList.module.css';
import CustomSelect from './ui/CustomSelect';
import BookingDetailsModal from './BookingDetailsModal';

interface Booking {
    id: string;
    booking_number: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    source: string;
    total_amount: number;
    guests: { first_name: string; last_name: string; email: string; phone?: string } | null;
    rooms: { room_number: string; type: string } | null;
}

export default function BookingList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Status');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('check_in_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const statusOptions = [
        { label: 'All Status', value: 'All Status' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Checked In', value: 'Checked In' },
        { label: 'Checked Out', value: 'Checked Out' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    useEffect(() => {
        fetchBookings();

        // Realtime subscription
        const channel = supabase
            .channel('bookings_list_update')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchBookings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_number,
                    check_in_date,
                    check_out_date,
                    status,
                    source,
                    total_amount,
                    guests (first_name, last_name, email, phone),
                    rooms (room_number, type)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setBookings(data as any);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async (booking: Booking) => {
        if (!booking.guests?.email) {
            alert('No email address found for this guest.');
            return;
        }

        if (!confirm(`Send booking confirmation to ${booking.guests.email}?`)) return;

        setSendingEmailId(booking.id);
        const formattedId = booking.booking_number || `BK-${booking.id.split('-')[0].toUpperCase()}`;

        try {
            const body = {
                type: 'booking-confirmation',
                payload: {
                    booking_id: formattedId,
                    email: booking.guests.email,
                    guest_name: `${booking.guests.first_name} ${booking.guests.last_name}`,
                    room_type: booking.rooms?.type || 'Standard Room',
                    check_in_date: booking.check_in_date,
                    check_out_date: booking.check_out_date,
                    room_number: booking.rooms?.room_number || 'N/A',
                    guests: '1',
                    total_amount: booking.total_amount,
                    advance_amount: 0
                }
            };

            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Failed to send email');

            alert('Booking confirmation email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please check the logs.');
        } finally {
            setSendingEmailId(null);
        }
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortedBookings = () => {
        let filtered = bookings;

        // Apply status filter
        if (filter !== 'All Status') {
            filtered = filtered.filter(b => b.status === filter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(b => {
                const guestName = b.guests ? `${b.guests.first_name} ${b.guests.last_name}`.toLowerCase() : '';
                const roomNumber = b.rooms?.room_number?.toLowerCase() || '';
                const bookingNumber = b.booking_number?.toLowerCase() || '';
                const search = searchTerm.toLowerCase();
                return guestName.includes(search) || roomNumber.includes(search) || bookingNumber.includes(search);
            });
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'booking_number':
                    aValue = a.booking_number || a.id;
                    bValue = b.booking_number || b.id;
                    break;
                case 'guest':
                    aValue = a.guests ? `${a.guests.first_name} ${a.guests.last_name}` : '';
                    bValue = b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : '';
                    break;
                case 'room':
                    aValue = a.rooms?.room_number || '';
                    bValue = b.rooms?.room_number || '';
                    break;
                case 'check_in_date':
                    aValue = new Date(a.check_in_date).getTime();
                    bValue = new Date(b.check_in_date).getTime();
                    break;
                case 'check_out_date':
                    aValue = new Date(a.check_out_date).getTime();
                    bValue = new Date(b.check_out_date).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'amount':
                    aValue = a.total_amount;
                    bValue = b.total_amount;
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

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search guests, bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ width: 180 }}>
                    <CustomSelect
                        options={statusOptions}
                        value={filter}
                        onChange={setFilter}
                        icon={<Filter size={16} />}
                    />
                </div>
            </div>
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loading}>Loading reservations...</div>
                ) : bookings.length === 0 ? (
                    <div className={styles.empty}>No bookings found. Create one!</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>SI No</th>
                                <th className={styles.sortable} onClick={() => handleSort('booking_number')}>
                                    Details <SortIcon column="booking_number" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('guest')}>
                                    Guest <SortIcon column="guest" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('room')}>
                                    Room <SortIcon column="room" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('check_in_date')}>
                                    Check-in <SortIcon column="check_in_date" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('check_out_date')}>
                                    Check-out <SortIcon column="check_out_date" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('status')}>
                                    Status <SortIcon column="status" />
                                </th>
                                <th className={styles.sortable} onClick={() => handleSort('amount')}>
                                    Amount <SortIcon column="amount" />
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedBookings().map((booking, index) => (
                                <tr key={booking.id}>
                                    <td className={styles.siNo} data-label="SI No">{index + 1}</td>
                                    <td data-label="Details">
                                        <div className={styles.idCell}>
                                            {booking.booking_number || `BK-${booking.id.split('-')[0].toUpperCase()}`}
                                        </div>
                                        <span className={styles.sourceTag}>{booking.source || 'Direct'}</span>
                                    </td>
                                    <td className={styles.guestCell} data-label="Guest">
                                        {booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Unknown'}
                                    </td>
                                    <td data-label="Room"><strong>{booking.rooms?.room_number || 'N/A'}</strong></td>
                                    <td data-label="Check-in">{new Date(booking.check_in_date).toLocaleDateString()}</td>
                                    <td data-label="Check-out">{new Date(booking.check_out_date).toLocaleDateString()}</td>
                                    <td data-label="Status">
                                        <span className={`${styles.status} ${styles[booking.status.toLowerCase().replace(' ', '')]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className={styles.amount} data-label="Amount">₹{booking.total_amount.toLocaleString()}</td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                                            <button
                                                className={styles.actionBtn}
                                                title="View Details"
                                                onClick={() => setSelectedBooking(booking)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="Resend Confirmation Email"
                                                onClick={() => handleSendEmail(booking)}
                                                disabled={sendingEmailId === booking.id}
                                            >
                                                {sendingEmailId === booking.id ? (
                                                    <div style={{ width: 18, height: 18, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <Mail size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
}
