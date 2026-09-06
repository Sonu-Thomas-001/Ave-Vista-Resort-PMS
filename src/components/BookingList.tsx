'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ChevronUp,
    ChevronDown,
    Mail,
    Eye,
    Pencil,
    X,
    CalendarCheck,
    Users,
    BedDouble,
    Clock,
    Sparkles,
    CheckCircle2,
    Calendar,
    Phone,
    IndianRupee,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './BookingList.module.css';
import BookingDetailsModal from './BookingDetailsModal';
import EditBookingModal from './EditBookingModal';

interface Booking {
    id: string;
    guest_id: string;
    room_id: string;
    booking_number: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    source: string;
    total_amount: number;
    advance_amount?: number | null;
    room_rate?: number | null;
    extra_pax?: number | null;
    extra_pax_rate?: number | null;
    guests: { first_name: string; last_name: string; email: string; phone?: string } | null;
    rooms: { room_number: string; type: string } | null;
}

export default function BookingList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('check_in_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [emailSuccessToast, setEmailSuccessToast] = useState<string | null>(null);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

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
                    guest_id,
                    room_id,
                    booking_number,
                    check_in_date,
                    check_out_date,
                    status,
                    source,
                    adults,
                    children,
                    total_amount,
                    advance_amount,
                    room_rate,
                    extra_pax,
                    extra_pax_rate,
                    created_at,
                    guests (id, first_name, last_name, email, phone, is_vip, notes, company_name),
                    rooms (id, room_number, type, price_per_night)
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

    // Calculate status counts for quick tabs
    const statusCounts = useMemo(() => {
        const counts = {
            All: bookings.length,
            Confirmed: 0,
            'Checked In': 0,
            'Checked Out': 0,
            Cancelled: 0
        };

        bookings.forEach((b) => {
            const status = b.status as keyof typeof counts;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        return counts;
    }, [bookings]);

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
                    booking_type: booking.source || 'Direct',
                    room_type: booking.rooms?.type || 'Standard Room',
                    check_in_date: booking.check_in_date,
                    check_out_date: booking.check_out_date,
                    room_number: booking.rooms?.room_number || 'N/A',
                    guests: '1',
                    total_amount: booking.total_amount,
                    advance_amount: booking.advance_amount || 0
                }
            };

            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Failed to send email');

            setEmailSuccessToast(`Confirmation sent to ${booking.guests.email}`);
            setTimeout(() => setEmailSuccessToast(null), 4000);
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send confirmation email. Please check logs.');
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
        if (filter !== 'All') {
            filtered = filtered.filter(b => b.status === filter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(b => {
                const guestName = b.guests ? `${b.guests.first_name} ${b.guests.last_name}`.toLowerCase() : '';
                const guestEmail = b.guests?.email?.toLowerCase() || '';
                const guestPhone = b.guests?.phone?.toLowerCase() || '';
                const roomNumber = b.rooms?.room_number?.toLowerCase() || '';
                const bookingNumber = b.booking_number?.toLowerCase() || '';
                const search = searchTerm.toLowerCase();
                return (
                    guestName.includes(search) ||
                    guestEmail.includes(search) ||
                    guestPhone.includes(search) ||
                    roomNumber.includes(search) ||
                    bookingNumber.includes(search)
                );
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
        return sortDirection === 'asc' ? (
            <ChevronUp size={14} className={styles.sortIconActive} />
        ) : (
            <ChevronDown size={14} className={styles.sortIconActive} />
        );
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
        return `${diff} ${diff === 1 ? 'night' : 'nights'}`;
    };

    const sortedBookings = getSortedBookings();

    return (
        <div className={styles.wrapper}>
            {/* Quick KPI Strip */}
            <div className={styles.kpiRow}>
                <div className={styles.kpiTile}>
                    <span className={styles.kpiTileLabel}>Total Bookings</span>
                    <span className={styles.kpiTileValue}>{statusCounts.All}</span>
                </div>
                <div className={styles.kpiTile}>
                    <span className={styles.kpiTileLabel}>Confirmed</span>
                    <span className={`${styles.kpiTileValue} ${styles.blueVal}`}>{statusCounts.Confirmed}</span>
                </div>
                <div className={styles.kpiTile}>
                    <span className={styles.kpiTileLabel}>In-House (Checked In)</span>
                    <span className={`${styles.kpiTileValue} ${styles.greenVal}`}>{statusCounts['Checked In']}</span>
                </div>
                <div className={styles.kpiTile}>
                    <span className={styles.kpiTileLabel}>Departed (Checked Out)</span>
                    <span className={styles.kpiTileValue}>{statusCounts['Checked Out']}</span>
                </div>
            </div>

            {/* Filter Tabs & Search Toolbar */}
            <div className={styles.toolbar}>
                {/* 1-Click Status Filter Tabs */}
                <div className={styles.statusTabs}>
                    {(['All', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'] as const).map((tab) => {
                        const isActive = filter === tab;
                        return (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                                onClick={() => setFilter(tab)}
                            >
                                <span>{tab}</span>
                                <span className={`${styles.tabCount} ${isActive ? styles.activeTabCount : ''}`}>
                                    {statusCounts[tab as keyof typeof statusCounts] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Smart Search */}
                <div className={styles.search}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder="Search guest, room, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className={styles.clearSearchBtn} onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <span>Loading resort reservations...</span>
                    </div>
                ) : sortedBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar size={32} className={styles.emptyIcon} />
                        <h3>No reservations match your filter</h3>
                        <p>Try switching filter tabs or clearing your search term.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.thIndex}>#</th>
                                    <th className={styles.sortable} onClick={() => handleSort('booking_number')}>
                                        <span>Reference</span> <SortIcon column="booking_number" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('guest')}>
                                        <span>Guest</span> <SortIcon column="guest" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('room')}>
                                        <span>Room</span> <SortIcon column="room" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('check_in_date')}>
                                        <span>Dates & Stay</span> <SortIcon column="check_in_date" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('status')}>
                                        <span>Status</span> <SortIcon column="status" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('amount')}>
                                        <span>Folio Total</span> <SortIcon column="amount" />
                                    </th>
                                    <th className={styles.thActions}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedBookings.map((booking, index) => {
                                    const guestName = booking.guests
                                        ? `${booking.guests.first_name} ${booking.guests.last_name}`
                                        : 'Guest';
                                    const guestInitial = guestName[0]?.toUpperCase() || 'G';
                                    const refCode =
                                        booking.booking_number || `BK-${booking.id.split('-')[0].toUpperCase()}`;

                                    return (
                                        <tr key={booking.id} className={styles.tableRow}>
                                            <td className={styles.tdIndex}>{index + 1}</td>

                                            {/* Reference & Source */}
                                            <td>
                                                <div className={styles.refCell}>
                                                    <span className={styles.refCode}>{refCode}</span>
                                                    <span
                                                        className={`${styles.sourceBadge} ${
                                                            styles[booking.source?.toLowerCase().replace(/\s+/g, '') || 'direct']
                                                        }`}
                                                    >
                                                        {booking.source || 'Direct'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Guest Avatar & Contact */}
                                            <td>
                                                <div className={styles.guestCell}>
                                                    <div className={styles.guestAvatar}>{guestInitial}</div>
                                                    <div className={styles.guestDetails}>
                                                        <span className={styles.guestName}>{guestName}</span>
                                                        <span className={styles.guestContact}>
                                                            {booking.guests?.phone || booking.guests?.email || 'No contact'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Room & Category */}
                                            <td>
                                                <div className={styles.roomCell}>
                                                    <span className={styles.roomNum}>
                                                        {booking.rooms?.room_number || 'TBD'}
                                                    </span>
                                                    <span className={styles.roomCategory}>
                                                        {booking.rooms?.type || 'Room'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Dates & Duration */}
                                            <td>
                                                <div className={styles.dateCell}>
                                                    <span className={styles.dateRange}>
                                                        {new Date(booking.check_in_date).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                        <ArrowRight size={11} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#94a3b8' }} />
                                                        {new Date(booking.check_out_date).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                    </span>
                                                    <span className={styles.stayNights}>
                                                        {calculateNights(booking.check_in_date, booking.check_out_date)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Pill */}
                                            <td>
                                                <span
                                                    className={`${styles.statusPill} ${
                                                        styles[booking.status.toLowerCase().replace(/\s+/g, '')] || styles.confirmed
                                                    }`}
                                                >
                                                    <span className={styles.statusDot} />
                                                    <span>{booking.status}</span>
                                                </span>
                                            </td>

                                            {/* Folio Total & Advance */}
                                            <td>
                                                <div className={styles.amountCell}>
                                                    <span className={styles.totalAmount}>
                                                        ₹{(booking.total_amount || 0).toLocaleString('en-IN')}
                                                    </span>
                                                    {Number(booking.advance_amount) > 0 && (
                                                        <span className={styles.advanceChip}>
                                                            Adv: ₹{Number(booking.advance_amount).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    <button
                                                        className={styles.actionIconBtn}
                                                        title="View Folio Details"
                                                        onClick={() => setSelectedBooking(booking)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionIconBtn}
                                                        title="Edit Reservation"
                                                        onClick={() => setEditingBooking(booking)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className={styles.actionIconBtn}
                                                        title="Send Confirmation Email"
                                                        onClick={() => handleSendEmail(booking)}
                                                        disabled={sendingEmailId === booking.id}
                                                    >
                                                        {sendingEmailId === booking.id ? (
                                                            <div className={styles.miniSpinner} />
                                                        ) : (
                                                            <Mail size={15} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards Container (Shown on <= 768px viewports) */}
                    <div className={styles.mobileCardsContainer}>
                        {sortedBookings.map((booking) => {
                            const advance = Number(booking.advance_amount) || 0;
                            const total = Number(booking.total_amount) || 0;
                            const balance = total - advance;
                            const guestName = booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Unknown Guest';

                            return (
                                <div key={booking.id} className={styles.mobileBookingCard}>
                                    <div className={styles.mobileCardTop}>
                                        <div className={styles.mobileCardRef}>
                                            <span className={styles.mobileRefNumber}>
                                                {booking.booking_number || `BK-${booking.id.split('-')[0].toUpperCase()}`}
                                            </span>
                                            <span
                                                className={`${styles.statusPill} ${
                                                    styles[booking.status.toLowerCase().replace(/\s+/g, '')] || styles.confirmed
                                                }`}
                                            >
                                                <span className={styles.statusDot} />
                                                <span>{booking.status}</span>
                                            </span>
                                        </div>
                                        <span className={styles.mobileSourceBadge}>
                                            {booking.source || 'Direct'}
                                        </span>
                                    </div>

                                    <div className={styles.mobileGuestSection}>
                                        <div className={styles.guestAvatar}>
                                            {booking.guests?.first_name?.[0]?.toUpperCase() || 'G'}
                                        </div>
                                        <div className={styles.mobileGuestMeta}>
                                            <div className={styles.mobileGuestName}>
                                                {guestName}
                                                {(booking.guests as any)?.is_vip && (
                                                    <span className={styles.vipBadge}>VIP</span>
                                                )}
                                            </div>
                                            {booking.guests?.phone && (
                                                <a href={`tel:${booking.guests.phone}`} className={styles.mobilePhoneLink}>
                                                    <Phone size={12} />
                                                    <span>{booking.guests.phone}</span>
                                                </a>
                                            )}
                                        </div>
                                        <div className={styles.mobileRoomTag}>
                                            <BedDouble size={14} />
                                            <span>{booking.rooms?.room_number ? `Rm ${booking.rooms.room_number}` : 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className={styles.mobileDatesSection}>
                                        <div className={styles.mobileDateBlock}>
                                            <span className={styles.mobileDateSub}>Check In</span>
                                            <span className={styles.mobileDateText}>
                                                {new Date(booking.check_in_date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                        <div className={styles.mobileDurationBlock}>
                                            <span>{calculateNights(booking.check_in_date, booking.check_out_date)}</span>
                                            <ArrowRight size={13} />
                                        </div>
                                        <div className={styles.mobileDateBlock}>
                                            <span className={styles.mobileDateSub}>Check Out</span>
                                            <span className={styles.mobileDateText}>
                                                {new Date(booking.check_out_date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.mobileFinancialRow}>
                                        <div className={styles.mobileAmountGroup}>
                                            <span className={styles.mobileAmountSub}>Total Bill</span>
                                            <span className={styles.mobileTotalAmount}>₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.mobileAmountGroup} style={{ textAlign: 'right' }}>
                                            <span className={styles.mobileAmountSub}>Folio Balance</span>
                                            <span className={balance > 0 ? styles.mobileBalanceDue : styles.mobileBalanceSettled}>
                                                {balance > 0 ? `Due ₹${balance.toLocaleString('en-IN')}` : 'Settled'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.mobileCardActions}>
                                        <button
                                            type="button"
                                            className={styles.mobilePrimaryBtn}
                                            onClick={() => setSelectedBooking(booking)}
                                        >
                                            <Eye size={16} />
                                            <span>Folio & Details</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.mobileSecondaryBtn}
                                            onClick={() => setEditingBooking(booking)}
                                        >
                                            <Pencil size={15} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.mobileEmailBtn}
                                            title="Send Confirmation Email"
                                            onClick={() => handleSendEmail(booking)}
                                            disabled={sendingEmailId === booking.id}
                                        >
                                            {sendingEmailId === booking.id ? (
                                                <div className={styles.miniSpinner} />
                                            ) : (
                                                <Mail size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onEdit={(b) => {
                        setSelectedBooking(null);
                        setEditingBooking(b);
                    }}
                />
            )}

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSuccess={() => {
                        setEditingBooking(null);
                        fetchBookings();
                    }}
                />
            )}

            {/* Email Toast */}
            {emailSuccessToast && (
                <div className={styles.toast}>
                    <CheckCircle2 size={18} className={styles.toastCheck} />
                    <span>{emailSuccessToast}</span>
                </div>
            )}
        </div>
    );
}
