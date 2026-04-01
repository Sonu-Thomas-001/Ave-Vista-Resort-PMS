'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './ExpenseDashboardWidget.module.css';

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
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(
                    `/api/expenses?startDate=${today}&endDate=${today}`,
                    { cache: 'no-store' }
                );

                if (!response.ok) throw new Error('Failed to fetch expenses');

                const data = await response.json();
                const expenses = data.expenses || [];

                // Calculate totals
                let todayTotal = 0;
                let weekTotal = 0;
                let monthTotal = 0;

                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                // Fetch all expenses for week and month calculation
                const allExpensesResponse = await fetch('/api/expenses', {
                    cache: 'no-store',
                });
                if (allExpensesResponse.ok) {
                    const allData = await allExpensesResponse.json();
                    const allExpenses = allData.expenses || [];

                    allExpenses.forEach((expense: Expense) => {
                        const expenseDate = new Date(expense.date);

                        // Today
                        if (expenseDate.toDateString() === now.toDateString()) {
                            todayTotal += expense.amount;
                        }

                        // Week
                        if (expenseDate >= startOfWeek && expenseDate <= now) {
                            weekTotal += expense.amount;
                        }

                        // Month
                        if (expenseDate >= startOfMonth && expenseDate <= now) {
                            monthTotal += expense.amount;
                        }
                    });
                }

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

    const handleCardClick = (path: string) => {
        window.location.href = path;
    };

    if (isLoading) {
        return (
            <div className={styles.card}>
                <h3 className={styles.title}>Expenses</h3>
                <div className={styles.skeleton} />
            </div>
        );
    }

    return (
        <div
            className={styles.card}
            onClick={() => handleCardClick('/expenses')}
        >
            <h3 className={styles.title}>Expenses</h3>

            {error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.stat}>
                        <span className={styles.label}>Today</span>
                        <span className={styles.amount}>
                            ₹{todayExpenses.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.stat}>
                        <span className={styles.label}>This Week</span>
                        <span className={styles.amount}>
                            ₹{weekExpenses.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.stat}>
                        <span className={styles.label}>This Month</span>
                        <span className={styles.amount}>
                            ₹{monthExpenses.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className={styles.cta}>
                        View Expense Analytics →
                    </div>
                </div>
            )}
        </div>
    );
}
