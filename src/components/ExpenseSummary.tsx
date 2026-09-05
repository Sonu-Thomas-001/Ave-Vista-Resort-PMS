'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Calendar, Wallet, Receipt, IndianRupee } from 'lucide-react';
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
            const amount = Number(expense.amount) || 0;

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

        setSummary({
            today: todayAmount,
            thisWeek: weekAmount,
            thisMonth: monthAmount,
            total: totalAmount,
            todayCount,
            weekCount,
            monthCount,
            previousMonthTotal: previousMonthAmount,
        });
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

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* 1. Today's Expenses */}
                <div className={`${styles.card} ${styles.cardRose}`}>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardLabel}>Today's Outflow</h3>
                        {isLoading ? (
                            <>
                                <div className={styles.skeleton} />
                                <div className={styles.skeletonSmall} />
                            </>
                        ) : (
                            <>
                                <span className={styles.amount}>
                                    ₹{summary.today.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                                <div className={styles.cardFooter}>
                                    <span className={styles.countChip}>
                                        {summary.todayCount} {summary.todayCount === 1 ? 'voucher' : 'vouchers'}
                                    </span>
                                    <span>today</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={`${styles.iconBox} ${styles.iconRose}`}>
                        <Clock size={20} />
                    </div>
                </div>

                {/* 2. This Week's Expenses */}
                <div className={`${styles.card} ${styles.cardAmber}`}>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardLabel}>This Week</h3>
                        {isLoading ? (
                            <>
                                <div className={styles.skeleton} />
                                <div className={styles.skeletonSmall} />
                            </>
                        ) : (
                            <>
                                <span className={styles.amount}>
                                    ₹{summary.thisWeek.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                                <div className={styles.cardFooter}>
                                    <span className={styles.countChip}>
                                        {summary.weekCount} {summary.weekCount === 1 ? 'voucher' : 'vouchers'}
                                    </span>
                                    <span>last 7 days</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={`${styles.iconBox} ${styles.iconAmber}`}>
                        <Calendar size={20} />
                    </div>
                </div>

                {/* 3. This Month's Expenses */}
                <div className={`${styles.card} ${styles.cardPurple}`}>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardLabel}>This Month</h3>
                        {isLoading ? (
                            <>
                                <div className={styles.skeleton} />
                                <div className={styles.skeletonSmall} />
                            </>
                        ) : (
                            <>
                                <span className={styles.amount}>
                                    ₹{summary.thisMonth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                                <div className={styles.cardFooter}>
                                    {monthTrend ? (
                                        <span className={`${styles.trendBadge} ${monthTrend.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                                            {monthTrend.trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                            {monthTrend.change}% vs prev month
                                        </span>
                                    ) : (
                                        <span className={styles.countChip}>{summary.monthCount} entries</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className={`${styles.iconBox} ${styles.iconPurple}`}>
                        <Wallet size={20} />
                    </div>
                </div>

                {/* 4. Total Cumulative Expenses */}
                <div className={`${styles.card} ${styles.cardBlue}`}>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardLabel}>Cumulative Spend</h3>
                        {isLoading ? (
                            <>
                                <div className={styles.skeleton} />
                                <div className={styles.skeletonSmall} />
                            </>
                        ) : (
                            <>
                                <span className={styles.amount}>
                                    ₹{summary.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                                <div className={styles.cardFooter}>
                                    <span className={styles.countChip}>
                                        {expenses.length} total entries
                                    </span>
                                    <span>on record</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={`${styles.iconBox} ${styles.iconBlue}`}>
                        <Receipt size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}
