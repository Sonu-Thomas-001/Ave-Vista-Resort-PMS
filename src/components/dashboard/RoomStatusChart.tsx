'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './OccupancyAnalytics.module.css';

interface RoomStatusChartProps {
    data: { name: string; value: number; color: string }[];
}

export default function RoomStatusChart({ data }: RoomStatusChartProps) {
    const totalRooms = useMemo(() => {
        return (data || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [data]);

    const activeRooms = useMemo(() => {
        const occ = (data || []).find(d => d.name.toLowerCase() === 'occupied');
        return occ ? occ.value : 0;
    }, [data]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.chartTitle}>Room Status Distribution</h3>
                    <span className={styles.chartSubtitle}>Current inventory breakdown</span>
                </div>
                <div className={styles.headerMetric}>
                    <span className={styles.metricLabel}>Total Capacity</span>
                    <span className={styles.metricValue}>{totalRooms} Rooms</span>
                </div>
            </div>

            <div className={styles.donutLayout}>
                <div style={{ width: '50%', height: 250, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                cornerRadius={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    padding: '6px 12px',
                                    fontSize: '0.82rem'
                                }}
                                formatter={(value: number | undefined, name: string | undefined) => [
                                    `${value} rooms (${totalRooms > 0 ? Math.round(((value || 0) / totalRooms) * 100) : 0}%)`,
                                    name || ''
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Label */}
                    <div className={styles.donutCenter}>
                        <span className={styles.centerNumber}>{activeRooms}</span>
                        <span className={styles.centerText}>Occupied</span>
                    </div>
                </div>

                {/* Custom Legend */}
                <div className={styles.legendList}>
                    {data.map((item, idx) => {
                        const percent = totalRooms > 0 ? Math.round((item.value / totalRooms) * 100) : 0;
                        return (
                            <div key={idx} className={styles.legendItemCard}>
                                <div className={styles.legendColorDot} style={{ backgroundColor: item.color }} />
                                <span className={styles.legendItemName}>{item.name}</span>
                                <span className={styles.legendItemCount}>{item.value}</span>
                                <span className={styles.legendItemPercent}>{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
