'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './OccupancyAnalytics.module.css';

const mockData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 58 },
    { day: 'Wed', value: 72 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 92 },
    { day: 'Sat', value: 98 },
    { day: 'Sun', value: 88 },
];

export default function OccupancyAnalytics() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Occupancy Trends</h3>
                <div className={styles.legend}>
                    <span className={styles.legendItem}><span className={styles.dot}></span> Occupied</span>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <div className={styles.bars}>
                    {mockData.map((item, index) => (
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
                                    animate={{ height: `${item.value}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, type: "spring" }}
                                >
                                    {hoveredIndex === index && (
                                        <motion.div
                                            className={styles.tooltip}
                                            initial={{ opacity: 0, y: 10 }}
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
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>
            </div>
        </div>
    );
}
