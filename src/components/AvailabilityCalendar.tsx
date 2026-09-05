'use client';

import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import styles from './AvailabilityCalendar.module.css';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { isFullResortType } from '@/lib/constants';
import BookingDetailsModal from './BookingDetailsModal';

type Room = Database['public']['Tables']['rooms']['Row'];

interface Booking {
    id: string;
    room_id: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    total_amount: number;
    source: string;
    guests: { first_name: string; last_name: string; email: string; phone: string } | null;
    rooms?: { type: string } | null;
}

export default function AvailabilityCalendar() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [viewStartDate, setViewStartDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Realtime subscription
        const channel = supabase
            .channel('calendar_updates_stream')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [viewStartDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Rooms
            const { data: roomData } = await supabase
                .from('rooms')
                .select('*')
                .order('room_number');
            if (roomData) setRooms(roomData);

            // Calculate start & end strings (7 days)
            const startStr = viewStartDate.toISOString().split('T')[0];
            const endData = new Date(viewStartDate);
            endData.setDate(endData.getDate() + 7);
            const endStr = endData.toISOString().split('T')[0];

            // Fetch Bookings overlapping the 7-day view
            const { data: bookingData } = await supabase
                .from('bookings')
                .select('*, guests(first_name, last_name, email, phone), rooms(type)')
                .or(`and(check_in_date.lt.${endStr},check_out_date.gt.${startStr})`);

            if (bookingData) setBookings(bookingData as any);
        } catch (err) {
            console.error('Error fetching calendar data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Navigation handlers
    const handlePrevWeek = () => {
        const newDate = new Date(viewStartDate);
        newDate.setDate(newDate.getDate() - 7);
        setViewStartDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(viewStartDate);
        newDate.setDate(newDate.getDate() + 7);
        setViewStartDate(newDate);
    };

    const handleToday = () => {
        setViewStartDate(new Date());
    };

    // Generate 7 days headers
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() + i);
        const isToday = d.toDateString() === new Date().toDateString();
        return {
            date: d.getDate(),
            fullDate: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            isToday
        };
    });

    const rangeLabel = `${days[0].date} ${days[0].month} – ${days[6].date} ${days[6].month} ${viewStartDate.getFullYear()}`;

    return (
        <div className={styles.wrapper}>
            {/* Calendar Control Bar */}
            <div className={styles.calendarControls}>
                <div className={styles.navGroup}>
                    <button className={styles.navBtn} onClick={handlePrevWeek} title="Previous 7 Days">
                        <ChevronLeft size={18} />
                    </button>
                    <button className={styles.todayBtn} onClick={handleToday}>
                        Today
                    </button>
                    <button className={styles.navBtn} onClick={handleNextWeek} title="Next 7 Days">
                        <ChevronRight size={18} />
                    </button>
                    <span className={styles.rangeText}>{rangeLabel}</span>
                </div>

                {/* Status Legend */}
                <div className={styles.legendBar}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.dotConfirmed}`} />
                        <span>Confirmed</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.dotCheckedIn}`} />
                        <span>Checked In</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.dotCheckedOut}`} />
                        <span>Checked Out</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.dotPending}`} />
                        <span>Pending</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className={styles.container}>
                {/* Header Row */}
                <div className={styles.header}>
                    <div className={styles.roomLabel}>Inventory / Room</div>
                    {days.map((d, i) => (
                        <div key={i} className={`${styles.dayHeader} ${d.isToday ? styles.todayHeader : ''}`}>
                            <span className={styles.dayName}>{d.day}</span>
                            <span className={styles.dateNum}>{d.date}</span>
                            {d.isToday && <span className={styles.todayPill}>Today</span>}
                        </div>
                    ))}
                </div>

                {/* Rows Grid */}
                <div className={styles.grid}>
                    {rooms.map((room) => {
                        return (
                            <div key={room.id} className={styles.row}>
                                {/* Room Label Cell */}
                                <div className={styles.roomName}>
                                    <span className={styles.roomNumberText}>{room.room_number}</span>
                                    <span className={styles.roomTypeText}>{room.type}</span>
                                </div>

                                {/* 7 Days Columns */}
                                {days.map((day, dayIdx) => {
                                    const dayDate = day.fullDate;

                                    const bookingToCheck = bookings.find((b) => {
                                        const checkIn = b.check_in_date;
                                        const checkOut = b.check_out_date;
                                        const overlapsDay = dayDate >= checkIn && dayDate < checkOut;
                                        if (!overlapsDay) return false;

                                        if (isFullResortType(room.type)) return true;
                                        if (isFullResortType(b.rooms?.type || '')) return true;

                                        return b.room_id === room.id;
                                    });

                                    if (bookingToCheck) {
                                        const isStartOfBooking = bookingToCheck.check_in_date === dayDate;
                                        const isStartOfView = dayIdx === 0;
                                        const startsBeforeView = bookingToCheck.check_in_date < days[0].fullDate;

                                        if (isStartOfBooking || (isStartOfView && startsBeforeView)) {
                                            const checkOutDate = new Date(bookingToCheck.check_out_date);
                                            const currentDayObj = new Date(dayDate);
                                            const msPerDay = 1000 * 60 * 60 * 24;

                                            let span = Math.ceil(
                                                (checkOutDate.getTime() - currentDayObj.getTime()) / msPerDay
                                            );
                                            const remainingInView = 7 - dayIdx;
                                            if (span > remainingInView) span = remainingInView;

                                            const guestName = bookingToCheck.guests
                                                ? `${bookingToCheck.guests.first_name} ${bookingToCheck.guests.last_name}`
                                                : 'Guest';

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={styles.bookingCell}
                                                    style={{ gridColumn: `span ${span}` }}
                                                    onClick={() => setSelectedBooking(bookingToCheck)}
                                                >
                                                    <div
                                                        className={`${styles.bookingBlock} ${
                                                            styles[bookingToCheck.status.toLowerCase().replace(/\s+/g, '')] ||
                                                            styles.confirmed
                                                        }`}
                                                    >
                                                        <span className={styles.bookingGuest}>{guestName}</span>
                                                        <span className={styles.bookingSource}>
                                                            {bookingToCheck.source || 'Direct'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return null;
                                        }
                                    }

                                    return <div key={dayIdx} className={styles.cell} />;
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
}
