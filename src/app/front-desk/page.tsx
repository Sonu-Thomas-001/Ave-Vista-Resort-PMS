'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
    UserCheck,
    LogOut,
    Search,
    Users,
    BedDouble,
    Calendar,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    FileText,
    Sparkles,
    Key,
    Phone,
    Clock,
    RefreshCw,
    X,
    ExternalLink,
    AlertCircle,
    Utensils
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function FrontDeskPage() {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    const [bookings, setBookings] = useState<any[]>([]);
    const [totalRoomsCount, setTotalRoomsCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Active Queue Tab: 'arrivals' | 'departures' | 'inhouse'
    const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'inhouse'>('arrivals');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchFrontDeskData = async () => {
        setRefreshing(true);
        try {
            // 1. Fetch active bookings (Confirmed + Checked In)
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_number,
                    room_id,
                    guest_id,
                    check_in_date,
                    check_out_date,
                    status,
                    total_amount,
                    advance_amount,
                    adults,
                    children,
                    extra_pax,
                    rooms (
                        id,
                        room_number,
                        type,
                        status,
                        price_per_night
                    ),
                    guests (
                        id,
                        first_name,
                        last_name,
                        email,
                        phone,
                        is_vip
                    )
                `)
                .in('status', ['Confirmed', 'Checked In'])
                .order('check_in_date', { ascending: true });

            if (bookingsError) throw bookingsError;
            if (bookingsData) setBookings(bookingsData);

            // 2. Fetch total rooms count
            const { count, error: roomsError } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true });

            if (!roomsError && count !== null) {
                setTotalRoomsCount(count);
            }
        } catch (error) {
            console.error('Error fetching front desk data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFrontDeskData();
    }, []);

    // 1. Expected Arrivals (Confirmed bookings where check_in_date <= today or today)
    const expectedArrivals = useMemo(() => {
        return bookings.filter(b => b.status === 'Confirmed' && b.check_in_date <= today);
    }, [bookings, today]);

    // 2. Scheduled Departures (Checked In bookings where check_out_date <= today)
    const scheduledDepartures = useMemo(() => {
        return bookings.filter(b => b.status === 'Checked In' && b.check_out_date <= today);
    }, [bookings, today]);

    // 3. In-House Guests (All Checked In)
    const inHouseGuests = useMemo(() => {
        return bookings.filter(b => b.status === 'Checked In');
    }, [bookings]);

    // Occupancy calculation
    const occupancyRate = useMemo(() => {
        if (totalRoomsCount === 0) return 0;
        return Math.min(100, Math.round((inHouseGuests.length / totalRoomsCount) * 100));
    }, [inHouseGuests.length, totalRoomsCount]);

    // Active list based on selected tab
    const activeList = useMemo(() => {
        if (activeTab === 'arrivals') return expectedArrivals;
        if (activeTab === 'departures') return scheduledDepartures;
        return inHouseGuests;
    }, [activeTab, expectedArrivals, scheduledDepartures, inHouseGuests]);

    // Filter by search query
    const filteredQueue = useMemo(() => {
        if (!searchQuery.trim()) return activeList;
        const q = searchQuery.toLowerCase().trim();
        return activeList.filter(b => {
            const guestName = `${b.guests?.first_name || ''} ${b.guests?.last_name || ''}`.toLowerCase();
            const phone = (b.guests?.phone || '').toLowerCase();
            const roomNum = (b.rooms?.room_number || '').toLowerCase();
            const bookingNo = (b.booking_number || b.id || '').toLowerCase();
            return (
                guestName.includes(q) ||
                phone.includes(q) ||
                roomNum.includes(q) ||
                bookingNo.includes(q)
            );
        });
    }, [activeList, searchQuery]);

    const calculateNights = (checkIn: string, checkOut: string) => {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    };

    return (
        <>
            <Header title="Front Desk Operations" />

            <div className={styles.container}>
                {/* 1. Real-time KPI Ribbon */}
                <div className={styles.kpiGrid}>
                    <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                        <div className={styles.kpiIconBox}>
                            <UserCheck size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Today's Arrivals</span>
                            <span className={styles.kpiVal}>{expectedArrivals.length}</span>
                            <span className={styles.kpiHint}>Pending check-in registration</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiRose}`}>
                        <div className={styles.kpiIconBox}>
                            <LogOut size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Today's Departures</span>
                            <span className={styles.kpiVal}>{scheduledDepartures.length}</span>
                            <span className={styles.kpiHint}>Scheduled folios for settlement</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                        <div className={styles.kpiIconBox}>
                            <Users size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>In-House Guests</span>
                            <span className={styles.kpiVal}>{inHouseGuests.length}</span>
                            <span className={styles.kpiHint}>Occupying resort rooms</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
                        <div className={styles.kpiIconBox}>
                            <BedDouble size={22} />
                        </div>
                        <div className={styles.kpiDetails}>
                            <span className={styles.kpiLabel}>Resort Occupancy</span>
                            <span className={styles.kpiVal}>{occupancyRate}%</span>
                            <span className={styles.kpiHint}>
                                {inHouseGuests.length} of {totalRoomsCount} rooms occupied
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Core Operation Launchers (Grand Cards) */}
                <div className={styles.launchersGrid}>
                    {/* Guest Check-In Launcher */}
                    <Link href="/front-desk/checkin" className={`${styles.launcherCard} ${styles.checkinCard}`}>
                        <div className={styles.cardGlowGreen} />
                        <div className={styles.launcherHeader}>
                            <div className={`${styles.launcherIconBox} ${styles.checkinIcon}`}>
                                <UserCheck size={28} />
                            </div>
                            <div className={`${styles.pendingBadge} ${styles.pendingBadgeGreen}`}>
                                <Sparkles size={12} />
                                <span>{expectedArrivals.length} Arrivals Ready</span>
                            </div>
                        </div>

                        <h2 className={styles.launcherTitle}>Guest Check-In & Arrival</h2>
                        <p className={styles.launcherDesc}>
                            Process new arrivals, verify government ID proof, assign sanitized rooms, and issue room keys.
                        </p>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <ShieldCheck size={15} />
                                <span>Aadhaar / Passport document verification</span>
                            </div>
                            <div className={styles.featureItem}>
                                <Key size={15} />
                                <span>Room allocation & keycard handover</span>
                            </div>
                            <div className={styles.featureItem}>
                                <CheckCircle2 size={15} />
                                <span>Automated welcome email & guest registration card</span>
                            </div>
                        </div>

                        <div className={`${styles.launcherActionBtn} ${styles.checkinActionBtn}`}>
                            <span>Launch Check-In Wizard</span>
                            <ArrowRight size={16} />
                        </div>
                    </Link>

                    {/* Guest Check-Out Launcher */}
                    <Link href="/front-desk/checkout" className={`${styles.launcherCard} ${styles.checkoutCard}`}>
                        <div className={styles.cardGlowRose} />
                        <div className={styles.launcherHeader}>
                            <div className={`${styles.launcherIconBox} ${styles.checkoutIcon}`}>
                                <LogOut size={28} />
                            </div>
                            <div className={`${styles.pendingBadge} ${styles.pendingBadgeRose}`}>
                                <Clock size={12} />
                                <span>{scheduledDepartures.length} Departures Scheduled</span>
                            </div>
                        </div>

                        <h2 className={styles.launcherTitle}>Guest Check-Out & Settlement</h2>
                        <p className={styles.launcherDesc}>
                            Review comprehensive folios, reconcile dining & extra charges, collect balance, and print GST tax invoice.
                        </p>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <FileText size={15} />
                                <span>Itemized room stay & restaurant bill audit</span>
                            </div>
                            <div className={styles.featureItem}>
                                <CreditCard size={15} />
                                <span>Multi-mode settlement (Cash, UPI, Card) & GST invoice</span>
                            </div>
                            <div className={styles.featureItem}>
                                <CheckCircle2 size={15} />
                                <span>Automatic turnover trigger for Housekeeping</span>
                            </div>
                        </div>

                        <div className={`${styles.launcherActionBtn} ${styles.checkoutActionBtn}`}>
                            <span>Launch Check-Out Wizard</span>
                            <ArrowRight size={16} />
                        </div>
                    </Link>
                </div>

                {/* 3. Auxiliary Quick Shortcuts Bar */}
                <div className={styles.auxiliaryBar}>
                    <span className={styles.auxiliaryLabel}>Front Desk Quick Links:</span>
                    <Link href="/rooms" className={styles.auxiliaryLink}>
                        <BedDouble size={14} /> Room Housekeeping Status
                    </Link>
                    <Link href="/bookings" className={styles.auxiliaryLink}>
                        <Calendar size={14} /> Walk-In / New Reservation
                    </Link>
                    <Link href="/guests" className={styles.auxiliaryLink}>
                        <Users size={14} /> Guest CRM & Profiles
                    </Link>
                    <Link href="/restaurant-bill" className={styles.auxiliaryLink}>
                        <Utensils size={14} /> Dining & Room Service Bill
                    </Link>
                </div>

                {/* 4. Live Operational Queues & Today's Manifest */}
                <div className={styles.queueCard}>
                    {/* Queue Tabs and Search Toolbar */}
                    <div className={styles.queueToolbar}>
                        <div className={styles.queueTabs}>
                            <button
                                className={`${styles.queueTabBtn} ${activeTab === 'arrivals' ? styles.queueTabBtnActive : ''}`}
                                onClick={() => setActiveTab('arrivals')}
                            >
                                <UserCheck size={15} />
                                <span>Expected Arrivals</span>
                                <span className={styles.tabCountBadge}>{expectedArrivals.length}</span>
                            </button>

                            <button
                                className={`${styles.queueTabBtn} ${activeTab === 'departures' ? styles.queueTabBtnActive : ''}`}
                                onClick={() => setActiveTab('departures')}
                            >
                                <LogOut size={15} />
                                <span>Today's Departures</span>
                                <span className={styles.tabCountBadge}>{scheduledDepartures.length}</span>
                            </button>

                            <button
                                className={`${styles.queueTabBtn} ${activeTab === 'inhouse' ? styles.queueTabBtnActive : ''}`}
                                onClick={() => setActiveTab('inhouse')}
                            >
                                <Users size={15} />
                                <span>In-House Guests</span>
                                <span className={styles.tabCountBadge}>{inHouseGuests.length}</span>
                            </button>
                        </div>

                        {/* Search in Queue */}
                        <div className={styles.searchBox}>
                            <Search size={15} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by guest, room, phone..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    {/* Table View of Live Queue */}
                    {loading ? (
                        <div className={styles.emptyQueue}>
                            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
                            <span>Loading live front desk queues...</span>
                        </div>
                    ) : filteredQueue.length === 0 ? (
                        <div className={styles.emptyQueue}>
                            <div className={styles.emptyIconBox}>
                                {activeTab === 'arrivals' ? (
                                    <UserCheck size={28} />
                                ) : activeTab === 'departures' ? (
                                    <LogOut size={28} />
                                ) : (
                                    <Users size={28} />
                                )}
                            </div>
                            <h3 className={styles.emptyTitle}>
                                {searchQuery
                                    ? 'No reservations match your search'
                                    : activeTab === 'arrivals'
                                    ? 'All Expected Arrivals Are Checked In!'
                                    : activeTab === 'departures'
                                    ? 'No Pending Departures For Today'
                                    : 'No Active In-House Guests'}
                            </h3>
                            <p className={styles.emptyDesc}>
                                {searchQuery
                                    ? 'Try adjusting your search terms or clear the filter.'
                                    : 'The front desk manifest for this category is completely clear.'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Guest Details</th>
                                        <th>Room Assignment</th>
                                        <th>Stay Period</th>
                                        <th>Pax</th>
                                        <th>Billing & Advance</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Front Desk Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQueue.map(booking => {
                                        const guest = booking.guests;
                                        const room = booking.rooms;
                                        const nights = calculateNights(booking.check_in_date, booking.check_out_date);
                                        const guestFullName = guest
                                            ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim()
                                            : 'Guest';

                                        return (
                                            <tr key={booking.id} className={styles.tableRow}>
                                                {/* Guest Cell */}
                                                <td>
                                                    <div className={styles.guestCell}>
                                                        <div className={styles.avatarCircle}>
                                                            {guestFullName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className={styles.guestMeta}>
                                                            <span className={styles.guestName}>
                                                                {guestFullName}
                                                                {guest?.is_vip && <span className={styles.vipBadge}>VIP</span>}
                                                            </span>
                                                            <span className={styles.guestSubtext}>
                                                                {guest?.phone || 'No phone'} • #{booking.booking_number || booking.id.slice(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Room */}
                                                <td>
                                                    {room ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <span className={styles.roomBadge}>
                                                                <Key size={13} style={{ color: '#0284c7' }} />
                                                                Room {room.room_number}
                                                            </span>
                                                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                                {room.type}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Stay Dates */}
                                                <td>
                                                    <div className={styles.stayDates}>
                                                        <span className={styles.stayDateText}>
                                                            {new Date(booking.check_in_date).toLocaleDateString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                            <ArrowRight size={11} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#94a3b8' }} />
                                                            {new Date(booking.check_out_date).toLocaleDateString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className={styles.stayDuration}>
                                                            {nights} {nights === 1 ? 'Night' : 'Nights'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Pax */}
                                                <td>
                                                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                                                        {booking.adults || 1} A
                                                        {booking.children ? `, ${booking.children} C` : ''}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td>
                                                    <div className={styles.amountCell}>
                                                        <span className={styles.amountTotal}>
                                                            ₹{Number(booking.total_amount || 0).toLocaleString()}
                                                        </span>
                                                        {booking.advance_amount > 0 && (
                                                            <span className={styles.amountAdvance}>
                                                                ₹{Number(booking.advance_amount).toLocaleString()} Adv Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span
                                                        className={`${styles.statusPill} ${
                                                            booking.status === 'Checked In'
                                                                ? styles.pillCheckedIn
                                                                : styles.pillConfirmed
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className={styles.actionBtnRow}>
                                                        {booking.status === 'Confirmed' ? (
                                                            <Link
                                                                href={`/front-desk/checkin?search=${encodeURIComponent(
                                                                    guest?.first_name || ''
                                                                )}`}
                                                                className={styles.directCheckinBtn}
                                                            >
                                                                <UserCheck size={14} /> Check In
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={`/front-desk/checkout?room=${encodeURIComponent(
                                                                    room?.room_number || ''
                                                                )}`}
                                                                className={styles.directCheckoutBtn}
                                                            >
                                                                <LogOut size={14} /> Check Out
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
