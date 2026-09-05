'use client';

import { TrendingUp, Users, Calendar, IndianRupee, Clock, Award } from 'lucide-react';
import styles from './QuickStats.module.css';

interface QuickStatsProps {
    stats: {
        totalBookings: number;
        totalGuests: number;
        avgStayDuration: number;
        avgDailyRate: number;
    };
}

export default function QuickStats({ stats }: QuickStatsProps) {
    const statItems = [
        {
            id: 'bookings',
            icon: Calendar,
            label: 'Total Reservations',
            value: (stats.totalBookings || 0).toLocaleString(),
            sub: 'Lifetime bookings',
            theme: 'blue',
            color: '#0284c7'
        },
        {
            id: 'guests',
            icon: Users,
            label: 'Total Guests Hosted',
            value: (stats.totalGuests || 0).toLocaleString(),
            sub: 'Registered guests',
            theme: 'emerald',
            color: '#10b981'
        },
        {
            id: 'stay',
            icon: Clock,
            label: 'Average Stay Length',
            value: `${stats.avgStayDuration || 0} Nights`,
            sub: 'Per reservation',
            theme: 'amber',
            color: '#f59e0b'
        },
        {
            id: 'adr',
            icon: IndianRupee,
            label: 'Average Daily Rate',
            value: `₹${(stats.avgDailyRate || 0).toLocaleString('en-IN')}`,
            sub: 'ADR per night',
            theme: 'indigo',
            color: '#6366f1'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>Key Performance Metrics</h3>
                    <span className={styles.subtitle}>Hospitality & guest stay benchmarks</span>
                </div>
            </div>

            <div className={styles.grid}>
                {statItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className={styles.statCard}>
                            <div className={`${styles.iconWrapper} ${styles[item.theme]}`}>
                                <Icon size={20} strokeWidth={2.2} />
                            </div>
                            <div className={styles.content}>
                                <span className={styles.label}>{item.label}</span>
                                <span className={styles.value}>{item.value}</span>
                                <span className={styles.subtext}>{item.sub}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
