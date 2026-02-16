'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, PieChart, Activity, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('Revenue');
    const [dateRange, setDateRange] = useState('This Month');
    const [loading, setLoading] = useState(true);

    // Data States
    const [revenueStats, setRevenueStats] = useState<any>({
        total: 0,
        growth: 0,
        byMethod: {},
        byType: { Advance: 0, Final: 0 }
    });
    const [occupancyStats, setOccupancyStats] = useState<any>({ rate: 0, growth: 0, byRoomType: [] });
    const [guestStats, setGuestStats] = useState<any>({ total: 0, new: 0, repeat: 0, vip: 0 });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = new Date();
            let prevStartDate = new Date();
            let prevEndDate = new Date();

            // Calculate Date Ranges
            if (dateRange === 'Today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === 'This Week') {
                startDate.setDate(now.getDate() - now.getDay()); // Sunday
            } else if (dateRange === 'This Month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
            } else if (dateRange === 'Last 3 Months') {
                startDate.setMonth(now.getMonth() - 3);
            }

            const startStr = startDate.toISOString();
            const endStr = now.toISOString();

            // --- 1. Revenue Data ---
            const { data: invoices } = await supabase
                .from('invoices')
                .select('*')
                .gte('created_at', startStr)
                .lte('created_at', endStr);

            const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0) || 0;

            // Revenue Breakdown
            const byMethod: Record<string, number> = {};
            const byType: Record<string, number> = { Advance: 0, Final: 0 };

            invoices?.forEach(inv => {
                const method = inv.payment_mode || 'Cash';
                byMethod[method] = (byMethod[method] || 0) + (Number(inv.paid_amount) || 0);

                if (inv.is_partial) {
                    byType.Advance += (Number(inv.paid_amount) || 0);
                } else {
                    byType.Final += (Number(inv.paid_amount) || 0);
                }
            });

            // Previous Month Revenue for Growth
            let revenueGrowth = 0;
            if (dateRange === 'This Month') {
                const { data: prevInvoices } = await supabase
                    .from('invoices')
                    .select('paid_amount')
                    .gte('created_at', prevStartDate.toISOString())
                    .lte('created_at', prevEndDate.toISOString());
                const prevRevenue = prevInvoices?.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0) || 0;
                if (prevRevenue > 0) revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
            }

            setRevenueStats({ total: totalRevenue, growth: Math.round(revenueGrowth), byMethod, byType });


            // --- 2. Occupancy Data ---
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*, rooms(type, room_number)')
                .in('status', ['Checked In', 'Checked Out'])
                .gte('check_in_date', startStr);

            const { count: totalRooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true });

            // Occupancy Rate
            const activeBookingsCount = bookings?.length || 0;
            const daysInRange = dateRange === 'Today' ? 1 : dateRange === 'This Week' ? 7 : 30;
            const totalAvailableRoomNights = (totalRooms || 10) * daysInRange;
            const occupancyRate = totalAvailableRoomNights > 0 ? (activeBookingsCount / totalAvailableRoomNights) * 100 : 0;

            // Room Type Breakdown
            const roomTypeCount: Record<string, number> = {};
            bookings?.forEach((b: any) => {
                const type = b.rooms?.type || 'Standard';
                roomTypeCount[type] = (roomTypeCount[type] || 0) + 1;
            });
            const byRoomType = Object.entries(roomTypeCount).map(([type, count]) => ({ type, count, percentage: Math.round((count / (bookings?.length || 1)) * 100) }));

            setOccupancyStats({ rate: Math.min(Math.round(occupancyRate), 100), growth: 5, byRoomType });


            // --- 3. Guest Data ---
            // Fetch UNIQUE guests who booked in this period
            const uniqueGuestIds = new Set(bookings?.map(b => b.guest_id));
            const totalGuests = uniqueGuestIds.size;

            let newGuests = 0;
            let repeatGuests = 0;
            let vipGuests = 0;

            if (totalGuests > 0) {
                const { data: guestDetails } = await supabase
                    .from('guests')
                    .select('id, created_at, is_vip')
                    .in('id', Array.from(uniqueGuestIds));

                guestDetails?.forEach(g => {
                    if (g.is_vip) vipGuests++;
                    // If created in this range, consider NEW, else REPEAT
                    if (new Date(g.created_at) >= startDate) newGuests++;
                    else repeatGuests++;
                });
            }

            setGuestStats({ total: totalGuests, new: newGuests, repeat: repeatGuests, vip: vipGuests });

            // --- 4. Recent Transactions (Global) ---
            const { data: recentTx } = await supabase
                .from('invoices')
                .select('*, bookings(guests(first_name, last_name), rooms(room_number))')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentTransactions(recentTx || []);

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // ... (Keep existing export logic)
        const headers = ['Invoice Number', 'Date', 'Amount', 'Guest', 'Room'];
        const rows = recentTransactions.map(tx => [
            tx.invoice_number,
            new Date(tx.created_at).toLocaleDateString(),
            tx.paid_amount,
            `${tx.bookings?.guests?.first_name || ''} ${tx.bookings?.guests?.last_name || ''}`,
            tx.bookings?.rooms?.room_number || 'N/A'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Header title="Reports & Analytics" />

            <div className={styles.container}>
                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        {['Revenue', 'Occupancy', 'Guests'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <select
                            className={styles.select}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                        </select>
                        <button className={styles.exportBtn} onClick={handleExport}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={styles.content}>

                    {/* --- REVENUE TAB --- */}
                    {activeTab === 'Revenue' && (
                        <div className={styles.tabContent}>
                            {/* Summary Cards */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.green}`}>
                                        <DollarSign size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Total Revenue</span>
                                        <span className={styles.statValue}>₹{revenueStats.total.toLocaleString()}</span>
                                        <span className={styles.statTrend}>
                                            <TrendingUp size={12} /> {revenueStats.growth}% vs last period
                                        </span>
                                    </div>
                                </div>
                                {/* Add more cards if needed, e.g. RevPAR */}
                            </div>

                            <div className={styles.chartsGrid}>
                                {/* Payment Methods */}
                                <div className={styles.chartCard}>
                                    <h3>Payment Methods</h3>
                                    <div className={styles.barList}>
                                        {Object.entries(revenueStats.byMethod).map(([method, amount]: [string, any]) => (
                                            <div key={method} className={styles.barItem}>
                                                <div className={styles.barLabel}>
                                                    <CreditCard size={14} /> {method}
                                                </div>
                                                <div className={styles.barValue}>₹{amount.toLocaleString()}</div>
                                                <div className={styles.progressBar}>
                                                    <div style={{ width: `${(amount / (revenueStats.total || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Types */}
                                <div className={styles.chartCard}>
                                    <h3>Payment Breakdown</h3>
                                    <div className={styles.donutChart}>
                                        <div className={styles.donutSegment}>
                                            <span className={styles.donutLabel}>Advance</span>
                                            <span className={styles.donutValue}>₹{(revenueStats.byType?.Advance || 0).toLocaleString()}</span>
                                        </div>
                                        <div className={styles.donutSegment}>
                                            <span className={styles.donutLabel}>Final Settlement</span>
                                            <span className={styles.donutValue}>₹{(revenueStats.byType?.Final || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Tx Table */}
                            <div className={styles.tableCard}>
                                <h3>Recent Transactions</h3>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Guest</th>
                                            <th>Amount</th>
                                            <th>Mode</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((tx) => (
                                            <tr key={tx.id}>
                                                <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                                                <td>{tx.bookings?.guests?.first_name} {tx.bookings?.guests?.last_name}</td>
                                                <td>₹{Number(tx.paid_amount).toLocaleString()}</td>
                                                <td>{tx.payment_mode}</td>
                                                <td><span className={styles.tag}>{tx.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- OCCUPANCY TAB --- */}
                    {activeTab === 'Occupancy' && (
                        <div className={styles.tabContent}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.blue}`}>
                                        <Activity size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Occupancy Rate</span>
                                        <span className={styles.statValue}>{occupancyStats.rate}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chartCard}>
                                <h3>Room Type Performance</h3>
                                <div className={styles.listChart}>
                                    {occupancyStats.byRoomType.map((item: any, idx: number) => (
                                        <div key={idx} className={styles.listItem}>
                                            <div className={styles.listLabel}>
                                                <span>{item.type}</span>
                                                <span>{item.percentage}%</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- GUESTS TAB --- */}
                    {activeTab === 'Guests' && (
                        <div className={styles.tabContent}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.purple}`}>
                                        <Users size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Total Guests</span>
                                        <span className={styles.statValue}>{guestStats.total}</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.orange}`}>
                                        <PieChart size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>New vs Repeat</span>
                                        <span className={styles.statSub}>{guestStats.new} New / {guestStats.repeat} Returning</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
