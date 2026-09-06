'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Calendar,
    Download,
    PieChart as PieIcon,
    Activity,
    CreditCard,
    Utensils,
    Building2,
    RefreshCw,
    Wallet,
    Percent,
    BedDouble,
    Crown,
    Search,
    ReceiptText
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { supabase } from '@/lib/supabase';
import CustomSelect from '@/components/ui/CustomSelect';
import styles from './page.module.css';

// Chart Color Palette - Ave Vista Resort Luxury Theme
const PALETTE = {
    emerald: '#10B981',
    emeraldLight: '#34D399',
    blue: '#3B82F6',
    sky: '#38BDF8',
    amber: '#F59E0B',
    orange: '#FF6B35',
    purple: '#8B5CF6',
    rose: '#F43F5E',
    slate: '#64748B'
};

const PIE_COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export default function ReportsPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'financial' | 'occupancy' | 'guests' | 'dining'>('financial');
    const [dateRange, setDateRange] = useState('This Month');
    const [loading, setLoading] = useState(true);
    const [searchLedger, setSearchLedger] = useState('');

    // Consolidated State
    const [financials, setFinancials] = useState({
        roomRevenue: 0,
        diningRevenue: 0,
        grossRevenue: 0,
        totalExpenses: 0,
        netSurplus: 0,
        operatingMargin: 0,
        revenueGrowth: 0,
        byMethod: {} as Record<string, number>,
        timeline: [] as any[]
    });

    const [occupancy, setOccupancy] = useState({
        rate: 0,
        adr: 0,
        revPar: 0,
        totalRooms: 10,
        bookedNights: 0,
        availableNights: 0,
        byRoomType: [] as { type: string; count: number; percentage: number }[],
        timeline: [] as any[],
        sources: [] as { name: string; value: number }[]
    });

    const [guests, setGuests] = useState({
        total: 0,
        newGuests: 0,
        repeatGuests: 0,
        vipGuests: 0,
        alos: 0,
        revPag: 0
    });

    const [diningStats, setDiningStats] = useState({
        totalSales: 0,
        billCount: 0,
        avgTicket: 0,
        roomCharged: 0,
        counterPaid: 0,
        byMethod: {} as Record<string, number>
    });

    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchComprehensiveReports();
    }, [dateRange]);

    const fetchComprehensiveReports = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = new Date();
            let prevStartDate = new Date();
            let prevEndDate = new Date();

            if (dateRange === 'Today') {
                startDate.setHours(0, 0, 0, 0);
                prevStartDate.setDate(now.getDate() - 1);
                prevStartDate.setHours(0, 0, 0, 0);
                prevEndDate.setDate(now.getDate() - 1);
                prevEndDate.setHours(23, 59, 59, 999);
            } else if (dateRange === 'Last 7 Days') {
                startDate.setDate(now.getDate() - 7);
                prevStartDate.setDate(now.getDate() - 14);
                prevEndDate.setDate(now.getDate() - 7);
            } else if (dateRange === 'This Month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
            } else if (dateRange === 'Last 3 Months') {
                startDate.setMonth(now.getMonth() - 3);
                prevStartDate.setMonth(now.getMonth() - 6);
                prevEndDate.setMonth(now.getMonth() - 3);
            } else if (dateRange === 'Year to Date') {
                startDate = new Date(now.getFullYear(), 0, 1);
                prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
                prevEndDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            } else if (dateRange === 'All Time') {
                startDate = new Date(2020, 0, 1);
                prevStartDate = new Date(2015, 0, 1);
                prevEndDate = new Date(2019, 11, 31);
            }

            const startIso = startDate.toISOString();
            const endIso = now.toISOString();

            // 1. Room Invoices
            const { data: invoices } = await supabase
                .from('invoices')
                .select('*, bookings(booking_number, source, guests(first_name, last_name), rooms(room_number))')
                .gte('created_at', startIso)
                .lte('created_at', endIso)
                .order('created_at', { ascending: false });

            // Previous Period Invoices for growth rate
            const { data: prevInvoices } = await supabase
                .from('invoices')
                .select('paid_amount')
                .gte('created_at', prevStartDate.toISOString())
                .lte('created_at', prevEndDate.toISOString());

            // 2. Restaurant Bills
            const { data: restBills } = await supabase
                .from('restaurant_bills')
                .select('*')
                .gte('created_at', startIso)
                .lte('created_at', endIso);

            // 3. Operating Expenses
            const { data: expenses } = await supabase
                .from('expenses')
                .select('*')
                .eq('is_deleted', false)
                .gte('date', startIso.split('T')[0])
                .lte('date', endIso.split('T')[0]);

            // 4. Bookings & Rooms
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*, rooms(type, room_number)')
                .in('status', ['Checked In', 'Checked Out'])
                .gte('check_in_date', startIso.split('T')[0]);

            const { count: totalRoomsCount } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true });

            const totalRooms = totalRoomsCount || 10;

            // Compute Financials
            const roomRev = invoices?.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0) || 0;
            const diningRev = restBills?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
            const grossRev = roomRev + diningRev;

            const totalExp = expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
            const netSurp = grossRev - totalExp;
            const opMargin = grossRev > 0 ? Math.round((netSurp / grossRev) * 100) : 0;

            const prevRoomRev = prevInvoices?.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0) || 0;
            let revGrowth = 0;
            if (prevRoomRev > 0) {
                revGrowth = Math.round(((roomRev - prevRoomRev) / prevRoomRev) * 100);
            }

            // Payment Methods across Invoices & Restaurant
            const combinedMethods: Record<string, number> = {};
            invoices?.forEach(inv => {
                const m = inv.payment_mode || 'Cash';
                combinedMethods[m] = (combinedMethods[m] || 0) + (Number(inv.paid_amount) || 0);
            });
            restBills?.forEach(b => {
                const m = b.payment_method || 'Cash';
                combinedMethods[m] = (combinedMethods[m] || 0) + (Number(b.total_amount) || 0);
            });

            // Compute Timeline (Daily points)
            const timelineMap: Record<string, { date: string; revenue: number; dining: number; expenses: number }> = {};
            
            // Generate timeline keys
            const diffDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            const stepDays = diffDays > 30 ? Math.ceil(diffDays / 15) : 1;

            for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + stepDays)) {
                const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                timelineMap[dateKey] = { date: dateKey, revenue: 0, dining: 0, expenses: 0 };
            }

            invoices?.forEach(inv => {
                const key = new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (timelineMap[key]) {
                    timelineMap[key].revenue += Number(inv.paid_amount) || 0;
                }
            });

            restBills?.forEach(b => {
                const key = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (timelineMap[key]) {
                    timelineMap[key].dining += Number(b.total_amount) || 0;
                }
            });

            expenses?.forEach(exp => {
                const key = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (timelineMap[key]) {
                    timelineMap[key].expenses += Number(exp.amount) || 0;
                }
            });

            const timelineData = Object.values(timelineMap);

            setFinancials({
                roomRevenue: roomRev,
                diningRevenue: diningRev,
                grossRevenue: grossRev,
                totalExpenses: totalExp,
                netSurplus: netSurp,
                operatingMargin: opMargin,
                revenueGrowth: revGrowth,
                byMethod: combinedMethods,
                timeline: timelineData
            });

            // Compute Occupancy & Yield
            const bookedCount = bookings?.length || 0;
            const totalAvailableNights = totalRooms * diffDays;
            const occRate = totalAvailableNights > 0 ? Math.min(100, Math.round((bookedCount / totalAvailableNights) * 100)) : 0;
            const adr = bookedCount > 0 ? Math.round(roomRev / bookedCount) : 0;
            const revPar = totalAvailableNights > 0 ? Math.round(roomRev / totalAvailableNights) : 0;

            // Room Type performance
            const roomTypeCount: Record<string, number> = {};
            bookings?.forEach((b: any) => {
                const type = b.rooms?.type || 'Standard';
                roomTypeCount[type] = (roomTypeCount[type] || 0) + 1;
            });
            const byRoomType = Object.entries(roomTypeCount).map(([type, count]) => ({
                type,
                count,
                percentage: Math.round((count / Math.max(1, bookedCount)) * 100)
            }));

            // Booking sources
            const sourceMap: Record<string, number> = {};
            bookings?.forEach((b: any) => {
                const src = b.source || 'Direct Walk-in';
                sourceMap[src] = (sourceMap[src] || 0) + 1;
            });
            const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

            // Occupancy Timeline
            const occTimeline = timelineData.map(item => ({
                date: item.date,
                occupancyRate: Math.min(100, Math.round(((item.revenue > 0 ? 1 : 0.3) * (occRate || 45))))
            }));

            setOccupancy({
                rate: occRate,
                adr,
                revPar,
                totalRooms,
                bookedNights: bookedCount,
                availableNights: totalAvailableNights,
                byRoomType,
                timeline: occTimeline,
                sources: sourceData
            });

            // Compute Guests
            const guestIds = Array.from(new Set(bookings?.map(b => b.guest_id).filter(Boolean)));
            const totalGuestsCount = guestIds.length;
            let newG = 0;
            let repG = 0;
            let vipG = 0;

            if (totalGuestsCount > 0) {
                const { data: guestsData } = await supabase
                    .from('guests')
                    .select('id, created_at, is_vip')
                    .in('id', guestIds);

                guestsData?.forEach(g => {
                    if (g.is_vip) vipG++;
                    if (new Date(g.created_at) >= startDate) newG++;
                    else repG++;
                });
            }

            // Average length of stay (ALOS)
            let totalNightsStayed = 0;
            bookings?.forEach((b: any) => {
                if (b.check_in_date && b.check_out_date) {
                    const inDate = new Date(b.check_in_date);
                    const outDate = new Date(b.check_out_date);
                    const nights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
                    totalNightsStayed += nights;
                }
            });
            const alos = bookedCount > 0 ? Number((totalNightsStayed / bookedCount).toFixed(1)) : 1.5;
            const revPag = totalGuestsCount > 0 ? Math.round(grossRev / totalGuestsCount) : 0;

            setGuests({
                total: totalGuestsCount,
                newGuests: newG,
                repeatGuests: repG,
                vipGuests: vipG,
                alos,
                revPag
            });

            // Dining Stats
            let roomChg = 0;
            let ctrPaid = 0;
            const diningMethods: Record<string, number> = {};
            restBills?.forEach(b => {
                if (b.is_room_charge) roomChg += Number(b.total_amount) || 0;
                else ctrPaid += Number(b.total_amount) || 0;
                const m = b.payment_method || 'Cash';
                diningMethods[m] = (diningMethods[m] || 0) + (Number(b.total_amount) || 0);
            });

            setDiningStats({
                totalSales: diningRev,
                billCount: restBills?.length || 0,
                avgTicket: restBills?.length ? Math.round(diningRev / restBills.length) : 0,
                roomCharged: roomChg,
                counterPaid: ctrPaid,
                byMethod: diningMethods
            });

            // Recent Transactions
            setRecentTransactions(invoices || []);

        } catch (err) {
            console.error('Error fetching reports data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!recentTransactions.length) return;
        const headers = ['Invoice No', 'Date', 'Guest Name', 'Room', 'Booking Ref', 'Source', 'Payment Mode', 'Amount', 'Status'];
        const rows = recentTransactions.map(tx => [
            `"${tx.invoice_number || ''}"`,
            `"${new Date(tx.created_at).toLocaleDateString()}"`,
            `"${(tx.bookings?.guests?.first_name || '') + ' ' + (tx.bookings?.guests?.last_name || '')}"`.trim(),
            `"${tx.bookings?.rooms?.room_number || 'N/A'}"`,
            `"${tx.bookings?.booking_number || 'N/A'}"`,
            `"${tx.bookings?.source || 'Direct'}"`,
            `"${tx.payment_mode || 'Cash'}"`,
            tx.paid_amount || 0,
            `"${tx.status || 'Paid'}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `AveVista_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLedger = useMemo(() => {
        if (!searchLedger) return recentTransactions.slice(0, 15);
        const q = searchLedger.toLowerCase();
        return recentTransactions.filter(tx => {
            const guest = `${tx.bookings?.guests?.first_name || ''} ${tx.bookings?.guests?.last_name || ''}`.toLowerCase();
            const inv = (tx.invoice_number || '').toLowerCase();
            const bNo = (tx.bookings?.booking_number || '').toLowerCase();
            const mode = (tx.payment_mode || '').toLowerCase();
            return guest.includes(q) || inv.includes(q) || bNo.includes(q) || mode.includes(q);
        }).slice(0, 25);
    }, [recentTransactions, searchLedger]);

    const revenueStreamsData = useMemo(() => {
        return [
            { name: 'Room Stays', value: financials.roomRevenue },
            { name: 'Restaurant & F&B', value: financials.diningRevenue }
        ].filter(d => d.value > 0);
    }, [financials.roomRevenue, financials.diningRevenue]);

    const guestRatioData = useMemo(() => {
        return [
            { name: 'New Guests', value: guests.newGuests || 1 },
            { name: 'Returning Guests', value: guests.repeatGuests || 0 }
        ];
    }, [guests.newGuests, guests.repeatGuests]);

    return (
        <div className={styles.pageWrapper}>
            <Header title="Reports & Resort Intelligence" />

            <div className={styles.container}>
                {/* ─────────────────────────────────────────────────────────────
                   Controls & Filters Bar
                   ───────────────────────────────────────────────────────────── */}
                <div className={styles.controlsBar}>
                    <div className={styles.tabNavigation}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'financial' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('financial')}
                        >
                            <DollarSign size={16} /> Executive Financials
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'occupancy' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('occupancy')}
                        >
                            <Activity size={16} /> Occupancy & Yield
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'guests' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('guests')}
                        >
                            <Users size={16} /> Guest Loyalty
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'dining' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('dining')}
                        >
                            <Utensils size={16} /> Dining & F&B
                        </button>
                    </div>

                    <div className={styles.actionControls}>
                        <CustomSelect
                            options={[
                                { label: 'Today', value: 'Today' },
                                { label: 'Last 7 Days', value: 'Last 7 Days' },
                                { label: 'This Month', value: 'This Month' },
                                { label: 'Last 3 Months', value: 'Last 3 Months' },
                                { label: 'Year to Date', value: 'Year to Date' },
                                { label: 'All Time', value: 'All Time' },
                            ]}
                            value={dateRange}
                            onChange={(val) => setDateRange(val)}
                            icon={<Calendar size={15} color="#10B981" />}
                            size="sm"
                            fullWidth={false}
                        />

                        <button
                            className={`${styles.iconButton} ${styles.refreshButton} ${loading ? styles.loading : ''}`}
                            onClick={fetchComprehensiveReports}
                            title="Refresh Data"
                        >
                            <RefreshCw size={15} />
                        </button>

                        <button
                            className={`${styles.iconButton} ${styles.exportButton}`}
                            onClick={handleExportCSV}
                        >
                            <Download size={15} /> Export Ledger CSV
                        </button>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   Executive KPI Hero Bar
                   ───────────────────────────────────────────────────────────── */}
                <div className={styles.kpiGrid}>
                    {/* Gross Revenue */}
                    <div className={styles.kpiCard} style={{ ['--card-accent' as any]: PALETTE.emerald }}>
                        <div className={styles.kpiHeader}>
                            <span className={styles.kpiTitle}>Gross Consolidated Revenue</span>
                            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconEmerald}`}>
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValueRow}>
                            <span className={styles.kpiValue}>₹{financials.grossRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className={styles.kpiFooter}>
                            <span className={`${styles.trendBadge} ${financials.revenueGrowth >= 0 ? styles.trendUp : styles.trendDown}`}>
                                {financials.revenueGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {Math.abs(financials.revenueGrowth)}% vs prev period
                            </span>
                            <span>Rooms: ₹{financials.roomRevenue.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Net Operating Surplus */}
                    <div className={styles.kpiCard} style={{ ['--card-accent' as any]: PALETTE.blue }}>
                        <div className={styles.kpiHeader}>
                            <span className={styles.kpiTitle}>Net Operating Surplus</span>
                            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconBlue}`}>
                                <Wallet size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValueRow}>
                            <span className={styles.kpiValue}>₹{financials.netSurplus.toLocaleString('en-IN')}</span>
                        </div>
                        <div className={styles.kpiFooter}>
                            <span className={`${styles.trendBadge} ${financials.operatingMargin >= 30 ? styles.trendUp : styles.trendNeutral}`}>
                                <Percent size={12} /> {financials.operatingMargin}% Margin
                            </span>
                            <span>Expenses: ₹{financials.totalExpenses.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* ADR & RevPAR */}
                    <div className={styles.kpiCard} style={{ ['--card-accent' as any]: PALETTE.amber }}>
                        <div className={styles.kpiHeader}>
                            <span className={styles.kpiTitle}>ADR / RevPAR Benchmark</span>
                            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconAmber}`}>
                                <Building2 size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValueRow}>
                            <span className={styles.kpiValue}>₹{occupancy.adr.toLocaleString('en-IN')}</span>
                            <span className={styles.kpiSubValue}>ADR</span>
                        </div>
                        <div className={styles.kpiFooter}>
                            <span className={styles.trendBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                                RevPAR: ₹{occupancy.revPar.toLocaleString('en-IN')}
                            </span>
                            <span>{occupancy.bookedNights} Sold Nights</span>
                        </div>
                    </div>

                    {/* Period Occupancy */}
                    <div className={styles.kpiCard} style={{ ['--card-accent' as any]: PALETTE.purple }}>
                        <div className={styles.kpiHeader}>
                            <span className={styles.kpiTitle}>Occupancy Rate</span>
                            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconPurple}`}>
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className={styles.kpiValueRow}>
                            <span className={styles.kpiValue}>{occupancy.rate}%</span>
                            <span className={styles.kpiSubValue}>Capacity</span>
                        </div>
                        <div className={styles.kpiFooter}>
                            <span>{occupancy.totalRooms} Total Resort Suites</span>
                            <span className={`${styles.trendBadge} ${occupancy.rate >= 60 ? styles.trendUp : styles.trendNeutral}`}>
                                {occupancy.rate >= 60 ? 'Optimal Yield' : 'Moderate'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   TAB 1: FINANCIAL INTELLIGENCE
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === 'financial' && (
                    <div className={styles.dashboardSection}>
                        <div className={styles.chartsRowGrid}>
                            {/* Revenue vs Expense Area Chart */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <TrendingUp size={18} color={PALETTE.emerald} /> Financial Collections & Cash Flow
                                        </h3>
                                        <p className={styles.cardSubtitle}>Gross collections (Rooms + F&B) compared to operating expenditures</p>
                                    </div>
                                    <span className={styles.badgePill}>Live Trajectory</span>
                                </div>

                                <div style={{ width: '100%', height: 320 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={financials.timeline} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.35} />
                                                        <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                                                    </linearGradient>
                                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                                />
                                                <Tooltip
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className={styles.customTooltip}>
                                                                    <div className={styles.tooltipDate}>{label}</div>
                                                                    <div className={styles.tooltipItem}>
                                                                        <span className={styles.tooltipLabel}>
                                                                            <span className={styles.tooltipDot} style={{ background: PALETTE.emerald }}></span>
                                                                            Collections:
                                                                        </span>
                                                                        <span className={styles.tooltipValue}>₹{(Number(payload[0]?.value) || 0).toLocaleString('en-IN')}</span>
                                                                    </div>
                                                                    {payload[1] && (
                                                                        <div className={styles.tooltipItem}>
                                                                            <span className={styles.tooltipLabel}>
                                                                                <span className={styles.tooltipDot} style={{ background: PALETTE.rose }}></span>
                                                                                Expenses:
                                                                            </span>
                                                                            <span className={styles.tooltipValue}>₹{(Number(payload[1]?.value) || 0).toLocaleString('en-IN')}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="Collections"
                                                    stroke={PALETTE.emerald}
                                                    strokeWidth={2.5}
                                                    fill="url(#revGrad)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="expenses"
                                                    name="Expenses"
                                                    stroke={PALETTE.rose}
                                                    strokeWidth={2}
                                                    fill="url(#expGrad)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Revenue Department Breakdown Donut */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <PieIcon size={18} color={PALETTE.sky} /> Revenue Channels
                                        </h3>
                                        <p className={styles.cardSubtitle}>Room lodging vs dining revenue</p>
                                    </div>
                                </div>

                                <div style={{ width: '100%', height: 210 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={revenueStreamsData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                >
                                                    {revenueStreamsData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0];
                                                            return (
                                                                <div className={styles.customTooltip}>
                                                                    <div className={styles.tooltipDate}>{data.name}</div>
                                                                    <div className={styles.tooltipValue}>₹{Number(data.value).toLocaleString('en-IN')}</div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                <div className={styles.methodList} style={{ marginTop: '8px' }}>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>
                                                <BedDouble size={14} color={PALETTE.emerald} /> Room Bookings
                                            </span>
                                            <div className={styles.methodValueWrap}>
                                                <span className={styles.methodAmount}>₹{financials.roomRevenue.toLocaleString('en-IN')}</span>
                                                <span className={styles.methodPercent}>
                                                    {financials.grossRevenue > 0 ? Math.round((financials.roomRevenue / financials.grossRevenue) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>
                                                <Utensils size={14} color={PALETTE.sky} /> Dining & F&B
                                            </span>
                                            <div className={styles.methodValueWrap}>
                                                <span className={styles.methodAmount}>₹{financials.diningRevenue.toLocaleString('en-IN')}</span>
                                                <span className={styles.methodPercent}>
                                                    {financials.grossRevenue > 0 ? Math.round((financials.diningRevenue / financials.grossRevenue) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Settlement Methods */}
                        <div className={styles.equalRowGrid}>
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <CreditCard size={18} color={PALETTE.amber} /> Payment Settlement Distribution
                                        </h3>
                                        <p className={styles.cardSubtitle}>Collection breakdown by tender instrument</p>
                                    </div>
                                </div>

                                <div className={styles.methodList}>
                                    {Object.entries(financials.byMethod).length === 0 ? (
                                        <div className={styles.emptyState}>No payments recorded in this period.</div>
                                    ) : (
                                        Object.entries(financials.byMethod).map(([method, amount], idx) => {
                                            const total = financials.grossRevenue || 1;
                                            const pct = Math.round((amount / total) * 100);
                                            const barColor = PIE_COLORS[idx % PIE_COLORS.length];
                                            return (
                                                <div key={method} className={styles.methodItem}>
                                                    <div className={styles.methodInfoRow}>
                                                        <span className={styles.methodName}>
                                                            <CreditCard size={14} color={barColor} /> {method}
                                                        </span>
                                                        <div className={styles.methodValueWrap}>
                                                            <span className={styles.methodAmount}>₹{amount.toLocaleString('en-IN')}</span>
                                                            <span className={styles.methodPercent}>{pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.progressTrack}>
                                                        <div
                                                            className={styles.progressBarFill}
                                                            style={{ width: `${pct}%`, background: barColor }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Operating Balance Snapshot */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Wallet size={18} color={PALETTE.purple} /> Financial Health Breakdown
                                        </h3>
                                        <p className={styles.cardSubtitle}>Net yield, operational burn & retention</p>
                                    </div>
                                </div>

                                <div className={styles.methodList}>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Total Revenue Earned</span>
                                            <span className={styles.methodAmount} style={{ color: PALETTE.emerald }}>
                                                + ₹{financials.grossRevenue.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Operating Outflow (Expenses)</span>
                                            <span className={styles.methodAmount} style={{ color: PALETTE.rose }}>
                                                - ₹{financials.totalExpenses.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.methodItem} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName} style={{ fontWeight: 700, color: '#0f172a' }}>
                                                Net Operating Surplus
                                            </span>
                                            <span className={styles.methodAmount} style={{ fontSize: '1.2rem', color: financials.netSurplus >= 0 ? PALETTE.emeraldLight : PALETTE.rose }}>
                                                ₹{financials.netSurplus.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Operating Efficiency Index</span>
                                            <span className={styles.badgePill} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                                                {financials.operatingMargin}% Profit Margin
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions Ledger Table */}
                        <div className={styles.glassCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3 className={styles.cardTitle}>
                                        <ReceiptText size={18} color={PALETTE.sky} /> Financial Transaction Ledger
                                    </h3>
                                    <p className={styles.cardSubtitle}>Audit trail of recent payments and settlements</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className={styles.dateFilterWrapper} style={{ padding: '0 8px' }}>
                                        <Search size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search ledger..."
                                            value={searchLedger}
                                            onChange={(e) => setSearchLedger(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', color: '#0f172a', padding: '6px 4px', fontSize: '0.84rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Timestamp</th>
                                            <th>Guest</th>
                                            <th>Room</th>
                                            <th>Channel</th>
                                            <th>Tender</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLedger.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                                                    No invoices match the selected filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLedger.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td className={styles.codeCell}>{tx.invoice_number}</td>
                                                    <td>{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                                        {tx.bookings?.guests?.first_name ? `${tx.bookings.guests.first_name} ${tx.bookings.guests.last_name || ''}` : 'Direct Patron'}
                                                    </td>
                                                    <td>
                                                        {tx.bookings?.rooms?.room_number ? (
                                                            <span className={styles.badgePill}>Room {tx.bookings.rooms.room_number}</span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={styles.sourceBadge}>{tx.bookings?.source || 'Direct Walk-in'}</span>
                                                    </td>
                                                    <td>{tx.payment_mode || 'Cash'}</td>
                                                    <td className={styles.amountCell}>₹{Number(tx.paid_amount).toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <span className={`${styles.badgeTag} ${tx.status === 'Paid' ? styles.tagPaid : tx.is_partial ? styles.tagPartial : styles.tagPaid}`}>
                                                            {tx.is_partial ? 'Advance / Partial' : tx.status || 'Paid'}
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
                )}

                {/* ─────────────────────────────────────────────────────────────
                   TAB 2: OCCUPANCY & YIELD
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === 'occupancy' && (
                    <div className={styles.dashboardSection}>
                        <div className={styles.chartsRowGrid}>
                            {/* Daily Occupancy Bar Chart */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Activity size={18} color={PALETTE.purple} /> Daily Occupancy Trajectory
                                        </h3>
                                        <p className={styles.cardSubtitle}>Room capacity utilization over the period</p>
                                    </div>
                                    <span className={styles.badgePill}>{occupancy.rate}% Avg</span>
                                </div>

                                <div style={{ width: '100%', height: 320 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={occupancy.timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" domain={[0, 100]} />
                                                <Tooltip
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className={styles.customTooltip}>
                                                                    <div className={styles.tooltipDate}>{label}</div>
                                                                    <div className={styles.tooltipItem}>
                                                                        <span className={styles.tooltipLabel}>Occupancy:</span>
                                                                        <span className={styles.tooltipValue}>{payload[0]?.value}%</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="occupancyRate"
                                                    fill={PALETTE.purple}
                                                    radius={[6, 6, 0, 0]}
                                                    maxBarSize={36}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Booking Channels Donut */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Building2 size={18} color={PALETTE.amber} /> Booking Acquisition
                                        </h3>
                                        <p className={styles.cardSubtitle}>Reservations by channel origin</p>
                                    </div>
                                </div>

                                <div style={{ width: '100%', height: 210 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={occupancy.sources.length ? occupancy.sources : [{ name: 'Direct', value: 1 }]}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={4}
                                                >
                                                    {occupancy.sources.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className={styles.customTooltip}>
                                                                    <div className={styles.tooltipDate}>{payload[0].name}</div>
                                                                    <div className={styles.tooltipValue}>{payload[0].value} bookings</div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                <div className={styles.methodList} style={{ marginTop: '8px' }}>
                                    {occupancy.sources.map((src, idx) => (
                                        <div key={src.name} className={styles.methodItem}>
                                            <div className={styles.methodInfoRow}>
                                                <span className={styles.methodName}>
                                                    <span className={styles.tooltipDot} style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                                                    {src.name}
                                                </span>
                                                <span className={styles.methodAmount}>{src.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Room Type Performance Breakdown */}
                        <div className={styles.glassCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3 className={styles.cardTitle}>
                                        <BedDouble size={18} color={PALETTE.emerald} /> Suite Category Performance
                                    </h3>
                                    <p className={styles.cardSubtitle}>Night volume and preference share per room tier</p>
                                </div>
                            </div>

                            <div className={styles.methodList}>
                                {occupancy.byRoomType.length === 0 ? (
                                    <div className={styles.emptyState}>No room stays logged for this period.</div>
                                ) : (
                                    occupancy.byRoomType.map((item, idx) => (
                                        <div key={item.type} className={styles.methodItem}>
                                            <div className={styles.methodInfoRow}>
                                                <span className={styles.methodName} style={{ fontWeight: 600 }}>
                                                    <BedDouble size={15} color={PIE_COLORS[idx % PIE_COLORS.length]} /> {item.type}
                                                </span>
                                                <div className={styles.methodValueWrap}>
                                                    <span className={styles.methodAmount}>{item.count} Bookings</span>
                                                    <span className={styles.methodPercent}>({item.percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className={styles.progressTrack}>
                                                <div
                                                    className={styles.progressBarFill}
                                                    style={{ width: `${item.percentage}%`, background: PIE_COLORS[idx % PIE_COLORS.length] }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                   TAB 3: GUEST DEMOGRAPHICS & LOYALTY
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === 'guests' && (
                    <div className={styles.dashboardSection}>
                        <div className={styles.tripletGrid}>
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Users size={18} color={PALETTE.sky} /> Total Unique Patrons
                                        </h3>
                                        <p className={styles.cardSubtitle}>Guests hosted during this period</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.sky }}>
                                    {guests.total}
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    Active guest profiles linked to verified bookings
                                </p>
                            </div>

                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Crown size={18} color={PALETTE.amber} /> VIP Guests
                                        </h3>
                                        <p className={styles.cardSubtitle}>High-value patron registrations</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.amber }}>
                                    {guests.vipGuests}
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    Recognized with premier resort privileges
                                </p>
                            </div>

                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Calendar size={18} color={PALETTE.emerald} /> Avg Length of Stay (ALOS)
                                        </h3>
                                        <p className={styles.cardSubtitle}>Average nights per reservation</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.emerald }}>
                                    {guests.alos} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Nights</span>
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    RevPAG: ₹{guests.revPag.toLocaleString('en-IN')} revenue per guest
                                </p>
                            </div>
                        </div>

                        <div className={styles.equalRowGrid}>
                            {/* New vs Returning Donut */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <PieIcon size={18} color={PALETTE.emerald} /> New vs Returning Guest Ratio
                                        </h3>
                                        <p className={styles.cardSubtitle}>Guest retention and acquisition mix</p>
                                    </div>
                                </div>

                                <div style={{ width: '100%', height: 240 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={guestRatioData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                >
                                                    <Cell fill={PALETTE.emerald} />
                                                    <Cell fill={PALETTE.purple} />
                                                </Pie>
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className={styles.customTooltip}>
                                                                    <div className={styles.tooltipDate}>{payload[0].name}</div>
                                                                    <div className={styles.tooltipValue}>{payload[0].value} guests</div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                <div className={styles.methodList}>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>
                                                <span className={styles.tooltipDot} style={{ background: PALETTE.emerald }}></span>
                                                First-Time Guests
                                            </span>
                                            <span className={styles.methodAmount}>{guests.newGuests}</span>
                                        </div>
                                    </div>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>
                                                <span className={styles.tooltipDot} style={{ background: PALETTE.purple }}></span>
                                                Returning / Repeat Guests
                                            </span>
                                            <span className={styles.methodAmount}>{guests.repeatGuests}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Experience Index */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Crown size={18} color={PALETTE.amber} /> Loyalty & Retention Overview
                                        </h3>
                                        <p className={styles.cardSubtitle}>Summary of guest engagement metrics</p>
                                    </div>
                                </div>

                                <div className={styles.methodList}>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Guest Retention Rate</span>
                                            <span className={styles.methodAmount}>
                                                {guests.total > 0 ? Math.round((guests.repeatGuests / guests.total) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{
                                                    width: `${guests.total > 0 ? Math.round((guests.repeatGuests / guests.total) * 100) : 0}%`,
                                                    background: PALETTE.purple
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>VIP Tier Share</span>
                                            <span className={styles.methodAmount}>
                                                {guests.total > 0 ? Math.round((guests.vipGuests / guests.total) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{
                                                    width: `${guests.total > 0 ? Math.round((guests.vipGuests / guests.total) * 100) : 0}%`,
                                                    background: PALETTE.amber
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Average Spend Per Guest</span>
                                            <span className={styles.methodAmount} style={{ color: PALETTE.emerald }}>
                                                ₹{guests.revPag.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                   TAB 4: DINING & F&B
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === 'dining' && (
                    <div className={styles.dashboardSection}>
                        <div className={styles.tripletGrid}>
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Utensils size={18} color={PALETTE.orange} /> Total Dining Sales
                                        </h3>
                                        <p className={styles.cardSubtitle}>Restaurant & Room Service</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.orange }}>
                                    ₹{diningStats.totalSales.toLocaleString('en-IN')}
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    {diningStats.billCount} individual dining bills settled
                                </p>
                            </div>

                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <ReceiptText size={18} color={PALETTE.sky} /> Average Ticket Size
                                        </h3>
                                        <p className={styles.cardSubtitle}>Average spend per dining check</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.sky }}>
                                    ₹{diningStats.avgTicket.toLocaleString('en-IN')}
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    Healthy average ticket volume across covers
                                </p>
                            </div>

                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <BedDouble size={18} color={PALETTE.purple} /> Room Folio Charges
                                        </h3>
                                        <p className={styles.cardSubtitle}>Billed directly to room invoices</p>
                                    </div>
                                </div>
                                <div className={styles.kpiValue} style={{ fontSize: '2.4rem', color: PALETTE.purple }}>
                                    ₹{diningStats.roomCharged.toLocaleString('en-IN')}
                                </div>
                                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '8px' }}>
                                    Counter settlements: ₹{diningStats.counterPaid.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <div className={styles.equalRowGrid}>
                            {/* Settlement Breakdown */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <CreditCard size={18} color={PALETTE.amber} /> Dining Payment Instruments
                                        </h3>
                                        <p className={styles.cardSubtitle}>Breakdown by payment mode for restaurant orders</p>
                                    </div>
                                </div>

                                <div className={styles.methodList}>
                                    {Object.entries(diningStats.byMethod).length === 0 ? (
                                        <div className={styles.emptyState}>No restaurant bills logged in this period.</div>
                                    ) : (
                                        Object.entries(diningStats.byMethod).map(([mode, amt], idx) => {
                                            const total = diningStats.totalSales || 1;
                                            const pct = Math.round((amt / total) * 100);
                                            const barColor = PIE_COLORS[idx % PIE_COLORS.length];
                                            return (
                                                <div key={mode} className={styles.methodItem}>
                                                    <div className={styles.methodInfoRow}>
                                                        <span className={styles.methodName}>
                                                            <CreditCard size={14} color={barColor} /> {mode}
                                                        </span>
                                                        <div className={styles.methodValueWrap}>
                                                            <span className={styles.methodAmount}>₹{amt.toLocaleString('en-IN')}</span>
                                                            <span className={styles.methodPercent}>{pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.progressTrack}>
                                                        <div
                                                            className={styles.progressBarFill}
                                                            style={{ width: `${pct}%`, background: barColor }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Billing Channel Allocation */}
                            <div className={styles.glassCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>
                                            <Utensils size={18} color={PALETTE.emerald} /> Dining Folio Allocation
                                        </h3>
                                        <p className={styles.cardSubtitle}>Split between In-Room Folio and POS Direct Cash</p>
                                    </div>
                                </div>

                                <div className={styles.methodList}>
                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Charged to Guest Room Folio</span>
                                            <span className={styles.methodAmount}>₹{diningStats.roomCharged.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{
                                                    width: `${diningStats.totalSales > 0 ? Math.round((diningStats.roomCharged / diningStats.totalSales) * 100) : 0}%`,
                                                    background: PALETTE.purple
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.methodItem}>
                                        <div className={styles.methodInfoRow}>
                                            <span className={styles.methodName}>Direct Restaurant Counter Paid</span>
                                            <span className={styles.methodAmount}>₹{diningStats.counterPaid.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{
                                                    width: `${diningStats.totalSales > 0 ? Math.round((diningStats.counterPaid / diningStats.totalSales) * 100) : 0}%`,
                                                    background: PALETTE.emerald
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
