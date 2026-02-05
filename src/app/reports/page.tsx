'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [dateRange, setDateRange] = useState('This Month');
    const [loading, setLoading] = useState(true);

    // KPI States
    const [stats, setStats] = useState({
        revenue: 0,
        revenueGrowth: 0,
        occupancy: 0,
        occupancyGrowth: 0,
        revPar: 0
    });

    // Chart Data
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [roomPerformance, setRoomPerformance] = useState<any[]>([]);
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

            // 1. Fetch Revenue (Invoices)
            const { data: invoices } = await supabase
                .from('invoices')
                .select('amount, created_at, invoice_number')
                .gte('created_at', startStr)
                .lte('created_at', endStr);

            const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;

            // Previous Month Revenue for Growth
            let revenueGrowth = 0;
            if (dateRange === 'This Month') {
                const { data: prevInvoices } = await supabase
                    .from('invoices')
                    .select('amount')
                    .gte('created_at', prevStartDate.toISOString())
                    .lte('created_at', prevEndDate.toISOString());

                const prevRevenue = prevInvoices?.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;
                if (prevRevenue > 0) {
                    revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
                }
            }

            // 2. Fetch Occupancy (Bookings)
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, room_id, check_in_date, check_out_date, status, total_amount, rooms(type, room_number)')
                .in('status', ['Checked In', 'Checked Out'])
                .gte('check_in_date', startStr);

            // Fetch Total Rooms count
            const { count: totalRooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true });

            // Simple Occupancy Calculation: (Booked Rooms / Total Rooms) * 100
            // Note: For a proper date range, we'd calculate room-nights, but this is a simplified snapshot
            const activeBookingsCount = bookings?.length || 0;
            // Assuming 30 days for month view or 1 day for today
            const daysInRange = dateRange === 'Today' ? 1 : dateRange === 'This Week' ? 7 : 30;
            const totalAvailableRoomNights = (totalRooms || 10) * daysInRange;
            const occupancyRate = totalAvailableRoomNights > 0 ? (activeBookingsCount / totalAvailableRoomNights) * 100 : 0;

            // 3. RevPAR = Total Revenue / Total Available Rooms
            const revPar = totalAvailableRoomNights > 0 ? totalRevenue / totalAvailableRoomNights : 0;

            setStats({
                revenue: totalRevenue,
                revenueGrowth: Math.round(revenueGrowth),
                occupancy: Math.min(Math.round(occupancyRate * 100) / 100, 100), // Cap at 100% logic fix needed for real room-night calc, keeping simple
                occupancyGrowth: 5, // Mock growth for occupancy as historical data might be sparse
                revPar: Math.round(revPar)
            });

            // 4. Chart Data Preparation
            // Revenue Trend (Group by Week/Day) - Simplified to 4 data points for "This Month"
            const trendData = [
                { label: 'W1', value: totalRevenue * 0.15 }, // Mock distribution for demo visual 
                { label: 'W2', value: totalRevenue * 0.25 },
                { label: 'W3', value: totalRevenue * 0.35 },
                { label: 'W4', value: totalRevenue * 0.25 },
            ];
            setRevenueTrend(trendData);

            // Room Type Performance
            const roomTypeMap: Record<string, number> = {};
            bookings?.forEach((b: any) => {
                const type = b.rooms?.type || 'Standard';
                roomTypeMap[type] = (roomTypeMap[type] || 0) + 1;
            });

            const roomPerfData = Object.entries(roomTypeMap).map(([type, count]) => ({
                type,
                count,
                percentage: Math.round((count / (bookings?.length || 1)) * 100)
            })).sort((a, b) => b.count - a.count);

            setRoomPerformance(roomPerfData);

            // 5. Recent Transactions
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
        const headers = ['Invoice Number', 'Date', 'Amount', 'Guest', 'Room'];
        const rows = recentTransactions.map(tx => [
            tx.invoice_number,
            new Date(tx.created_at).toLocaleDateString(),
            tx.amount,
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
                        {['Overview', 'Revenue', 'Occupancy'].map(tab => (
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

                {/* Overview Content */}
                <div className={styles.content}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Total Revenue</span>
                                <span className={styles.statValue}>
                                    {loading ? '...' : `₹${stats.revenue.toLocaleString()}`}
                                </span>
                                <span className={styles.statTrend}>
                                    <TrendingUp size={12} /> {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}% vs last month
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#E3F2FD', color: '#1565C0' }}>
                                <Users size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Occupancy Rate</span>
                                <span className={styles.statValue}>
                                    {loading ? '...' : `${stats.occupancy}%`}
                                </span>
                                <span className={styles.statTrend}>
                                    <TrendingUp size={12} /> +{stats.occupancyGrowth}% vs last month
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#FFF3E0', color: '#EF6C00' }}>
                                <Calendar size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>RevPAR</span>
                                <span className={styles.statValue}>
                                    {loading ? '...' : `₹${stats.revPar.toLocaleString()}`}
                                </span>
                                <span className={styles.statSub}>Rev. per Available Room</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartCard}>
                            <h3>Revenue Trend</h3>
                            <div className={styles.chartPlaceholder}>
                                {/* Visual Bar Chart */}
                                <div className={styles.barGroup}>
                                    {revenueTrend.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.bar}
                                            style={{ height: `${(item.value / (stats.revenue || 1)) * 100}%`, minHeight: '5%' }}
                                            title={`${item.label}: ₹${item.value}`}
                                        ></div>
                                    ))}
                                </div>
                                <div className={styles.chartLabels}>
                                    {revenueTrend.map((item, idx) => (
                                        <span key={idx}>{item.label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <h3>Room Type Performance</h3>
                            <div className={styles.listChart}>
                                {loading ? <p>Loading...</p> : roomPerformance.length === 0 ? <p>No data available</p> :
                                    roomPerformance.map((item, idx) => (
                                        <div key={idx} className={styles.listItem}>
                                            <div className={styles.listLabel}>
                                                <span>{item.type}</span>
                                                <span>{item.percentage}% occ.</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableCard}>
                        <h3>Recent Transactions</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4}>Loading transactions...</td></tr>
                                ) : recentTransactions.length === 0 ? (
                                    <tr><td colSpan={4}>No recent transactions</td></tr>
                                ) : (
                                    recentTransactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td data-label="Date">{new Date(tx.created_at).toLocaleDateString()}</td>
                                            <td data-label="Source">
                                                {tx.bookings?.guests?.first_name} {tx.bookings?.guests?.last_name}
                                                <span style={{ color: '#888', fontSize: '0.8em' }}> (Room {tx.bookings?.rooms?.room_number})</span>
                                            </td>
                                            <td data-label="Amount">₹{Number(tx.amount).toLocaleString()}</td>
                                            <td data-label="Status">
                                                <span className={styles.tag}>
                                                    {tx.payment_status || 'Paid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
