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
}

interface DailyData {
    date: string;
    amount: number;
}

export default function ExpenseAnalytics({
    expenses,
    isLoading,
}: ExpenseAnalyticsProps) {
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');

    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return { categoryData: [], dailyData: [] };
        }

        // Filter by date range
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

        // Category-wise data for pie chart
        const categoryMap = new Map<string, { name: string; amount: number; color: string }>();

        filteredExpenses.forEach((expense) => {
            const categoryName = expense.expense_categories?.name || 'Unknown';
            const categoryId = expense.expense_categories?.id || 'unknown';

            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    name: categoryName,
                    amount: 0,
                    color: expense.expense_categories?.color || '#6B7280',
                });
            }

            const category = categoryMap.get(categoryId)!;
            category.amount += expense.amount;
        });

        const categoryData: CategoryData[] = Array.from(categoryMap.values())
            .map(c => ({ name: c.name, value: c.amount, color: c.color }))
            .sort((a, b) => b.value - a.value);

        // Daily trend data for bar chart
        const dailyMap = new Map<string, number>();

        filteredExpenses.forEach((expense) => {
            const date = new Date(expense.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
            });

            dailyMap.set(date, (dailyMap.get(date) || 0) + expense.amount);
        });

        // Sort by date
        const dailyData: DailyData[] = Array.from(dailyMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        return { categoryData, dailyData };
    }, [expenses, dateRange]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Loading analytics...</div>
            </div>
        );
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <p>No data to display</p>
                    <p className={styles.subtext}>
                        Add expenses to see analytics
                    </p>
                </div>
            </div>
        );
    }

    const totalAmount = chartData.categoryData.reduce((sum, cat) => sum + cat.value, 0);

    return (
        <div className={styles.container}>
            {/* Date Range Selector */}
            <div className={styles.header}>
                <h2 className={styles.title}>Expense Analytics</h2>
                <div className={styles.dateRangeSelector}>
                    {(['week', 'month', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            className={`${styles.rangeBtn} ${
                                dateRange === range ? styles.active : ''
                            }`}
                            onClick={() => setDateRange(range)}
                        >
                            {range === 'week'
                                ? 'Last 7 Days'
                                : range === 'month'
                                ? 'Last 30 Days'
                                : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGrid}>
                {/* Category-wise Pie Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Expenses by Category</h3>
                    {chartData.categoryData.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => {
                                            const percent = (
                                                (value / totalAmount) *
                                                100
                                            ).toFixed(0);
                                            return `${name} (${percent}%)`;
                                        }}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.categoryData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) =>
                                            `₹${Number(value || 0).toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                            })}`
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={styles.noData}>No category data</div>
                    )}

                    {/* Category Legend */}
                    <div className={styles.categoryLegend}>
                        {chartData.categoryData.map((category, idx) => (
                            <div key={idx} className={styles.legendItem}>
                                <div
                                    className={styles.legendColor}
                                    style={{ backgroundColor: category.color }}
                                />
                                <div className={styles.legendInfo}>
                                    <span className={styles.legendName}>
                                        {category.name}
                                    </span>
                                    <span className={styles.legendAmount}>
                                        ₹
                                        {category.value.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily Trend Bar Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Daily Expense Trend</h3>
                    {chartData.dailyData.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.dailyData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e7eb"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) =>
                                            `₹${(value / 1000).toFixed(0)}K`
                                        }
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) =>
                                            `₹${Number(value || 0).toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                            })}`
                                        }
                                        labelStyle={{ color: '#1f2937' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="#10b981"
                                        radius={[8, 8, 0, 0]}
                                        animationDuration={800}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={styles.noData}>No daily data</div>
                    )}
                </div>
            </div>

            {/* Summary Statistics */}
            <div className={styles.statistics}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Expenses</span>
                    <span className={styles.statValue}>
                        ₹{totalAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Categories</span>
                    <span className={styles.statValue}>
                        {chartData.categoryData.length}
                    </span>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Highest Category</span>
                    <span className={styles.statValue}>
                        {chartData.categoryData[0]?.name || 'N/A'}
                    </span>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Average Daily</span>
                    <span className={styles.statValue}>
                        ₹{(totalAmount / (chartData.dailyData.length || 1)).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
