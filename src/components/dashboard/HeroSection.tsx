'use client';

import { useMemo } from 'react';
import { CalendarCheck, BedDouble, IndianRupee, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

interface HeroKPIProps {
    checkIns: number;
    checkOuts: number;
    occupancy: number;
    revenue: number;
    availableRooms: number;
}

export default function HeroSection({
    checkIns,
    checkOuts,
    occupancy,
    revenue,
    availableRooms
}: HeroKPIProps) {
    const cards = useMemo(() => [
        {
            id: 'checkins',
            title: "Today's Arrivals",
            value: checkIns,
            subtext: `${checkOuts} departures scheduled`,
            icon: CalendarCheck,
            badge: checkIns > 0 ? `${checkIns} Expected` : 'No arrivals',
            theme: 'sky',
            accentColor: '#0284c7'
        },
        {
            id: 'occupancy',
            title: 'Occupancy Rate',
            value: `${occupancy}%`,
            progress: occupancy,
            subtext: occupancy >= 80 ? 'Peak resort capacity' : occupancy >= 50 ? 'Steady occupancy' : 'Capacity available',
            icon: Users,
            badge: occupancy >= 70 ? 'High' : 'Moderate',
            theme: 'indigo',
            accentColor: '#6366f1'
        },
        {
            id: 'revenue',
            title: 'Collected Revenue',
            value: `₹${revenue.toLocaleString('en-IN')}`,
            subtext: 'Paid & partial invoices',
            icon: IndianRupee,
            badge: 'Live',
            theme: 'emerald',
            accentColor: '#10b981'
        },
        {
            id: 'available',
            title: 'Rooms Ready',
            value: availableRooms,
            subtext: availableRooms > 0 ? 'Clean & available' : 'Full capacity reached',
            icon: BedDouble,
            badge: availableRooms > 0 ? 'Available' : 'Booked Out',
            theme: 'amber',
            accentColor: '#f59e0b'
        }
    ], [checkIns, checkOuts, occupancy, revenue, availableRooms]);

    return (
        <section className={styles.grid}>
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.id}
                        className={`${styles.kpiCard} ${styles[card.theme]}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.08 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                        {/* Top Accent Line */}
                        <div className={`${styles.accentGlow} ${styles[`glow_${card.theme}`]}`} />

                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconBox} ${styles[`icon_${card.theme}`]}`}>
                                <Icon size={20} strokeWidth={2.2} />
                            </div>

                            <span className={`${styles.statusBadge} ${styles[`badge_${card.theme}`]}`}>
                                {card.badge}
                            </span>
                        </div>

                        <div className={styles.cardBody}>
                            <span className={styles.kpiTitle}>{card.title}</span>
                            <div className={styles.kpiValueRow}>
                                <span className={styles.kpiValue}>{card.value}</span>
                            </div>

                            {/* Progress bar for Occupancy */}
                            {typeof card.progress === 'number' && (
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                                    />
                                </div>
                            )}

                            <span className={styles.kpiSubtext}>{card.subtext}</span>
                        </div>
                    </motion.div>
                );
            })}
        </section>
    );
}
