'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import styles from './OccupancyAnalytics.module.css';

interface CheckInOutChartProps {
    data: { date: string; checkIns: number; checkOuts: number }[];
}

export default function CheckInOutChart({ data }: CheckInOutChartProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Check-ins vs Check-outs</h3>
                <div className={styles.legend}>
                    <span className={styles.legendItem} style={{ color: '#3b82f6' }}>
                        <span className={styles.dot} style={{ backgroundColor: '#3b82f6' }}></span> Check-ins
                    </span>
                    <span className={styles.legendItem} style={{ color: '#10b981', marginLeft: '12px' }}>
                        <span className={styles.dot} style={{ backgroundColor: '#10b981' }}></span> Check-outs
                    </span>
                </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Bar
                            dataKey="checkIns"
                            fill="#3b82f6"
                            radius={[8, 8, 0, 0]}
                            name="Check-ins"
                        />
                        <Bar
                            dataKey="checkOuts"
                            fill="#10b981"
                            radius={[8, 8, 0, 0]}
                            name="Check-outs"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
