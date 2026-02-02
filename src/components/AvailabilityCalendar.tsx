'use client';

import { useState, useEffect } from 'react';
import styles from './AvailabilityCalendar.module.css';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

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
}

import BookingDetailsModal from './BookingDetailsModal';

export default function AvailabilityCalendar() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [viewStartDate, setViewStartDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchData();

        // Realtime
        const channel = supabase
            .channel('calendar_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [viewStartDate]);

    const fetchData = async () => {
        // Fetch Rooms
        const { data: roomData } = await supabase.from('rooms').select('*').order('room_number');
        if (roomData) setRooms(roomData);

        // Fetch Bookings overlapping the 7-day view
        // Start: viewStartDate
        // End: viewStartDate + 7 days
        const startStr = viewStartDate.toISOString().split('T')[0];
        const endData = new Date(viewStartDate);
        endData.setDate(endData.getDate() + 7);
        const endStr = endData.toISOString().split('T')[0];

        const { data: bookingData } = await supabase
            .from('bookings')
            .select('*, guests(first_name, last_name, email, phone)')
            .or(`and(check_in_date.lt.${endStr},check_out_date.gt.${startStr})`);

        if (bookingData) setBookings(bookingData as any);
    };

    // Generate 7 days headers
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() + i);
        return {
            date: d.getDate(),
            fullDate: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' })
        };
    });

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.roomLabel}>Room</div>
                    {days.map((d, i) => (
                        <div key={i} className={styles.dayHeader}>
                            <span className={styles.dayName}>{d.day}</span>
                            <span className={styles.dateNum}>{d.date}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.grid}>
                    {rooms.map((room) => {
                        return (
                            <div key={room.id} className={styles.row}>
                                <div className={styles.roomName}>
                                    <span>{room.room_number}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{room.type}</span>
                                </div>
                                {days.map((day, dayIdx) => {
                                    // Find booking that covers this day
                                    const dayDate = day.fullDate;

                                    // Booking starts strictly on this day within the grid? 
                                    // Or it started before, but for this grid cell we need to know if we should render the block HERE.
                                    // Logic: Render the block ONLY on the day it starts (check_in_date), 
                                    // OR if it started BEFORE the view, render it on the first day of the view (dayIdx === 0).

                                    const bookingToCheck = bookings.find(b => {
                                        const checkIn = b.check_in_date;
                                        const checkOut = b.check_out_date;
                                        return b.room_id === room.id && dayDate >= checkIn && dayDate < checkOut;
                                    });

                                    if (bookingToCheck) {
                                        // Determine if we should render the block
                                        const isStartOfBooking = bookingToCheck.check_in_date === dayDate;
                                        const isStartOfView = dayIdx === 0;
                                        const startsBeforeView = bookingToCheck.check_in_date < days[0].fullDate;

                                        if (isStartOfBooking || (isStartOfView && startsBeforeView)) {
                                            // Calculate ColSpan
                                            // End of booking OR end of view, whichever is FIRST
                                            const checkOutDate = new Date(bookingToCheck.check_out_date);
                                            const viewEndDate = new Date(days[6].fullDate);
                                            // We actually need to count days from CURRENT dayDate until checkOut or viewEnd

                                            const currentDayObj = new Date(dayDate);
                                            const actualEndDate = checkOutDate > new Date(days[6].fullDate + 'T23:59:59') ? new Date(days[6].fullDate) : checkOutDate;

                                            // Days remaining in this view (inclusive of today)
                                            // If checkOut is 5th, and Today is 3rd, span = 2 (3rd, 4th). 
                                            // If checkOut is > ViewEnd, span = days until ViewEnd + 1?

                                            // Let's simplify:
                                            // Span = min(days until checkout, days until view end + 1)

                                            const msPerDay = 1000 * 60 * 60 * 24;
                                            // Add 1 day ms to actualEndDate calculation to correspond to check-out logic or just use math
                                            // Actually: checkOut - currentDay
                                            // e.g. Book 1st to 3rd. ColSpan = 2.

                                            // If ends after view:
                                            // View 1st to 7th. Book 1st to 10th. Span = 7.
                                            let span = Math.ceil((checkOutDate.getTime() - currentDayObj.getTime()) / msPerDay);

                                            // Cap at remaining days in view
                                            const remainingInView = 7 - dayIdx;
                                            if (span > remainingInView) span = remainingInView;

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={styles.bookingCell}
                                                    style={{ gridColumn: `span ${span}` }}
                                                    onClick={() => setSelectedBooking(bookingToCheck)}
                                                >
                                                    <div
                                                        className={`${styles.bookingBlock} ${styles[bookingToCheck.status.toLowerCase().replace(' ', '')] || styles.confirmed}`}
                                                    >
                                                        <span>{bookingToCheck.guests?.first_name} {bookingToCheck.guests?.last_name}</span>
                                                        <span className={styles.bookingSource}>{bookingToCheck.source}</span>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // Covered by a span started earlier in this view
                                            return null;
                                        }
                                    }

                                    return <div key={dayIdx} className={styles.cell}></div>;
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </>
    );
}
