'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Header from '@/components/Header';
import {
    Download,
    Eye,
    FileText,
    X,
    Pencil,
    Search,
    Filter,
    IndianRupee,
    CreditCard,
    Banknote,
    QrCode,
    CheckCircle2,
    AlertCircle,
    Clock,
    TrendingUp,
    Receipt,
    Building2,
    Calendar,
    User,
    Sparkles,
    RefreshCw,
    Percent,
    ExternalLink,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    LogIn,
    LogOut,
    BedDouble,
    Lock,
    Unlock,
    Check,
    Key
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import { InvoicePreviewModal } from '@/components/ui/InvoicePreviewModal';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';

const PAYMENT_MODE_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Payment Modes' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
];

const SOURCE_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Booking Channels' },
    { value: 'Direct', label: 'Direct' },
    { value: 'OTA', label: 'OTA' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Complementary', label: 'Complementary' },
];

const INVOICE_STATUS_OPTIONS = [
    { value: 'Paid', label: 'Paid (Fully Settled)', color: '#10B981' },
    { value: 'Partial', label: 'Partial Settlement', color: '#F59E0B' },
    { value: 'Pending', label: 'Pending (Unsettled)', color: '#EF4444' },
];

const PAYMENT_INSTRUMENT_OPTIONS = [
    { value: '', label: 'Select Instrument' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Card / POS' },
    { value: 'UPI', label: 'UPI / QR Transfer' },
];

type EditableInvoice = Invoice & {
    booking?: any;
    booking_source?: string;
};

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface InvoiceWithDetails extends Invoice {
    booking?: any;
    guest?: any;
}

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<'Invoices' | 'DailyReport'>('Invoices');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithDetails | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<EditableInvoice | null>(null);
    const [pendingUpdate, setPendingUpdate] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [modeFilter, setModeFilter] = useState<string>('ALL');
    const [sourceFilter, setSourceFilter] = useState<string>('ALL');

    // Daily Closing & Reconciliation State
    const [closingDate, setClosingDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [closingMetrics, setClosingMetrics] = useState({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        checkIns: 0,
        checkOuts: 0,
        roomsOccupied: 0,
        roomsTotal: 10,
        occupancyRate: 0,
        bookingsCount: 0,
    });
    const [closingNotes, setClosingNotes] = useState('');
    const [closingIsLocked, setClosingIsLocked] = useState(false);
    const [closingLoading, setClosingLoading] = useState(false);
    const [closingSaving, setClosingSaving] = useState(false);
    const [closingSuccessMsg, setClosingSuccessMsg] = useState<string | null>(null);

    const fetchDailyClosing = async (dateStr: string) => {
        setClosingLoading(true);
        try {
            const res = await fetch(`/api/daily-closing/metrics?date=${dateStr}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const apiMetrics = data.metrics || {};

                // Reconcile with live invoices matching this date
                const dayInvoices = invoices.filter((inv) => (inv.invoice_date || inv.created_at || '').startsWith(dateStr));
                const liveRevenue = dayInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
                const resolvedRevenue = Math.max(apiMetrics.revenue || 0, liveRevenue);
                const expenses = apiMetrics.expenses || 0;
                const netProfit = resolvedRevenue - expenses;

                setClosingMetrics({
                    revenue: resolvedRevenue,
                    expenses,
                    netProfit,
                    checkIns: apiMetrics.checkIns || 0,
                    checkOuts: apiMetrics.checkOuts || 0,
                    roomsOccupied: apiMetrics.roomsOccupied || 0,
                    roomsTotal: apiMetrics.roomsTotal || 10,
                    occupancyRate: apiMetrics.occupancyRate || (apiMetrics.roomsTotal ? (apiMetrics.roomsOccupied / apiMetrics.roomsTotal) * 100 : 0),
                    bookingsCount: apiMetrics.bookingsCount || dayInvoices.length,
                });
                setClosingNotes(data.notes || '');
                setClosingIsLocked(data.isLocked || false);
            }
        } catch (e) {
            console.error('Failed to fetch daily closing metrics:', e);
        } finally {
            setClosingLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'DailyReport') {
            fetchDailyClosing(closingDate);
        }
    }, [activeTab, closingDate, invoices]);

    const handleSaveClosingNotes = async () => {
        setClosingSaving(true);
        setClosingSuccessMsg(null);
        try {
            const response = await fetch('/api/daily-closing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: closingDate,
                    notes: closingNotes,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save daily closing');
            }

            setClosingSuccessMsg('Daily closing record & handover remarks saved successfully!');
            setTimeout(() => setClosingSuccessMsg(null), 4000);
        } catch (err: any) {
            alert(err.message || 'Failed to save daily closing record');
        } finally {
            setClosingSaving(false);
        }
    };

    const handleShiftDate = (days: number) => {
        const current = new Date(closingDate);
        current.setDate(current.getDate() + days);
        setClosingDate(current.toISOString().split('T')[0]);
    };

    useEffect(() => {
        fetchInvoices();
        fetchBookings();

        // Polling for real-time updates every 15 seconds
        const interval = setInterval(() => {
            fetchInvoices();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const getReadableFetchError = (error: any) => {
        const message = error?.message || '';
        if (message.includes('Failed to fetch')) {
            return 'Unable to connect to Supabase right now. Please check your internet connection or Supabase settings.';
        }
        return message || 'Failed to load data.';
    };

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*, booking:bookings(booking_number, source)')
                .order('invoice_date', { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
            setFetchError(null);
        } catch (error: any) {
            console.warn('Invoice fetch failed:', error?.message || error);
            setFetchError(getReadableFetchError(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    guest_id,
                    room_id,
                    booking_number,
                    source,
                    check_in_date,
                    check_out_date,
                    room_rate,
                    extra_pax,
                    extra_pax_rate,
                    guests(first_name, last_name, email, phone, company_name, gst_number, address),
                    rooms(room_number, type)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            console.warn('Bookings fetch failed:', error?.message || error);
            setFetchError((current) => current || getReadableFetchError(error));
        }
    };

    const autoInvoiceStatus = (paidAmount: number, totalAmount: number) => {
        if (paidAmount >= totalAmount && totalAmount > 0) return 'Paid';
        if (paidAmount > 0) return 'Partial';
        return 'Pending';
    };

    const calculateInvoiceGstAmount = (totalAmount: number, gstRate: number) => {
        return (Number(totalAmount || 0) * Number(gstRate || 0)) / 100;
    };

    const openEditInvoice = (invoice: any) => {
        const linkedBooking = bookings.find((item) => item.id === invoice.booking_id);
        setEditingInvoice({
            ...invoice,
            booking: linkedBooking || invoice.booking,
            booking_source: linkedBooking?.source || invoice.booking?.source || 'Direct',
            guest_email: linkedBooking?.guests?.email || '',
            guest_phone: linkedBooking?.guests?.phone || '',
            guest_company_name: linkedBooking?.guests?.company_name || '',
            guest_gst_number: linkedBooking?.guests?.gst_number || '',
            guest_address: linkedBooking?.guests?.address || '',
            check_in_date: linkedBooking?.check_in_date || '',
            check_out_date: linkedBooking?.check_out_date || '',
            room_type: linkedBooking?.rooms?.type || '',
            room_rate: linkedBooking?.room_rate ?? 0,
            extra_pax: linkedBooking?.extra_pax ?? 0,
            extra_pax_rate: linkedBooking?.extra_pax_rate ?? 600,
        });
    };

    const handleUpdateInvoice = async () => {
        if (!editingInvoice) return;
        setPendingUpdate(true);

        const nextStatus = autoInvoiceStatus(Number(editingInvoice.paid_amount || 0), Number(editingInvoice.total_amount || 0));
        const resolvedStatus = editingInvoice.status || nextStatus;
        const resolvedIsPartial = editingInvoice.is_partial ?? (resolvedStatus === 'Partial');

        const { error } = await supabase
            .from('invoices')
            .update({
                invoice_number: editingInvoice.invoice_number,
                booking_id: editingInvoice.booking_id || null,
                guest_name: editingInvoice.guest_name,
                room_number: editingInvoice.room_number,
                invoice_date: editingInvoice.invoice_date,
                total_amount: editingInvoice.total_amount,
                paid_amount: editingInvoice.paid_amount,
                status: resolvedStatus,
                payment_mode: editingInvoice.payment_mode,
                gst_rate: editingInvoice.gst_rate,
                is_partial: resolvedIsPartial
            })
            .eq('id', editingInvoice.id);

        if (error) {
            console.error('Error updating invoice:', error);
            alert('Failed to update invoice');
        } else {
            if (editingInvoice.booking_id) {
                const { error: bookingUpdateError } = await supabase
                    .from('bookings')
                    .update({
                        source: editingInvoice.booking_source || 'Direct',
                        check_in_date: editingInvoice.check_in_date || null,
                        check_out_date: editingInvoice.check_out_date || null,
                        room_rate: editingInvoice.room_rate ?? null,
                        extra_pax: editingInvoice.extra_pax ?? 0,
                        extra_pax_rate: editingInvoice.extra_pax_rate ?? 600,
                    })
                    .eq('id', editingInvoice.booking_id);

                if (bookingUpdateError) {
                    console.error('Error updating booking type:', bookingUpdateError);
                    alert('Invoice updated, but failed to sync booking type.');
                }

                const linkedBooking = bookings.find((item) => item.id === editingInvoice.booking_id);
                if (linkedBooking?.guest_id) {
                    const { error: guestUpdateError } = await supabase
                        .from('guests')
                        .update({
                            email: editingInvoice.guest_email || null,
                            phone: editingInvoice.guest_phone || null,
                            company_name: editingInvoice.guest_company_name || null,
                            gst_number: editingInvoice.guest_gst_number || null,
                            address: editingInvoice.guest_address || null,
                        })
                        .eq('id', linkedBooking.guest_id);

                    if (guestUpdateError) {
                        console.error('Error updating guest invoice details:', guestUpdateError);
                        alert('Invoice updated, but failed to sync guest details.');
                    }
                }
            }
            setEditingInvoice(null);
            fetchInvoices();
            fetchBookings();
        }
        setPendingUpdate(false);
    };

    const handleViewInvoice = async (invoice: Invoice) => {
        const { data: booking } = await supabase
            .from('bookings')
            .select('*, guest:guests(*), room:rooms(*)')
            .eq('id', invoice.booking_id || '')
            .single();

        if (booking) {
            setViewingInvoice({ ...invoice, booking, guest: booking.guest });
        }
    };

    const handleDownloadInvoice = async (invoice: Invoice) => {
        handleViewInvoice(invoice);
    };

    // Financial KPI Analytics (Real-time computed)
    const totalInvoiced = useMemo(() => {
        return invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    }, [invoices]);

    const totalRealized = useMemo(() => {
        return invoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
    }, [invoices]);

    const pendingDues = useMemo(() => {
        return invoices.reduce((sum, inv) => {
            const total = Number(inv.total_amount) || 0;
            const paid = Number(inv.paid_amount) || 0;
            return sum + Math.max(0, total - paid);
        }, 0);
    }, [invoices]);

    const realizationRate = useMemo(() => {
        if (!totalInvoiced) return 0;
        return Math.round((totalRealized / totalInvoiced) * 100);
    }, [totalInvoiced, totalRealized]);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const todayStats = useMemo(() => {
        const matching = invoices.filter((inv) => {
            const dateStr = inv.invoice_date || inv.created_at || '';
            return dateStr.startsWith(todayStr);
        });
        const collection = matching.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
        return {
            collection,
            count: matching.length
        };
    }, [invoices, todayStr]);

    // Status Counts for Filter Chips
    const statusCounts = useMemo(() => {
        return {
            ALL: invoices.length,
            Paid: invoices.filter((i) => i.status === 'Paid').length,
            Partial: invoices.filter((i) => i.status === 'Partial').length,
            Pending: invoices.filter((i) => i.status === 'Pending').length
        };
    }, [invoices]);

    // Filtered Invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            // Text Search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const invNum = (inv.invoice_number || '').toLowerCase();
                const guestName = (inv.guest_name || '').toLowerCase();
                const roomNum = (inv.room_number || '').toLowerCase();
                const bookNum = (inv.booking?.booking_number || '').toLowerCase();
                const mode = (inv.payment_mode || '').toLowerCase();
                if (
                    !invNum.includes(q) &&
                    !guestName.includes(q) &&
                    !roomNum.includes(q) &&
                    !bookNum.includes(q) &&
                    !mode.includes(q)
                ) {
                    return false;
                }
            }

            // Status Filter
            if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
                return false;
            }

            // Payment Mode Filter
            if (modeFilter !== 'ALL' && (inv.payment_mode || '').toUpperCase() !== modeFilter.toUpperCase()) {
                return false;
            }

            // Source Filter
            if (sourceFilter !== 'ALL') {
                const src = inv.booking?.source || 'Direct';
                if (src.toLowerCase() !== sourceFilter.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });
    }, [invoices, searchQuery, statusFilter, modeFilter, sourceFilter]);

    const isFiltersActive = searchQuery.trim() !== '' || statusFilter !== 'ALL' || modeFilter !== 'ALL' || sourceFilter !== 'ALL';

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setModeFilter('ALL');
        setSourceFilter('ALL');
    };

    const getPaymentModeIcon = (mode: string) => {
        const lower = (mode || '').toLowerCase();
        if (lower.includes('card')) return <CreditCard size={13} />;
        if (lower.includes('upi')) return <QrCode size={13} />;
        if (lower.includes('cash')) return <Banknote size={13} />;
        return <IndianRupee size={13} />;
    };

    return (
        <>
            <Header title="Billing & Invoices" />

            <div className={styles.container}>
                {/* 1. Executive Financial KPI Dashboard */}
                <div className={styles.statsRow}>
                    {/* Card 1: Realized Revenue */}
                    <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Realized Collection</span>
                            <span className={styles.statValue}>₹{totalRealized.toLocaleString()}</span>
                            <span className={styles.statSub}>
                                <span className={`${styles.rateBadge} ${styles.rateBadgeGreen}`}>
                                    {realizationRate}% settled
                                </span>
                                of total billed
                            </span>
                        </div>
                        <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
                            <TrendingUp size={22} />
                        </div>
                    </div>

                    {/* Card 2: Total Invoiced */}
                    <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Total Billed Folio</span>
                            <span className={styles.statValue}>₹{totalInvoiced.toLocaleString()}</span>
                            <span className={styles.statSub}>
                                {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'} generated
                            </span>
                        </div>
                        <div className={`${styles.statIconBox} ${styles.iconBlue}`}>
                            <Receipt size={22} />
                        </div>
                    </div>

                    {/* Card 3: Pending Receivables */}
                    <div className={`${styles.statCard} ${styles.statCardAmber}`}>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Outstanding Receivables</span>
                            <span className={styles.statValue} style={{ color: '#d97706' }}>
                                ₹{pendingDues.toLocaleString()}
                            </span>
                            <span className={styles.statSub}>
                                <span className={`${styles.rateBadge} ${styles.rateBadgeAmber}`}>
                                    {statusCounts.Pending + statusCounts.Partial} Pending
                                </span>
                                across accounts
                            </span>
                        </div>
                        <div className={`${styles.statIconBox} ${styles.iconAmber}`}>
                            <AlertCircle size={22} />
                        </div>
                    </div>

                    {/* Card 4: Today's Collection */}
                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Today's Settlement</span>
                            <span className={styles.statValue}>₹{todayStats.collection.toLocaleString()}</span>
                            <span className={styles.statSub}>
                                {todayStats.count} {todayStats.count === 1 ? 'transaction' : 'transactions'} today
                            </span>
                        </div>
                        <div className={`${styles.statIconBox} ${styles.iconPurple}`}>
                            <Sparkles size={22} />
                        </div>
                    </div>
                </div>

                {/* 2. Controls & Tabs Toolbar */}
                <div className={styles.toolbarCard}>
                    <div className={styles.toolbarTop}>
                        {/* Tab Switcher */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'Invoices' ? styles.active : ''}`}
                                onClick={() => setActiveTab('Invoices')}
                            >
                                <Receipt size={16} /> All Invoices
                                <span className={styles.tabCount}>{invoices.length}</span>
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'DailyReport' ? styles.active : ''}`}
                                onClick={() => setActiveTab('DailyReport')}
                            >
                                <Calendar size={16} /> Daily Closing & Reconciliation
                            </button>
                        </div>

                        {activeTab === 'Invoices' && (
                            <div className={styles.selectFilters}>
                                {/* Payment Mode Filter */}
                                <CustomSelect
                                    options={PAYMENT_MODE_FILTER_OPTIONS}
                                    value={modeFilter}
                                    onChange={(val) => setModeFilter(val)}
                                    size="sm"
                                />

                                {/* Booking Channel Filter */}
                                <CustomSelect
                                    options={SOURCE_FILTER_OPTIONS}
                                    value={sourceFilter}
                                    onChange={(val) => setSourceFilter(val)}
                                    size="sm"
                                />

                                {isFiltersActive && (
                                    <button className={styles.resetBtn} onClick={handleResetFilters}>
                                        <X size={14} /> Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Search & Status Filters Row (Shown when on Invoices tab) */}
                    {activeTab === 'Invoices' && (
                        <div className={styles.filterControlsRow}>
                            {/* Search Input */}
                            <div className={styles.searchBox}>
                                <Search size={16} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search by invoice #, guest, room, or booking..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className={styles.clearSearchBtn}
                                        onClick={() => setSearchQuery('')}
                                        title="Clear search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter Chips */}
                            <div className={styles.statusFilterPills}>
                                <button
                                    className={`${styles.statusPill} ${statusFilter === 'ALL' ? styles.statusPillActive : ''}`}
                                    onClick={() => setStatusFilter('ALL')}
                                >
                                    All Folios
                                    <span className={styles.pillBadge}>{statusCounts.ALL}</span>
                                </button>
                                <button
                                    className={`${styles.statusPill} ${statusFilter === 'Paid' ? styles.statusPillActive : ''}`}
                                    onClick={() => setStatusFilter('Paid')}
                                >
                                    <CheckCircle2 size={13} color="#10b981" /> Paid
                                    <span className={styles.pillBadge}>{statusCounts.Paid}</span>
                                </button>
                                <button
                                    className={`${styles.statusPill} ${statusFilter === 'Partial' ? styles.statusPillActive : ''}`}
                                    onClick={() => setStatusFilter('Partial')}
                                >
                                    <Clock size={13} color="#f59e0b" /> Partial
                                    <span className={styles.pillBadge}>{statusCounts.Partial}</span>
                                </button>
                                <button
                                    className={`${styles.statusPill} ${statusFilter === 'Pending' ? styles.statusPillActive : ''}`}
                                    onClick={() => setStatusFilter('Pending')}
                                >
                                    <AlertCircle size={13} color="#ef4444" /> Pending
                                    <span className={styles.pillBadge}>{statusCounts.Pending}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Invoices Table or Daily Closing Report */}
                {activeTab === 'Invoices' ? (
                    <div className={styles.tableWrapper}>
                        {fetchError && (
                            <div className={styles.fetchErrorBanner}>
                                <AlertTriangle size={18} />
                                <span>{fetchError}</span>
                            </div>
                        )}

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Invoice & Date</th>
                                        <th>Guest & Reservation</th>
                                        <th>Booking Channel</th>
                                        <th>Payment Mode</th>
                                        <th>Settlement (Paid / Total)</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((inv) => {
                                        const total = Number(inv.total_amount) || 0;
                                        const paid = Number(inv.paid_amount) || 0;
                                        const balance = Math.max(0, total - paid);
                                        const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                                        const src = inv.booking?.source || 'Direct';

                                        return (
                                            <tr key={inv.id}>
                                                {/* Folio & Date */}
                                                <td>
                                                    <div className={styles.folioCell}>
                                                        <span className={styles.folioBadge}>
                                                            <Receipt size={14} className={styles.folioIcon} />
                                                            {inv.invoice_number}
                                                        </span>
                                                        <span className={styles.invoiceDate}>
                                                            {inv.invoice_date || (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Guest & Reservation */}
                                                <td>
                                                    <div className={styles.guestCell}>
                                                        <span className={styles.guestName}>
                                                            {inv.guest_name || 'Individual Guest'}
                                                        </span>
                                                        <div className={styles.stayMetaRow}>
                                                            {inv.room_number && (
                                                                <span className={styles.roomChip}>
                                                                    Room {inv.room_number}
                                                                </span>
                                                            )}
                                                            {inv.booking?.booking_number && (
                                                                <span className={styles.bookingIdChip}>
                                                                    #{inv.booking.booking_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Channel / Source */}
                                                <td>
                                                    <span className={`${styles.channelBadge} ${
                                                        src === 'OTA'
                                                            ? styles.channelOTA
                                                            : src === 'Corporate'
                                                            ? styles.channelCorporate
                                                            : src === 'Direct'
                                                            ? styles.channelDirect
                                                            : styles.channelStandard
                                                    }`}>
                                                        {src === 'Corporate' && <Building2 size={11} />}
                                                        {src}
                                                    </span>
                                                </td>

                                                {/* Payment Mode */}
                                                <td>
                                                    <span className={styles.modeChip}>
                                                        {getPaymentModeIcon(inv.payment_mode)}
                                                        {inv.payment_mode || 'Pending'}
                                                    </span>
                                                </td>

                                                {/* Settlement Amounts with Mini Progress Bar */}
                                                <td>
                                                    <div className={styles.amountCell}>
                                                        <span className={styles.amountTotal}>
                                                            ₹{paid.toLocaleString()}
                                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                                                {' '}/ ₹{total.toLocaleString()}
                                                            </span>
                                                        </span>
                                                        {total > 0 && (
                                                            <div className={styles.amountSub}>
                                                                <div className={styles.progressBarContainer}>
                                                                    <div
                                                                        className={styles.progressBarFill}
                                                                        style={{
                                                                            width: `${pct}%`,
                                                                            background: pct === 100
                                                                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                                                                : pct > 0
                                                                                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                                                : '#cbd5e1'
                                                                        }}
                                                                    />
                                                                </div>
                                                                {balance > 0 ? (
                                                                    <span className={styles.dueAmount}>
                                                                        Due ₹{balance.toLocaleString()}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#16a34a' }}>Settled</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status Capsule */}
                                                <td>
                                                    {inv.status === 'Paid' ? (
                                                        <span className={`${styles.statusCapsule} ${styles.statusPaid}`}>
                                                            <span className={styles.statusDot} />
                                                            Paid
                                                        </span>
                                                    ) : inv.status === 'Partial' ? (
                                                        <span className={`${styles.statusCapsule} ${styles.statusPartial}`}>
                                                            <span className={styles.statusDot} />
                                                            Partial ({pct}%)
                                                        </span>
                                                    ) : (
                                                        <span className={`${styles.statusCapsule} ${styles.statusPending}`}>
                                                            <span className={styles.statusDot} />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="Edit Invoice"
                                                            aria-label={`Edit Invoice ${inv.invoice_number}`}
                                                            onClick={() => openEditInvoice(inv)}
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="View Full Folio"
                                                            aria-label={`View Invoice ${inv.invoice_number}`}
                                                            onClick={() => handleViewInvoice(inv)}
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="Download / Print Invoice"
                                                            aria-label={`Download Invoice ${inv.invoice_number}`}
                                                            onClick={() => handleDownloadInvoice(inv)}
                                                        >
                                                            <Download size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty Search Results */}
                        {!loading && filteredInvoices.length === 0 && (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIconBox}>
                                    <Receipt size={32} />
                                </div>
                                <h3 className={styles.emptyTitle}>No Invoices Found</h3>
                                <p className={styles.emptySubtitle}>
                                    {isFiltersActive
                                        ? 'No records match your active search terms or filters. Try adjusting your query.'
                                        : 'No billing invoices have been generated yet.'}
                                </p>
                                {isFiltersActive && (
                                    <button className={styles.resetBtn} onClick={handleResetFilters}>
                                        <RefreshCw size={13} /> Reset All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table Footer Summary */}
                        <div className={styles.tableFooter}>
                            <span>
                                Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> total invoices
                            </span>
                            <span>
                                Real-time Supabase sync active
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Daily Closing & Reconciliation View */
                    <div className={styles.closingContainer}>
                        {/* 1. Date Navigator Bar */}
                        <div className={styles.closingNavCard}>
                            <div className={styles.closingDateGroup}>
                                <h3 className={styles.closingTitle}>
                                    <Calendar size={18} color="#0284c7" />
                                    Daily Closing: {new Date(closingDate).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                        className={styles.dateNavBtn}
                                        onClick={() => handleShiftDate(-1)}
                                        title="Previous Day"
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>

                                    <DatePicker
                                        value={closingDate}
                                        onChange={(val) => setClosingDate(val)}
                                        size="sm"
                                        clearable={false}
                                    />

                                    <button
                                        className={styles.dateNavBtn}
                                        onClick={() => handleShiftDate(1)}
                                        title="Next Day"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>

                                    <button
                                        className={styles.dateNavBtn}
                                        onClick={() => setClosingDate(new Date().toISOString().split('T')[0])}
                                        title="Jump to Today"
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {closingIsLocked ? (
                                    <span className={`${styles.closingStatusBadge} ${styles.closingStatusLocked}`}>
                                        <Lock size={12} /> Closing Locked & Audited
                                    </span>
                                ) : (
                                    <span className={`${styles.closingStatusBadge} ${styles.closingStatusOpen}`}>
                                        <span className={`${styles.statusDot} ${styles.pulseDot}`} style={{ background: '#10b981' }} />
                                        Day Audit Open
                                    </span>
                                )}

                                <button
                                    className={styles.dateNavBtn}
                                    onClick={() => fetchDailyClosing(closingDate)}
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={13} className={closingLoading ? 'spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* 2. Daily Financial Performance (3 Cards) */}
                        <div className={styles.closingGrid3}>
                            {/* Revenue Card */}
                            <div className={`${styles.closingMetricCard} ${styles.metricCardRevenue}`}>
                                <div className={styles.metricCardHeader}>
                                    <span className={styles.metricCardLabel}>Gross Daily Collections</span>
                                    <div className={`${styles.statIconBox} ${styles.iconBlue}`} style={{ width: '36px', height: '36px' }}>
                                        <IndianRupee size={18} />
                                    </div>
                                </div>
                                <span className={styles.metricCardAmount} style={{ color: '#0284c7' }}>
                                    ₹{closingMetrics.revenue.toLocaleString()}
                                </span>
                                <span className={styles.metricCardSub}>
                                    From paid invoices on record
                                </span>
                            </div>

                            {/* Expenses Card */}
                            <div className={`${styles.closingMetricCard} ${styles.metricCardExpenses}`}>
                                <div className={styles.metricCardHeader}>
                                    <span className={styles.metricCardLabel}>Daily Operating Expenses</span>
                                    <div className={`${styles.statIconBox} ${styles.iconAmber}`} style={{ width: '36px', height: '36px', background: '#fee2e2', color: '#dc2626' }}>
                                        <Receipt size={18} />
                                    </div>
                                </div>
                                <span className={styles.metricCardAmount} style={{ color: '#dc2626' }}>
                                    ₹{closingMetrics.expenses.toLocaleString()}
                                </span>
                                <span className={styles.metricCardSub}>
                                    Operational vouchers & expenses
                                </span>
                            </div>

                            {/* Net Operating Surplus Card */}
                            <div className={`${styles.closingMetricCard} ${styles.metricCardProfit}`}>
                                <div className={styles.metricCardHeader}>
                                    <span className={styles.metricCardLabel}>Net Operating Balance</span>
                                    <div className={`${styles.statIconBox} ${styles.iconGreen}`} style={{ width: '36px', height: '36px' }}>
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                                <span className={styles.metricCardAmount} style={{ color: closingMetrics.netProfit >= 0 ? '#10b981' : '#dc2626' }}>
                                    {closingMetrics.netProfit >= 0 ? '+' : ''}₹{closingMetrics.netProfit.toLocaleString()}
                                </span>
                                <span className={styles.metricCardSub}>
                                    {closingMetrics.netProfit >= 0 ? 'Surplus operating day' : 'Operating deficit'}
                                </span>
                            </div>
                        </div>

                        {/* 3. Daily Front-Desk & Rooms Operations */}
                        <div className={styles.operationsCard}>
                            <div className={styles.operationsHeader}>
                                <h4 className={styles.operationsTitle}>
                                    <BedDouble size={16} color="#0284c7" />
                                    Daily Front-Desk & Rooms Movement
                                </h4>
                                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                    Live occupancy & movement status
                                </span>
                            </div>

                            <div className={styles.operationsGrid}>
                                <div className={styles.opItem}>
                                    <div className={styles.opIconBox} style={{ background: '#ecfdf5', color: '#10b981' }}>
                                        <LogIn size={18} />
                                    </div>
                                    <span className={styles.opItemLabel}>Check-Ins</span>
                                    <span className={styles.opItemVal}>{closingMetrics.checkIns}</span>
                                </div>

                                <div className={styles.opItem}>
                                    <div className={styles.opIconBox} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                        <LogOut size={18} />
                                    </div>
                                    <span className={styles.opItemLabel}>Check-Outs</span>
                                    <span className={styles.opItemVal}>{closingMetrics.checkOuts}</span>
                                </div>

                                <div className={styles.opItem}>
                                    <div className={styles.opIconBox} style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
                                        <BedDouble size={18} />
                                    </div>
                                    <span className={styles.opItemLabel}>Occupied</span>
                                    <span className={styles.opItemVal}>
                                        {closingMetrics.roomsOccupied} / {closingMetrics.roomsTotal}
                                    </span>
                                </div>

                                <div className={styles.opItem}>
                                    <div className={styles.opIconBox} style={{ background: '#fef3c7', color: '#f59e0b' }}>
                                        <Percent size={18} />
                                    </div>
                                    <span className={styles.opItemLabel}>Occupancy Rate</span>
                                    <span className={styles.opItemVal}>
                                        {closingMetrics.occupancyRate.toFixed(1)}%
                                    </span>
                                </div>

                                <div className={styles.opItem}>
                                    <div className={styles.opIconBox} style={{ background: '#f1f5f9', color: '#475569' }}>
                                        <Receipt size={18} />
                                    </div>
                                    <span className={styles.opItemLabel}>Day Folios</span>
                                    <span className={styles.opItemVal}>{closingMetrics.bookingsCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Night Audit Handover Notes Card */}
                        <div className={styles.notesCard}>
                            <div className={styles.operationsHeader}>
                                <h4 className={styles.operationsTitle}>
                                    <FileText size={16} color="#0284c7" />
                                    Night Audit Handover & Closing Remarks
                                </h4>
                                {closingSuccessMsg && (
                                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Check size={14} /> {closingSuccessMsg}
                                    </span>
                                )}
                            </div>

                            <textarea
                                className={styles.notesTextarea}
                                placeholder="Add daily reconciliation remarks, shift handover notes, cash drawer variance, or audit observations for this day..."
                                value={closingNotes}
                                onChange={(e) => setClosingNotes(e.target.value)}
                                disabled={closingIsLocked || closingSaving}
                            />

                            <div className={styles.notesFooter}>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                                    Audit remarks are saved permanently against date: <strong>{closingDate}</strong>
                                </span>

                                {!closingIsLocked && (
                                    <button
                                        className={styles.saveBtn}
                                        onClick={handleSaveClosingNotes}
                                        disabled={closingSaving}
                                    >
                                        {closingSaving ? (
                                            <>
                                                <RefreshCw size={14} className="spin" /> Saving Closing Record...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={15} /> Save Daily Closing Remarks
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modern High-Fidelity Invoice Preview & PDF Export Modal */}
            {viewingInvoice && viewingInvoice.booking && (
                <InvoicePreviewModal
                    isOpen={!!viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                    title={`Tax Invoice #${viewingInvoice.invoice_number}`}
                    subtitle={`Booking Ref: ${viewingInvoice.booking.booking_number || viewingInvoice.booking.id?.slice(0, 8).toUpperCase()} • ${viewingInvoice.guest?.name || 'Guest Folio'}`}
                    filename={`AveVista_Invoice_${viewingInvoice.invoice_number}`}
                    format="a4"
                >
                    <InvoiceTemplate
                        invoice={viewingInvoice}
                        booking={viewingInvoice.booking}
                        guest={viewingInvoice.guest}
                    />
                </InvoicePreviewModal>
            )}

            {/* Modernized Edit Invoice Modal */}
            {editingInvoice && (
                <div className={styles.modalOverlay} onClick={() => setEditingInvoice(null)}>
                    <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.headerGlow} />
                            <div className={styles.modalTitleGroup}>
                                <div className={styles.folioBadgeRow}>
                                    <span className={styles.invoiceFolioPill}>
                                        <Receipt size={12} />
                                        <span>#{editingInvoice.invoice_number}</span>
                                    </span>
                                    {editingInvoice.room_number && (
                                        <span className={styles.roomFolioPill}>
                                            <Key size={12} />
                                            <span>Room {editingInvoice.room_number}</span>
                                        </span>
                                    )}
                                </div>
                                <h3 className={styles.modalTitle}>
                                    Edit Folio Invoice
                                </h3>
                                <p className={styles.modalSubtitle}>
                                    Update invoice dates, reservation folio linkage, guest billing details, and payment settlement
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingInvoice(null)}
                                className={styles.closeBtn}
                                title="Close Modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Pinned Live Settlement Summary Bar */}
                        <div className={styles.settlementBar}>
                            <div className={styles.settlementSummaryTop}>
                                <div className={styles.settlementSummaryTitle}>
                                    <CreditCard size={15} />
                                    <span>Real-Time Settlement & Tax Audit</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.settleInFullBtn}
                                    onClick={() => {
                                        const total = Number(editingInvoice.total_amount || 0);
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            paid_amount: total,
                                            status: 'Paid',
                                            is_partial: false
                                        });
                                    }}
                                    title="Set paid amount equal to total amount"
                                >
                                    <Sparkles size={12} />
                                    <span>Settle in Full (Paid = ₹{Number(editingInvoice.total_amount || 0).toLocaleString('en-IN')})</span>
                                </button>
                            </div>

                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Total Folio Billed</span>
                                    <span className={styles.summaryValue}>
                                        ₹{Number(editingInvoice.total_amount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Realized / Paid</span>
                                    <span className={styles.summaryValue} style={{ color: '#16a34a' }}>
                                        ₹{Number(editingInvoice.paid_amount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>GST ({editingInvoice.gst_rate || 0}%)</span>
                                    <span className={styles.summaryValue}>
                                        ₹{calculateInvoiceGstAmount(Number(editingInvoice.total_amount || 0), Number(editingInvoice.gst_rate || 0)).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Outstanding Due</span>
                                    <span
                                        className={`${styles.summaryValue} ${
                                            Math.max(0, Number(editingInvoice.total_amount || 0) - Number(editingInvoice.paid_amount || 0)) > 0
                                                ? styles.summaryDue
                                                : styles.summarySettled
                                        }`}
                                    >
                                        {Math.max(0, Number(editingInvoice.total_amount || 0) - Number(editingInvoice.paid_amount || 0)) > 0
                                            ? `₹${Math.max(0, Number(editingInvoice.total_amount || 0) - Number(editingInvoice.paid_amount || 0)).toLocaleString('en-IN')}`
                                            : 'Settled (₹0)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Section 1: Folio & Booking Linkage */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionHeader}>
                                    <Receipt size={14} /> 1. Folio & Booking Linkage
                                </div>
                                <div className={styles.formGrid3}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Invoice Number</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={editingInvoice.invoice_number}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, invoice_number: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Invoice Date</label>
                                        <DatePicker
                                            value={editingInvoice.invoice_date || ''}
                                            onChange={(val) => setEditingInvoice({ ...editingInvoice, invoice_date: val })}
                                            fullWidth
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Linked Booking</label>
                                        <select
                                            className={styles.input}
                                            value={editingInvoice.booking_id || ''}
                                            onChange={(e) => {
                                                const bookingId = e.target.value || null;
                                                const linkedBooking = bookings.find((item) => item.id === bookingId);
                                                setEditingInvoice({
                                                    ...editingInvoice,
                                                    booking_id: bookingId,
                                                    booking: linkedBooking
                                                        ? { booking_number: linkedBooking.booking_number, source: linkedBooking.source }
                                                        : undefined,
                                                    booking_source: linkedBooking?.source || editingInvoice.booking_source || 'Direct',
                                                    guest_name: linkedBooking?.guests ? `${linkedBooking.guests.first_name} ${linkedBooking.guests.last_name}` : editingInvoice.guest_name,
                                                    guest_email: linkedBooking?.guests?.email || '',
                                                    guest_phone: linkedBooking?.guests?.phone || '',
                                                    guest_company_name: linkedBooking?.guests?.company_name || '',
                                                    guest_gst_number: linkedBooking?.guests?.gst_number || '',
                                                    guest_address: linkedBooking?.guests?.address || '',
                                                    check_in_date: linkedBooking?.check_in_date || '',
                                                    check_out_date: linkedBooking?.check_out_date || '',
                                                    room_type: linkedBooking?.rooms?.type || '',
                                                    room_rate: linkedBooking?.room_rate ?? 0,
                                                    extra_pax: linkedBooking?.extra_pax ?? 0,
                                                    extra_pax_rate: linkedBooking?.extra_pax_rate ?? 600,
                                                    room_number: linkedBooking?.rooms?.room_number || editingInvoice.room_number,
                                                });
                                            }}
                                        >
                                            <option value="">No Linked Booking</option>
                                            {bookings.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.booking_number || b.id} - {b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Guest'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Booking Source / Channel</label>
                                        <select
                                            className={styles.input}
                                            value={editingInvoice.booking_source || editingInvoice.booking?.source || 'Direct'}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, booking_source: e.target.value })}
                                        >
                                            <option value="Direct">Direct</option>
                                            <option value="OTA">OTA</option>
                                            <option value="Corporate">Corporate</option>
                                            <option value="Standard">Standard</option>
                                            <option value="Complementary">Complementary</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Assigned Room Number</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={editingInvoice.room_number || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, room_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Guest & Corporate Profile */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionHeader}>
                                    <User size={14} /> 2. Guest & Corporate Profile
                                </div>
                                <div className={styles.formGrid3}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Guest Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={editingInvoice.guest_name || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Email Address</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={editingInvoice.guest_email || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_email: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Phone Number</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={editingInvoice.guest_phone || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Corporate Company Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Optional corporate client"
                                            value={editingInvoice.guest_company_name || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>GSTIN Registration</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Optional 15-digit GSTIN"
                                            value={editingInvoice.guest_gst_number || ''}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_gst_number: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Registered Street Address</label>
                                    <textarea
                                        className={styles.input}
                                        rows={2}
                                        value={editingInvoice.guest_address || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Section 3: Tariff & Settlement */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionHeader}>
                                    <IndianRupee size={14} /> 3. Tariff, Taxes & Payment Settlement
                                </div>

                                <div className={styles.formGrid3}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Room Rate (₹ / Night)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.room_rate || 0}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, room_rate: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Extra Pax Count</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.extra_pax || 0}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, extra_pax: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Extra Pax Rate (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.extra_pax_rate || 600}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, extra_pax_rate: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid3}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Total Amount (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.total_amount || 0}
                                            onChange={(e) => {
                                                const total = Number(e.target.value);
                                                const paid = Number(editingInvoice.paid_amount || 0);
                                                setEditingInvoice({
                                                    ...editingInvoice,
                                                    total_amount: total,
                                                    status: autoInvoiceStatus(paid, total)
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Paid Amount (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.paid_amount || 0}
                                            onChange={(e) => {
                                                const paid = Number(e.target.value);
                                                const total = Number(editingInvoice.total_amount || 0);
                                                setEditingInvoice({
                                                    ...editingInvoice,
                                                    paid_amount: paid,
                                                    status: autoInvoiceStatus(paid, total)
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>GST Rate (%)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={editingInvoice.gst_rate || 0}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, gst_rate: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid2}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Payment Settlement Status</label>
                                        <CustomSelect
                                            options={INVOICE_STATUS_OPTIONS}
                                            value={editingInvoice.status}
                                            onChange={(val) => {
                                                const status = val as Database['public']['Tables']['invoices']['Row']['status'];
                                                setEditingInvoice({
                                                    ...editingInvoice,
                                                    status,
                                                    is_partial: status === 'Partial'
                                                });
                                            }}
                                            fullWidth
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Payment Instrument / Mode</label>
                                        <CustomSelect
                                            options={PAYMENT_INSTRUMENT_OPTIONS}
                                            value={editingInvoice.payment_mode || ''}
                                            onChange={(val) => setEditingInvoice({ ...editingInvoice, payment_mode: (val || null) as Database['public']['Tables']['invoices']['Row']['payment_mode'] })}
                                            placeholder="Select Instrument"
                                            fullWidth
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkboxInput}
                                            checked={!!editingInvoice.is_partial}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, is_partial: e.target.checked })}
                                        />
                                        <span>Flag folio as Partial Settlement</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setEditingInvoice(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleUpdateInvoice}
                                disabled={pendingUpdate}
                            >
                                {pendingUpdate ? (
                                    <>
                                        <RefreshCw size={14} className="spin" /> Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={15} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
