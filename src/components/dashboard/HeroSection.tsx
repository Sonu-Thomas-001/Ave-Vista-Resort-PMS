'use client';

import { useMemo } from 'react';
import { CalendarCheck, BedDouble, IndianRupee, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

interface HeroKPIProps {
    checkIns: number;
    checkOuts: number;
    occupancy: number;
    revenue: number;
    availableRooms: number;
}

export default function HeroSection({ checkIns, occupancy, revenue, availableRooms }: HeroKPIProps) {
    const cards = useMemo(() => [
        {
            title: "Today's Check-ins",
            value: checkIns,
            icon: CalendarCheck,
            trend: "+4 vs yesterday",
            trendUp: true,
            color: "blue"
        },
        {
            title: "Occupancy Rate",
            value: `${occupancy}%`,
            icon: Users,
            trend: "+2% vs last week",
            trendUp: true,
            color: "purple"
        },
        {
            title: "Total Revenue",
            value: `₹${revenue.toLocaleString()}`,
            icon: IndianRupee,
            trend: "+12% growth",
            trendUp: true,
            color: "green"
        },
        {
            title: "Available Rooms",
            value: availableRooms,
            icon: BedDouble,
            trend: "Low availability",
            trendUp: false,
            color: "orange"
        }
    ], [checkIns, occupancy, revenue, availableRooms]);

    return (
        <div className={styles.grid}>
            {cards.map((card, index) => (
                <motion.div
                    key={index}
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                >
                    <div className={`${styles.iconBox} ${styles[card.color]}`}>
                        <card.icon size={24} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.title}>{card.title}</span>
                        <div className={styles.valueRow}>
                            <span className={styles.value}>{card.value}</span>
                        </div>
                        <div className={styles.trendRow}>
                            <span className={`${styles.trend} ${card.trendUp ? styles.up : styles.down}`}>
                                {card.trend}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
