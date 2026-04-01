'use client';

import { useEffect, useState } from 'react';
import { Plus, Lock, AlertCircle } from 'lucide-react';
import styles from './DailyClosingReport.module.css';

interface DailyMetrics {
    revenue: number;
    expenses: number;
    netProfit: number;
    checkIns: number;
    checkOuts: number;
    roomsOccupied: number;
    roomsTotal: number;
    occupancyRate: number;
    bookingsCount: number;
}

interface DailyClosingReportProps {
    date?: string;
}

export default function DailyClosingReport({ date }: DailyClosingReportProps) {
    const [metrics, setMetrics] = useState<DailyMetrics>({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        checkIns: 0,
        checkOuts: 0,
        roomsOccupied: 0,
        roomsTotal: 0,
        occupancyRate: 0,
        bookingsCount: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSaving, setSaving] = useState(false);

    const targetDate = date || new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setIsLoading(true);

                // Fetch daily metrics
                const response = await fetch(
                    `/api/daily-closing/metrics?date=${targetDate}`,
                    { cache: 'no-store' }
                );

                if (!response.ok) throw new Error('Failed to fetch metrics');

                const data = await response.json();
                setMetrics(data.metrics || metrics);
                setNotes(data.notes || '');
                setIsLocked(data.isLocked || false);
                setError('');
            } catch (err: any) {
                console.error('Error fetching daily metrics:', err);
                setError(err.message || 'Failed to load daily closing data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [targetDate]);

    const handleSaveNotes = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/daily-closing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: targetDate,
                    notes,
                }),
            });

            if (!response.ok) throw new Error('Failed to save notes');

            alert('Daily closing saved successfully!');
        } catch (err: any) {
            alert(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading daily closing report...</div>;
    }

    const isProfit = metrics.netProfit >= 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>Daily Closing Report</h2>
                    <p className={styles.date}>
                        {new Date(targetDate).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                {isLocked && (
                    <div className={styles.lockedBadge}>
                        <Lock size={16} />
                        Locked
                    </div>
                )}
            </div>

            {error && (
                <div className={styles.error}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Metrics Grid */}
            <div className={styles.metricsGrid}>
                {/* Revenue Card */}
                <div className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>Revenue</h3>
                    <div className={styles.metricValue}>
                        ₹{metrics.revenue.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </div>
                </div>

                {/* Expenses Card */}
                <div className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>Expenses</h3>
                    <div className={styles.metricValue} style={{ color: '#ef4444' }}>
                        ₹{metrics.expenses.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className={`${styles.metricCard} ${styles.highlighted}`}>
                    <h3 className={styles.metricLabel}>Net Profit</h3>
                    <div
                        className={styles.metricValue}
                        style={{
                            color: isProfit ? '#10b981' : '#ef4444',
                        }}
                    >
                        ₹{metrics.netProfit.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </div>
                </div>
            </div>

            {/* Operations Metrics */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Operations</h3>
                <div className={styles.operationsGrid}>
                    <div className={styles.opCard}>
                        <span className={styles.opLabel}>Check-Ins</span>
                        <span className={styles.opValue}>{metrics.checkIns}</span>
                    </div>
                    <div className={styles.opCard}>
                        <span className={styles.opLabel}>Check-Outs</span>
                        <span className={styles.opValue}>{metrics.checkOuts}</span>
                    </div>
                    <div className={styles.opCard}>
                        <span className={styles.opLabel}>Rooms Occupied</span>
                        <span className={styles.opValue}>
                            {metrics.roomsOccupied}/{metrics.roomsTotal}
                        </span>
                    </div>
                    <div className={styles.opCard}>
                        <span className={styles.opLabel}>Occupancy Rate</span>
                        <span className={styles.opValue}>
                            {metrics.occupancyRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className={styles.opCard}>
                        <span className={styles.opLabel}>Total Bookings</span>
                        <span className={styles.opValue}>{metrics.bookingsCount}</span>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            {!isLocked && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Notes</h3>
                    <textarea
                        className={styles.notesInput}
                        placeholder="Add any remarks or observations for this day..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isLocked}
                    />
                    <button
                        className={styles.saveBtn}
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Daily Closing'}
                    </button>
                </div>
            )}

            {/* Profit/Loss Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>
                        {isProfit ? 'Daily Profit' : 'Daily Loss'}
                    </p>
                    <p
                        className={styles.summaryAmount}
                        style={{ color: isProfit ? '#10b981' : '#ef4444' }}
                    >
                        {isProfit ? '+' : ''}₹
                        {metrics.netProfit.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
