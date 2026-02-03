'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, User, Home, BellRing, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './LiveOperations.module.css';

interface Activity {
    id: string;
    text: string;
    time: string;
    type: 'guest' | 'task' | 'payment' | 'booking' | 'system';
    timestamp: Date;
}

export default function LiveOperations() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivities();

        // Set up real-time subscriptions
        const bookingsSubscription = supabase
            .channel('bookings-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => fetchRecentActivities()
            )
            .subscribe();

        const invoicesSubscription = supabase
            .channel('invoices-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                () => fetchRecentActivities()
            )
            .subscribe();

        return () => {
            bookingsSubscription.unsubscribe();
            invoicesSubscription.unsubscribe();
        };
    }, []);

    const fetchRecentActivities = async () => {
        try {
            const allActivities: Activity[] = [];

            // Fetch recent check-ins (bookings with status 'Checked In' updated recently)
            const { data: checkIns } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    updated_at,
                    guests (first_name, last_name)
                `)
                .eq('status', 'Checked In')
                .order('updated_at', { ascending: false })
                .limit(3);

            if (checkIns) {
                checkIns.forEach((booking: any) => {
                    const guestName = booking.guests
                        ? `${booking.guests.first_name} ${booking.guests.last_name}`
                        : 'Guest';
                    allActivities.push({
                        id: `checkin-${booking.id}`,
                        text: `${guestName} checked in`,
                        time: getRelativeTime(new Date(booking.updated_at)),
                        type: 'guest',
                        timestamp: new Date(booking.updated_at)
                    });
                });
            }

            // Fetch recent bookings (newly created)
            const { data: newBookings } = await supabase
                .from('bookings')
                .select(`
                    id,
                    created_at,
                    source,
                    guests (first_name, last_name)
                `)
                .order('created_at', { ascending: false })
                .limit(3);

            if (newBookings) {
                newBookings.forEach((booking: any) => {
                    const source = booking.source || 'Direct';
                    allActivities.push({
                        id: `booking-${booking.id}`,
                        text: `New booking via ${source}`,
                        time: getRelativeTime(new Date(booking.created_at)),
                        type: 'booking',
                        timestamp: new Date(booking.created_at)
                    });
                });
            }

            // Fetch recent payments
            const { data: payments } = await supabase
                .from('invoices')
                .select('id, paid_amount, updated_at, guest_name')
                .gt('paid_amount', 0)
                .order('updated_at', { ascending: false })
                .limit(3);

            if (payments) {
                payments.forEach((payment: any) => {
                    allActivities.push({
                        id: `payment-${payment.id}`,
                        text: `Payment received ₹${payment.paid_amount.toLocaleString()}`,
                        time: getRelativeTime(new Date(payment.updated_at)),
                        type: 'payment',
                        timestamp: new Date(payment.updated_at)
                    });
                });
            }

            // Fetch recent room status changes
            const { data: rooms } = await supabase
                .from('rooms')
                .select('id, room_number, status, updated_at')
                .in('status', ['Clean', 'Cleaning'])
                .order('updated_at', { ascending: false })
                .limit(2);

            if (rooms) {
                rooms.forEach((room: any) => {
                    allActivities.push({
                        id: `room-${room.id}`,
                        text: `Room ${room.room_number} marked ${room.status}`,
                        time: getRelativeTime(new Date(room.updated_at)),
                        type: 'task',
                        timestamp: new Date(room.updated_at)
                    });
                });
            }

            // Sort all activities by timestamp (most recent first)
            allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            // Take top 5 activities
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
                <h3>Live Operations</h3>
                <div className={styles.badge}>
                    <span className={styles.pulse}></span> Live
                </div>
            </div>

            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loading}>Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className={styles.empty}>No recent activities</div>
                ) : (
                    <AnimatePresence>
                        {activities.map((item, index) => {
                            const Icon = getIcon(item.type);
                            return (
                                <motion.div
                                    key={item.id}
                                    className={styles.item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, background: 'var(--surface-hover)' }}
                                >
                                    <div className={`${styles.iconBase} ${styles[item.type]}`}>
                                        <Icon size={16} />
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
