'use client';

import { useMemo, useState } from 'react';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Calendar, FileText } from 'lucide-react';
import styles from './ExpenseAnalytics.module.css';

export interface Expense {
    date: string;
    amount: number;
    expense_categories?: {
        id: string;
        name: string;
        color: string;
    };
}

interface ExpenseAnalyticsProps {
    expenses: Expense[];
    isLoading: boolean;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface DailyData {
    date: string;
    amount: number;
}

const LUXURY_PALETTE = [
    '#0284c7',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
    '#f97316',
    '#6366f1',
];

export default function ExpenseAnalytics({
    expenses,
    isLoading,
}: ExpenseAnalyticsProps) {
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');

    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return { categoryData: [], dailyData: [] };
        }

        const now = new Date();
        let filteredExpenses = expenses;

        if (dateRange === 'week') {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            filteredExpenses = expenses.filter(
                (e) => new Date(e.date) >= sevenDaysAgo
            );
        } else if (dateRange === 'month') {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            filteredExpenses = expenses.filter(
                (e) => new Date(e.date) >= thirtyDaysAgo
            );
        }

        // Category-wise aggregation
        const categoryMap = new Map<string, { name: string; amount: number; color: string }>();

        filteredExpenses.forEach((expense) => {
            const categoryName = expense.expense_categories?.name || 'General Operations';
            const categoryId = expense.expense_categories?.id || 'general';

            if (!categoryMap.has(categoryId)) {
                const color = expense.expense_categories?.color || LUXURY_PALETTE[categoryMap.size % LUXURY_PALETTE.length];
                categoryMap.set(categoryId, {
                    name: categoryName,
                    amount: 0,
                    color,
                });
            }

            const item = categoryMap.get(categoryId)!;
            item.amount += Number(expense.amount) || 0;
        });

        const categoryData: CategoryData[] = Array.from(categoryMap.values())
            .map((item, idx) => ({
                name: item.name,
                value: Math.round(item.amount),
                color: item.color || LUXURY_PALETTE[idx % LUXURY_PALETTE.length],
            }))
            .sort((a, b) => b.value - a.value);

        // Daily aggregation
        const dailyMap = new Map<string, number>();

        filteredExpenses.forEach((expense) => {
            const dateStr = expense.date;
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + (Number(expense.amount) || 0));
        });

        const dailyData: DailyData[] = Array.from(dailyMap.entries())
            .map(([date, amount]) => ({
                date: new Date(date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                }),
                amount: Math.round(amount),
            }))
            .slice(-14); // Keep last 14 data points

        return { categoryData, dailyData };
    }, [expenses, dateRange]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <span className={styles.tooltipLabel}>{label || payload[0].name}</span>
                    <span className={styles.tooltipVal}>
                        ₹{Number(payload[0].value).toLocaleString('en-IN')}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container}>
            {/* Top Bar with Date Range Selector */}
            <div className={styles.headerCard}>
                <div className={styles.titleGroup}>
                    <BarChart3 size={18} color="#0284c7" />
                    <h3 className={styles.title}>Expense Breakdown & Trajectory</h3>
                </div>

                <div className={styles.dateRangeSelector}>
                    <button
                        className={`${styles.rangeBtn} ${dateRange === 'week' ? styles.active : ''}`}
                        onClick={() => setDateRange('week')}
                    >
                        Last 7 Days
                    </button>
                    <button
                        className={`${styles.rangeBtn} ${dateRange === 'month' ? styles.active : ''}`}
                        onClick={() => setDateRange('month')}
                    >
                        Last 30 Days
                    </button>
                    <button
                        className={`${styles.rangeBtn} ${dateRange === 'all' ? styles.active : ''}`}
                        onClick={() => setDateRange('all')}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* 2 Charts Grid */}
            <div className={styles.chartsGrid}>
                {/* 1. Category Distribution Donut Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h4 className={styles.chartTitle}>
                            <PieIcon size={15} color="#0284c7" />
                            Category Distribution
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                            {chartData.categoryData.length} categories active
                        </span>
                    </div>

                    <div className={styles.chartContainer}>
                        {chartData.categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {chartData.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIconBox}>
                                    <FileText size={22} />
                                </div>
                                <p className={styles.emptyText}>No category expenses recorded for this timeframe</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Daily Outflow Trajectory Bar Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h4 className={styles.chartTitle}>
                            <BarChart3 size={15} color="#10b981" />
                            Daily Spending Trajectory
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                            Outflow per day (₹)
                        </span>
                    </div>

                    <div className={styles.chartContainer}>
                        {chartData.dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="amount"
                                        fill="#0284c7"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIconBox}>
                                    <Calendar size={22} />
                                </div>
                                <p className={styles.emptyText}>No daily data available for selected period</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
