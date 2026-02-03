'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, LayoutList, CalendarCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './BookingList.module.css';
import CustomSelect from './ui/CustomSelect';

interface Booking {
    id: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    source: string;
    total_amount: number;
    guests: { first_name: string; last_name: string } | null;
    rooms: { room_number: string } | null;
}

export default function BookingList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Status');
    const [searchTerm, setSearchTerm] = useState('');

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
                    check_in_date,
                    check_out_date,
                    status,
                    source,
                    total_amount,
                    guests (first_name, last_name),
                    rooms (room_number)
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
                                <th>Details</th>
                                <th>Guest</th>
                                <th>Room</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={booking.id}>
                                    <td className={styles.siNo}>{index + 1}</td>
                                    <td>
                                        <div className={styles.idCell}>
                                            BK-{booking.id.split('-')[0].toUpperCase()}
                                        </div>
                                        <span className={styles.sourceTag}>{booking.source || 'Direct'}</span>
                                    </td>
                                    <td className={styles.guestCell}>
                                        {booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Unknown'}
                                    </td>
                                    <td><strong>{booking.rooms?.room_number || 'N/A'}</strong></td>
                                    <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                                    <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[booking.status.toLowerCase().replace(' ', '')]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className={styles.amount}>₹{booking.total_amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
