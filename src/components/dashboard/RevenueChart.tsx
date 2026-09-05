'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './OccupancyAnalytics.module.css';

interface RevenueChartProps {
    data: { date: string; value: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const totalWeek = useMemo(() => {
        return (data || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [data]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.chartTitle}>Revenue Performance</h3>
                    <span className={styles.chartSubtitle}>Last 7 days collections</span>
                </div>
                <div className={styles.headerMetric}>
                    <span className={styles.metricLabel}>Period Total</span>
                    <span className={styles.metricValue}>₹{totalWeek.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
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
                            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
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
                            itemStyle={{ color: '#34d399', fontWeight: 600 }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '2px', fontSize: '0.74rem' }}
                            formatter={(value: number | undefined) => [
                                `₹${(value || 0).toLocaleString('en-IN')}`,
                                'Revenue'
                            ] as [string, string]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#revenueGrad)"
                            dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                            activeDot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
