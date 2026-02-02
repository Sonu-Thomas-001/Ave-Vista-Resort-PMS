'use client';

import { CheckCircle2, User, Home, BellRing, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LiveOperations.module.css';

interface Activity {
    id: number;
    text: string;
    time: string;
    type: 'guest' | 'task' | 'payment' | 'booking' | 'system';
}

const mockActivities: Activity[] = [
    { id: 1, text: 'John Doe checked in', time: '2 mins ago', type: 'guest' },
    { id: 2, text: 'Room 101 marked Cleaner', time: '5 mins ago', type: 'task' },
    { id: 3, text: 'Payment received ₹4,500', time: '12 mins ago', type: 'payment' },
    { id: 4, text: 'New booking via Booking.com', time: '1 hour ago', type: 'booking' },
    { id: 5, text: 'Daily Backup Completed', time: '2 hours ago', type: 'system' },
];

export default function LiveOperations() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Live Operations</h3>
                <div className={styles.badge}>
                    <span className={styles.pulse}></span> Live
                </div>
            </div>

            <div className={styles.list}>
                <AnimatePresence>
                    {mockActivities.map((item, index) => {
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
