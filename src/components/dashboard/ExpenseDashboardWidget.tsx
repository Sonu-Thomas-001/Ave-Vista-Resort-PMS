'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, IndianRupee, TrendingDown, Receipt } from 'lucide-react';
import Link from 'next/link';
import styles from './ExpenseDashboardWidget.module.css';
import { supabase } from '@/lib/supabase';

interface Expense {
    date: string;
    amount: number;
}

export default function ExpenseDashboardWidget() {
    const [todayExpenses, setTodayExpenses] = useState(0);
    const [weekExpenses, setWeekExpenses] = useState(0);
    const [monthExpenses, setMonthExpenses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setIsLoading(true);

                let todayTotal = 0;
                let weekTotal = 0;
                let monthTotal = 0;

                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('is_deleted', false);

                if (error) throw error;
                const allExpenses = data || [];

                allExpenses.forEach((expense: Expense) => {
                    const expenseDate = new Date(expense.date);

                    if (expenseDate.toDateString() === now.toDateString()) {
                        todayTotal += expense.amount;
                    }

                    if (expenseDate >= startOfWeek && expenseDate <= now) {
                        weekTotal += expense.amount;
                    }

                    if (expenseDate >= startOfMonth && expenseDate <= now) {
                        monthTotal += expense.amount;
                    }
                });

                setTodayExpenses(todayTotal);
                setWeekExpenses(weekTotal);
                setMonthExpenses(monthTotal);
                setError('');
            } catch (err: any) {
                console.error('Error fetching expenses:', err);
                setError('Failed to load expense data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h3 className={styles.title}>Expense Outflows</h3>
                        <span className={styles.subtitle}>Operational cost overview</span>
                    </div>
                </div>
                <div className={styles.skeletonContainer}>
                    <div className={styles.skeletonBox} />
                    <div className={styles.skeletonBox} />
                    <div className={styles.skeletonBox} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>Expense Outflows</h3>
                    <span className={styles.subtitle}>Operational cost overview</span>
                </div>
                <div className={styles.headerIcon}>
                    <Receipt size={18} />
                </div>
            </div>

            {error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.statsGrid}>
                        {/* Today */}
                        <div className={styles.statCapsule}>
                            <div className={styles.statLabelRow}>
                                <span className={styles.statDotOrange} />
                                <span className={styles.label}>Today</span>
                            </div>
                            <span className={styles.amount}>
                                ₹{todayExpenses.toLocaleString('en-IN', {
                                    maximumFractionDigits: 0
                                })}
                            </span>
                            <span className={styles.statHelper}>Disbursed today</span>
                        </div>

                        {/* This Week */}
                        <div className={styles.statCapsule}>
                            <div className={styles.statLabelRow}>
                                <span className={styles.statDotSky} />
                                <span className={styles.label}>This Week</span>
                            </div>
                            <span className={styles.amount}>
                                ₹{weekExpenses.toLocaleString('en-IN', {
                                    maximumFractionDigits: 0
                                })}
                            </span>
                            <span className={styles.statHelper}>Weekly outflow</span>
                        </div>

                        {/* This Month */}
                        <div className={styles.statCapsule}>
                            <div className={styles.statLabelRow}>
                                <span className={styles.statDotAmber} />
                                <span className={styles.label}>This Month</span>
                            </div>
                            <span className={styles.amount}>
                                ₹{monthExpenses.toLocaleString('en-IN', {
                                    maximumFractionDigits: 0
                                })}
                            </span>
                            <span className={styles.statHelper}>Month-to-date</span>
                        </div>
                    </div>

                    <Link href="/expenses" className={styles.ctaButton}>
                        <span>Open Expense Ledger & Reports</span>
                        <ArrowUpRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
}
