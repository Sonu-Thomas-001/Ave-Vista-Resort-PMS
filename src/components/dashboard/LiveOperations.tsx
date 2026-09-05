'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, User, Home, BellRing, Clock, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Activity, BookingWithGuest, Invoice, Room } from '@/types/dashboard';
import styles from './LiveOperations.module.css';

export default function LiveOperations() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivities();

        // Real-time subscriptions
        const bookingsSubscription = supabase
            .channel('bookings-changes-live')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => fetchRecentActivities()
            )
            .subscribe();

        const invoicesSubscription = supabase
            .channel('invoices-changes-live')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                () => fetchRecentActivities()
            )
            .subscribe();

        const roomsSubscription = supabase
            .channel('rooms-changes-live')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'rooms' },
                () => fetchRecentActivities()
            )
            .subscribe();

        return () => {
            bookingsSubscription.unsubscribe();
            invoicesSubscription.unsubscribe();
            roomsSubscription.unsubscribe();
        };
    }, []);

    const fetchRecentActivities = async () => {
        try {
            const allActivities: Activity[] = [];

            // Fetch recent check-ins
            const { data: checkIns } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    created_at,
                    guests (first_name, last_name)
                `)
                .eq('status', 'Checked In')
                .order('created_at', { ascending: false })
                .limit(3) as { data: BookingWithGuest[] | null };

            if (checkIns) {
                checkIns.forEach((booking) => {
                    const guestName = booking.guests
                        ? `${booking.guests.first_name} ${booking.guests.last_name}`
                        : 'Guest';
                    allActivities.push({
                        id: `checkin-${booking.id}`,
                        text: `${guestName} checked in at front desk`,
                        time: getRelativeTime(new Date(booking.created_at)),
                        type: 'guest',
                        timestamp: new Date(booking.created_at)
                    });
                });
            }

            // Fetch recent bookings
            const { data: newBookings } = await supabase
                .from('bookings')
                .select(`
                    id,
                    created_at,
                    source,
                    guests (first_name, last_name)
                `)
                .order('created_at', { ascending: false })
                .limit(3) as { data: BookingWithGuest[] | null };

            if (newBookings) {
                newBookings.forEach((booking) => {
                    const source = booking.source || 'Direct';
                    allActivities.push({
                        id: `booking-${booking.id}`,
                        text: `New reservation confirmed via ${source}`,
                        time: getRelativeTime(new Date(booking.created_at)),
                        type: 'booking',
                        timestamp: new Date(booking.created_at)
                    });
                });
            }

            // Fetch recent payments
            const { data: payments } = await supabase
                .from('invoices')
                .select('id, paid_amount, created_at, guest_name')
                .gt('paid_amount', 0)
                .order('created_at', { ascending: false })
                .limit(3) as { data: Invoice[] | null };

            if (payments) {
                payments.forEach((payment) => {
                    allActivities.push({
                        id: `payment-${payment.id}`,
                        text: `Payment received: ₹${Number(payment.paid_amount).toLocaleString('en-IN')}`,
                        time: getRelativeTime(new Date(payment.created_at)),
                        type: 'payment',
                        timestamp: new Date(payment.created_at)
                    });
                });
            }

            // Fetch recent room status changes
            const { data: rooms } = await supabase
                .from('rooms')
                .select('id, room_number, status, created_at')
                .in('status', ['Clean', 'Cleaning'])
                .order('created_at', { ascending: false })
                .limit(2) as { data: Room[] | null };

            if (rooms) {
                rooms.forEach((room) => {
                    allActivities.push({
                        id: `room-${room.id}`,
                        text: `Room ${room.room_number} marked as ${room.status}`,
                        time: getRelativeTime(new Date(room.created_at)),
                        type: 'task',
                        timestamp: new Date(room.created_at)
                    });
                });
            }

            // Sort by timestamp descending
            allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setActivities(allActivities.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setLoading(false);
        }
    };

    const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>Live Operations Stream</h3>
                    <span className={styles.subtitle}>Real-time activity across resort</span>
                </div>
                <div className={styles.liveBadge}>
                    <span className={styles.pulse} />
                    <span>LIVE STREAM</span>
                </div>
            </div>

            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.skeletonItem} />
                        <div className={styles.skeletonItem} />
                        <div className={styles.skeletonItem} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className={styles.empty}>
                        <Radio size={24} className={styles.emptyIcon} />
                        <span>No recent events recorded today</span>
                    </div>
                ) : (
                    <AnimatePresence>
                        {activities.map((item, index) => {
                            const Icon = getIcon(item.type);
                            return (
                                <motion.div
                                    key={item.id}
                                    className={styles.item}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                >
                                    <div className={`${styles.iconBase} ${styles[item.type]}`}>
                                        <Icon size={16} strokeWidth={2.2} />
                                    </div>
                                    <div className={styles.content}>
                                        <p className={styles.text}>{item.text}</p>
                                        <div className={styles.meta}>
                                            <Clock size={12} />
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function getIcon(type: string) {
    switch (type) {
        case 'guest': return User;
        case 'task': return Home;
        case 'payment': return CheckCircle2;
        case 'booking': return BellRing;
        default: return CheckCircle2;
    }
}
