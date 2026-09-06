'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
    Search,
    User,
    Phone,
    Mail,
    FileText,
    Calendar,
    IndianRupee,
    Clock,
    History,
    Edit2,
    Building2,
    MapPin,
    Hash,
    Crown,
    CheckCircle2,
    Key,
    ShieldCheck,
    Plus,
    X,
    Sparkles,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import GuestModal from '@/components/GuestModal';

// Deterministic luxury gradients for avatars
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
];

const getAvatarBackground = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    return AVATAR_GRADIENTS[charCode % AVATAR_GRADIENTS.length];
};

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'G';
};

export default function GuestLookupPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Matches & Selected Guest
    const [matchedGuests, setMatchedGuests] = useState<any[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalSpent: 0,
        totalStays: 0,
        avgStay: 0,
        currentStatus: 'Past Patron',
        currentRoom: '-'
    });

    // Modal State
    const [showModal, setShowModal] = useState(false);

    // Initial search query from URL parameter
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const initialQuery = params.get('search') || params.get('id');
            if (initialQuery) {
                setSearchQuery(initialQuery);
                performSearch(initialQuery);
            }
        }
    }, []);

    const performSearch = async (queryTerm: string) => {
        if (!queryTerm.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setSelectedGuest(null);
        setMatchedGuests([]);
        setHistory([]);

        try {
            // 1. Search for matching guests (up to 8 matches)
            const { data: guests, error } = await supabase
                .from('guests')
                .select('*')
                .or(
                    `first_name.ilike.%${queryTerm}%,last_name.ilike.%${queryTerm}%,email.ilike.%${queryTerm}%,phone.ilike.%${queryTerm}%,id_proof_number.ilike.%${queryTerm}%,company_name.ilike.%${queryTerm}%`
                )
                .limit(8);

            if (error) throw error;

            if (guests && guests.length > 0) {
                setMatchedGuests(guests);
                // Automatically select the first match
                loadGuestProfile(guests[0]);
            }
        } catch (err) {
            console.error('Guest lookup search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadGuestProfile = async (guest: any) => {
        setSelectedGuest(guest);

        try {
            // Fetch reservation history & rooms
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*, rooms(room_number, type)')
                .eq('guest_id', guest.id)
                .order('created_at', { ascending: false });

            if (bookings) {
                setHistory(bookings);

                // Compute Stats
                const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
                const totalStays = bookings.filter(b => b.status === 'Checked Out').length;

                // Duration Calculation
                const totalNights = bookings.reduce((sum, b) => {
                    const start = new Date(b.check_in_date).getTime();
                    const end = new Date(b.check_out_date).getTime();
                    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(1, diff);
                }, 0);

                const avgStay = bookings.length > 0 ? Math.round(totalNights / bookings.length) : 0;

                // Check Current In-House Status
                const activeStay = bookings.find(b => b.status === 'Checked In');
                const currentStatus = activeStay
                    ? 'In-House'
                    : bookings.some(b => b.status === 'Confirmed')
                    ? 'Upcoming'
                    : 'Past Patron';
                const currentRoom = activeStay?.rooms?.room_number || '-';

                setStats({
                    totalSpent,
                    totalStays: totalStays || (bookings.length > 0 ? bookings.length : 0),
                    avgStay,
                    currentStatus,
                    currentRoom
                });
            }
        } catch (e) {
            console.error('Error loading guest profile data:', e);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    const fullName = selectedGuest
        ? `${selectedGuest.first_name || ''} ${selectedGuest.last_name || ''}`.trim()
        : '';

    return (
        <>
            <Header title="Guest Details Checker" />

            <div className={styles.container}>
                {/* 1. Search Section */}
                <div className={styles.searchSection}>
                    <div className={styles.searchHeader}>
                        <div>
                            <h2 className={styles.searchTitle}>Resort Guest Profile Lookup</h2>
                            <p className={styles.searchSubtitle}>
                                Inspect identity verification, stay history, lifetime spend, and current in-house folio.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
                        <div className={styles.inputWrapper}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by Guest Name, Phone, Email, ID Number, or Company..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className={styles.clearSearchBtn}
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                        <button type="submit" className={styles.searchBtn} disabled={loading}>
                            {loading ? (
                                <>
                                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={16} />
                                    <span>Check Profile</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Multiple Matches Selection Drawer */}
                    {matchedGuests.length > 1 && (
                        <div className={styles.matchesBar}>
                            <span className={styles.matchesLabel}>
                                {matchedGuests.length} Matching Profiles Found:
                            </span>
                            <div className={styles.matchesPills}>
                                {matchedGuests.map(g => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        className={`${styles.matchPill} ${
                                            selectedGuest?.id === g.id ? styles.matchPillActive : ''
                                        }`}
                                        onClick={() => loadGuestProfile(g)}
                                    >
                                        <User size={13} />
                                        <span>
                                            {g.first_name} {g.last_name}
                                        </span>
                                        <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>
                                            ({g.phone || g.email || 'ID'})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Empty State */}
                {!loading && hasSearched && matchedGuests.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconBox}>
                            <User size={32} />
                        </div>
                        <h3 className={styles.emptyTitle}>No Guest Record Found</h3>
                        <p className={styles.emptyDesc}>
                            No guest matches the search term "{searchQuery}". Double-check phone number, spelling, or
                            government ID number.
                        </p>
                    </div>
                )}

                {/* 3. Selected Guest Profile Results */}
                {selectedGuest && (
                    <>
                        {/* Profile Header Card */}
                        <div className={styles.profileCard}>
                            <div className={styles.profileHeroBar}>
                                <div className={styles.heroIdentity}>
                                    <div className={styles.avatarWrapper}>
                                        <div
                                            className={styles.avatar}
                                            style={{ background: getAvatarBackground(fullName) }}
                                        >
                                            {getInitials(fullName)}
                                        </div>
                                        {selectedGuest.is_vip ? (
                                            <div className={`${styles.avatarCornerBadge} ${styles.cornerBadgeVip}`} title="VIP Clientele">
                                                <Crown size={12} strokeWidth={2.5} />
                                            </div>
                                        ) : stats.currentStatus === 'In-House' ? (
                                            <div className={`${styles.avatarCornerBadge} ${styles.cornerBadgeInHouse}`} title="Currently In-House">
                                                <Key size={12} strokeWidth={2.5} />
                                            </div>
                                        ) : stats.currentStatus === 'Upcoming' ? (
                                            <div className={`${styles.avatarCornerBadge} ${styles.cornerBadgeUpcoming}`} title="Upcoming Reservation">
                                                <Clock size={12} strokeWidth={2.5} />
                                            </div>
                                        ) : (
                                            <div className={`${styles.avatarCornerBadge} ${styles.cornerBadgePast}`} title="Past Guest">
                                                <History size={12} strokeWidth={2.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.heroMeta}>
                                        <div className={styles.nameGroup}>
                                            <h2 className={styles.guestName}>{fullName}</h2>
                                            {selectedGuest.is_vip && (
                                                <span className={styles.vipBadge}>
                                                    <Crown size={12} /> VIP Clientele
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.heroSubRow}>
                                            <span className={styles.guestIdBadge} title="PMS Guest Identification Folio">
                                                <span className={styles.idLabel}>ID</span>
                                                <span className={styles.idCode}>#{String(selectedGuest.id).slice(0, 8).toUpperCase()}</span>
                                            </span>

                                            {stats.currentStatus === 'In-House' ? (
                                                <span className={`${styles.statusCapsule} ${styles.statusInHouse}`}>
                                                    <span className={`${styles.statusDot} ${styles.pulseDot}`} />
                                                    In-House {stats.currentRoom !== '-' ? `• Room ${stats.currentRoom}` : ''}
                                                </span>
                                            ) : stats.currentStatus === 'Upcoming' ? (
                                                <span className={`${styles.statusCapsule} ${styles.statusUpcoming}`}>
                                                    <span className={`${styles.statusDot} ${styles.pulseDot}`} />
                                                    Upcoming Reservation
                                                </span>
                                            ) : (
                                                <span className={`${styles.statusCapsule} ${styles.statusPast}`}>
                                                    <span className={styles.statusDot} />
                                                    Past Guest
                                                </span>
                                            )}

                                            <span className={styles.tierPill}>
                                                <Sparkles size={11} />
                                                {stats.totalStays > 1 ? `${stats.totalStays} Stays` : stats.totalStays === 1 ? '1 Stay' : 'New Guest'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actionSection}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => setShowModal(true)}
                                        title="Edit Guest Profile"
                                    >
                                        <Edit2 size={14} /> Edit Profile
                                    </button>
                                    <Link
                                        href={`/bookings`}
                                        className={`${styles.actionBtn} ${styles.primaryActionBtn}`}
                                    >
                                        <Plus size={14} /> New Reservation
                                    </Link>
                                </div>
                            </div>

                            {/* Two Balanced Executive Information Panels */}
                            <div className={styles.panelsGrid}>
                                {/* Panel 1: Contact & Communication */}
                                <div className={styles.panelCard}>
                                    <div className={styles.panelHeader}>
                                        <Mail size={14} /> Contact & Communication
                                    </div>
                                    <div className={styles.panelRowList}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>Email Address</span>
                                            <span className={styles.infoRowVal}>
                                                {selectedGuest.email ? (
                                                    <a href={`mailto:${selectedGuest.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {selectedGuest.email}
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>None on file</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>Phone Number</span>
                                            <span className={styles.infoRowVal}>
                                                {selectedGuest.phone ? (
                                                    <a href={`tel:${selectedGuest.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {selectedGuest.phone}
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>None on file</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>Registered Address</span>
                                            <span className={styles.infoRowVal}>
                                                <MapPin size={14} /> {selectedGuest.address || 'Address not registered'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel 2: Corporate & Identity Verification */}
                                <div className={styles.panelCard}>
                                    <div className={styles.panelHeader}>
                                        <ShieldCheck size={14} /> Corporate & Identity Verification
                                    </div>
                                    <div className={styles.panelRowList}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>Corporate Account</span>
                                            <span className={styles.infoRowVal}>
                                                <Building2 size={14} /> {selectedGuest.company_name || 'Individual Guest'}
                                            </span>
                                        </div>

                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>GSTIN Registration</span>
                                            <span className={styles.infoRowVal}>
                                                {selectedGuest.gst_number ? (
                                                    <span className={styles.monoTag}>{selectedGuest.gst_number}</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>Unregistered</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.infoRow}>
                                            <span className={styles.infoRowLabel}>Government ID Document</span>
                                            <div className={styles.infoRowVal}>
                                                {selectedGuest.id_proof_type ? (
                                                    <div className={styles.idProofRow}>
                                                        <span className={styles.idTypeLabel}>{selectedGuest.id_proof_type}:</span>
                                                        <span className={styles.monoTag}>{selectedGuest.id_proof_number || 'On File'}</span>
                                                        <span className={styles.verifiedChip}>
                                                            <ShieldCheck size={11} /> Verified
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>No document recorded</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedGuest.notes && (
                                    <div className={styles.notesQuoteBox}>
                                        <FileText size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <strong>Guest Notes: </strong>
                                            {selectedGuest.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Executive Analytics Stats Ribbon */}
                        <div className={styles.statsGrid}>
                            <div className={`${styles.statCard} ${styles.blueStat}`}>
                                <div className={styles.statIconBox}>
                                    <IndianRupee size={22} />
                                </div>
                                <div className={styles.statDetails}>
                                    <span className={styles.statLabel}>Lifetime Resort Spend</span>
                                    <span className={styles.statVal}>₹{stats.totalSpent.toLocaleString()}</span>
                                    <span className={styles.statSub}>Across all bookings</span>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.greenStat}`}>
                                <div className={styles.statIconBox}>
                                    <History size={22} />
                                </div>
                                <div className={styles.statDetails}>
                                    <span className={styles.statLabel}>Completed Stays</span>
                                    <span className={styles.statVal}>{stats.totalStays}</span>
                                    <span className={styles.statSub}>Visits to Ave Vista</span>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.purpleStat}`}>
                                <div className={styles.statIconBox}>
                                    <Clock size={22} />
                                </div>
                                <div className={styles.statDetails}>
                                    <span className={styles.statLabel}>Average Stay</span>
                                    <span className={styles.statVal}>{stats.avgStay} Days</span>
                                    <span className={styles.statSub}>Per reservation duration</span>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.amberStat}`}>
                                <div className={styles.statIconBox}>
                                    <Key size={22} />
                                </div>
                                <div className={styles.statDetails}>
                                    <span className={styles.statLabel}>Current Status</span>
                                    <span className={styles.statVal}>{stats.currentStatus}</span>
                                    <span className={styles.statSub}>
                                        {stats.currentRoom !== '-' ? `Room ${stats.currentRoom}` : 'No active stay'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Booking & Stay History Ledger */}
                        <div className={styles.historyCard}>
                            <div className={styles.historyHeader}>
                                <h3 className={styles.historyTitle}>Reservation & Billing Ledger</h3>
                                <span className={styles.historyCount}>{history.length} Records</span>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>Check-In</th>
                                            <th>Check-Out</th>
                                            <th>Accommodation</th>
                                            <th>Total Folio</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                                    No reservation history found for this profile.
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map(b => (
                                                <tr key={b.id} className={styles.tableRow}>
                                                    <td className={styles.bookingIdCell}>
                                                        #{b.booking_number || b.id.slice(0, 8)}
                                                    </td>
                                                    <td>{b.check_in_date}</td>
                                                    <td>{b.check_out_date}</td>
                                                    <td>
                                                        <span className={styles.roomCellBadge}>
                                                            <Key size={12} style={{ color: '#0284c7' }} />
                                                            Room {b.rooms?.room_number || 'Assigned'} ({b.rooms?.type})
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        ₹{Number(b.total_amount || 0).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`${styles.statusPill} ${
                                                                b.status === 'Checked In'
                                                                    ? styles.statusCheckedIn
                                                                    : b.status === 'Confirmed'
                                                                    ? styles.statusConfirmed
                                                                    : b.status === 'Checked Out'
                                                                    ? styles.statusCheckedOut
                                                                    : styles.statusCancelled
                                                            }`}
                                                        >
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Guest Profile Modal */}
            {showModal && selectedGuest && (
                <GuestModal
                    guest={selectedGuest}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        performSearch(selectedGuest.phone || selectedGuest.email || selectedGuest.first_name);
                    }}
                />
            )}
        </>
    );
}
