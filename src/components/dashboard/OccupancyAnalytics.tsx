'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './OccupancyAnalytics.module.css';

interface OccupancyAnalyticsProps {
    data: { day: string; value: number }[];
}

export default function OccupancyAnalytics({ data }: OccupancyAnalyticsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const chartData = data || [];

    const avgOccupancy = useMemo(() => {
        if (!chartData.length) return 0;
        const sum = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
        return Math.round(sum / chartData.length);
    }, [chartData]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.chartTitle}>7-Day Occupancy Trend</h3>
                    <span className={styles.chartSubtitle}>Resort capacity utilization</span>
                </div>
                <div className={styles.headerMetric}>
                    <span className={styles.metricLabel}>7-Day Average</span>
                    <span className={styles.metricValue}>{avgOccupancy}%</span>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <div className={styles.bars}>
                    {chartData.map((item, index) => (
                        <div
                            key={index}
                            className={styles.barGroup}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className={styles.barWrapper}>
                                <motion.div
                                    className={styles.bar}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(4, item.value)}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.08, type: "spring" }}
                                >
                                    {hoveredIndex === index && (
                                        <motion.div
                                            className={styles.tooltip}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {item.value}%
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                            <span className={styles.label}>{item.day}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.gridLines}>
                    <div className={styles.line} />
                    <div className={styles.line} />
                    <div className={styles.line} />
                    <div className={styles.line} />
                    <div className={styles.line} />
                </div>
            </div>
        </div>
    );
}
