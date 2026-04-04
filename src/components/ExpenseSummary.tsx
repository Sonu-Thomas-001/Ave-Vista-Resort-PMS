'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './ExpenseSummary.module.css';

export interface Expense {
    date: string;
    amount: number;
}

interface ExpenseSummaryProps {
    expenses: Expense[];
    isLoading: boolean;
}

interface SummaryData {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
    previousMonthTotal: number;
}

export default function ExpenseSummary({
    expenses,
    isLoading,
}: ExpenseSummaryProps) {
    const [summary, setSummary] = useState<SummaryData>({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0,
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
        previousMonthTotal: 0,
    });

    const [displayedSummary, setDisplayedSummary] = useState<SummaryData>(summary);
    const [animatingKeys, setAnimatingKeys] = useState<string[]>([]);

    useEffect(() => {
        if (!expenses || expenses.length === 0) {
            setSummary({
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                total: 0,
                todayCount: 0,
                weekCount: 0,
                monthCount: 0,
                previousMonthTotal: 0,
            });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfPreviousMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );
        const endOfPreviousMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        );

        let todayAmount = 0,
            weekAmount = 0,
            monthAmount = 0,
            totalAmount = 0;
        let todayCount = 0,
            weekCount = 0,
            monthCount = 0;
        let previousMonthAmount = 0;

        expenses.forEach((expense) => {
            const expenseDate = new Date(expense.date);
            const amount = expense.amount;

            // Today
            if (expenseDate >= today) {
                todayAmount += amount;
                todayCount++;
            }

            // This week
            if (expenseDate >= startOfWeek) {
                weekAmount += amount;
                weekCount++;
            }

            // This month
            if (expenseDate >= startOfMonth) {
                monthAmount += amount;
                monthCount++;
            }

            // Previous month (for trend)
            if (
                expenseDate >= startOfPreviousMonth &&
                expenseDate <= endOfPreviousMonth
            ) {
                previousMonthAmount += amount;
            }

            // Total
            totalAmount += amount;
        });

        const newSummary = {
            today: todayAmount,
            thisWeek: weekAmount,
            thisMonth: monthAmount,
            total: totalAmount,
            todayCount,
            weekCount,
            monthCount,
            previousMonthTotal: previousMonthAmount,
        };

        // Trigger animation for changed values
        const changedKeys: string[] = [];
        if (newSummary.today !== summary.today) changedKeys.push('today');
        if (newSummary.thisWeek !== summary.thisWeek) changedKeys.push('week');
        if (newSummary.thisMonth !== summary.thisMonth) changedKeys.push('month');
        if (newSummary.total !== summary.total) changedKeys.push('total');

        setAnimatingKeys(changedKeys);
        setTimeout(() => setAnimatingKeys([]), 600);

        setSummary(newSummary);
        setDisplayedSummary(newSummary);
    }, [expenses]);

    const getTrendIndicator = (current: number, previous: number) => {
        if (previous === 0) return null;
        const percentChange = ((current - previous) / previous) * 100;
        return {
            trend: (current > previous ? 'up' : 'down') as 'up' | 'down',
            change: Math.abs(percentChange).toFixed(1),
        };
    };

    const monthTrend = getTrendIndicator(summary.thisMonth, summary.previousMonthTotal);

    const SummaryCard = ({
        label,
        amount,
        count,
        animationKey,
        subText,
        trend,
    }: {
        label: string;
        amount: number;
        count: number;
        animationKey: string;
        subText?: string;
        trend?: { trend: 'up' | 'down'; change: string };
    }) => (
        <div
            className={`${styles.card} ${
                animatingKeys.includes(animationKey) ? styles.animate : ''
            }`}
        >
            <div className={styles.cardHeader}>
                <h3 className={styles.cardLabel}>{label}</h3>
                {subText && <span className={styles.subText}>{subText}</span>}
            </div>

            {isLoading ? (
                <>
                    <div className={styles.skeleton} />
                    <div className={styles.skeletonSmall} />
                </>
            ) : (
                <>
                    <div className={styles.amountContainer}>
                        <span className={styles.amount}>
                            ₹{amount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        {trend && (
                            <div className={`${styles.trend} ${styles[trend.trend]}`}>
                                {trend.trend === 'up' ? (
                                    <TrendingUp size={14} />
                                ) : (
                                    <TrendingDown size={14} />
                                )}
                                <span>{trend.change}%</span>
                            </div>
                        )}
                    </div>
                    <p className={styles.count}>{count} transaction{count !== 1 ? 's' : ''}</p>
                </>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                <SummaryCard
                    label="Today's Expenses"
                    amount={displayedSummary.today}
                    count={displayedSummary.todayCount}
                    animationKey="today"
                />

                <SummaryCard
                    label="This Week"
                    amount={displayedSummary.thisWeek}
                    count={displayedSummary.weekCount}
                    animationKey="week"
                    subText={`(${new Date().getDay() === 0 ? 1 : new Date().getDay()} days)`}
                />

                <SummaryCard
                    label="This Month"
                    amount={displayedSummary.thisMonth}
                    count={displayedSummary.monthCount}
                    animationKey="month"
                    trend={monthTrend || undefined}
                />

                <SummaryCard
                    label="Total Expenses"
                    amount={displayedSummary.total}
                    count={expenses.length}
                    animationKey="total"
                    subText="All time"
                />
            </div>
        </div>
    );
}
