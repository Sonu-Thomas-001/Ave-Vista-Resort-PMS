'use client';

import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
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
            icon: Calendar,
            label: 'Total Bookings',
            value: stats.totalBookings,
            color: '#3b82f6'
        },
        {
            icon: Users,
            label: 'Total Guests',
            value: stats.totalGuests,
            color: '#10b981'
        },
        {
            icon: TrendingUp,
            label: 'Avg Stay',
            value: `${stats.avgStayDuration} days`,
            color: '#f59e0b'
        },
        {
            icon: DollarSign,
            label: 'Avg Rate',
            value: `₹${stats.avgDailyRate}`,
            color: '#8b5cf6'
        }
    ];

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Quick Stats</h3>
            <div className={styles.grid}>
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className={styles.statCard}>
                            <div
                                className={styles.iconWrapper}
                                style={{ backgroundColor: `${item.color}15` }}
                            >
                                <Icon size={20} color={item.color} />
                            </div>
                            <div className={styles.content}>
                                <span className={styles.label}>{item.label}</span>
                                <span className={styles.value}>{item.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
