'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './OccupancyAnalytics.module.css';

interface CheckInOutChartProps {
    data: { date: string; checkIns: number; checkOuts: number }[];
}

export default function CheckInOutChart({ data }: CheckInOutChartProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.chartTitle}>Guest Flow: Arrivals & Departures</h3>
                    <span className={styles.chartSubtitle}>Daily check-in and check-out volume</span>
                </div>
                <div className={styles.legendCapsule}>
                    <div className={styles.legendBadge}>
                        <span className={styles.legendDotBlue} />
                        <span>Check-ins</span>
                    </div>
                    <div className={styles.legendBadge}>
                        <span className={styles.legendDotEmerald} />
                        <span>Check-outs</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                        barGap={6}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: 'none',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3)',
                                color: '#ffffff',
                                padding: '8px 12px',
                                fontSize: '0.82rem'
                            }}
                            cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                        />
                        <Bar
                            dataKey="checkIns"
                            fill="#0284c7"
                            radius={[6, 6, 0, 0]}
                            name="Check-ins"
                            maxBarSize={28}
                        />
                        <Bar
                            dataKey="checkOuts"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                            name="Check-outs"
                            maxBarSize={28}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
