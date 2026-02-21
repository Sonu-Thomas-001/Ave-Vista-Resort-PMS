'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Search, User, Phone, Mail, FileText, CalendarDays, IndianRupee, Clock, History, Edit2, Building2, MapPin, Hash, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import GuestModal from '@/components/GuestModal';

export default function GuestLookupPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [guest, setGuest] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalSpent: 0, totalStays: 0, avgStay: 0 });
    const [hasSearched, setHasSearched] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setGuest(null);
        setHistory([]);

        try {
            // 1. Find Guest
            const { data: guests, error } = await supabase
                .from('guests')
                .select('*')
                .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,id_proof_number.ilike.%${searchQuery}%`)
                .limit(1);

            if (error) throw error;

            if (guests && guests.length > 0) {
                const foundGuest = guests[0];
                setGuest(foundGuest);

                // 2. Fetch History & Stats
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('*, rooms(room_number, type)')
                    .eq('guest_id', foundGuest.id)
                    .order('created_at', { ascending: false });

                if (bookings) {
                    setHistory(bookings);

                    // Calculate Stats
                    const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
                    const totalStays = bookings.filter(b => b.status === 'Checked Out').length;

                    // Avg Stay Duration
                    const totalNights = bookings.reduce((sum, b) => {
                        const start = new Date(b.check_in_date).getTime();
                        const end = new Date(b.check_out_date).getTime();
                        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    }, 0);
                    const avgStay = bookings.length > 0 ? Math.round(totalNights / bookings.length) : 0;

                    setStats({ totalSpent, totalStays, avgStay });
                }
            }
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = () => {
        setShowModal(false);
        // Re-fetch with the current query to get updated guest data
        handleSearch();
    };

    return (
        <>
            <Header title="Guest Details Checker" />
            <div className={styles.container}>

                {/* Search Section */}
                <div className={styles.searchSection}>
                    <div className={styles.searchHeader}>
                        <h1>Find Guest Profile</h1>
                    </div>
                    <form onSubmit={handleSearch} className={styles.searchBox}>
                        <div className={styles.inputWrapper}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Search by Name, Email, Phone or ID Number..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={styles.searchBtn} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className={styles.resultsContainer}>
                    {!loading && hasSearched && !guest && (
                        <div className={styles.emptyState}>
                            <User size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <h3>No guest found matching "{searchQuery}"</h3>
                            <p>Try searching with a different keyword.</p>
                        </div>
                    )}

                    {guest && (
                        <>
                            {/* Profile Card */}
                            <div className={styles.profileCard}>
                                <div className={styles.avatar} data-letter={guest.first_name[0]?.toUpperCase()}>
                                    {guest.first_name[0]}{guest.last_name ? guest.last_name[0] : ''}
                                </div>
                                <div className={styles.profileInfo}>
                                    <div className={styles.profileHeader}>
                                        <div className={styles.nameSection}>
                                            <h2>{guest.first_name} {guest.last_name}</h2>
                                            {guest.is_vip && <span className={`${styles.badge} ${styles.vipBadge}`}><Crown size={14} /> VIP Guest</span>}
                                        </div>
                                        <div className={styles.actionSection}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => setShowModal(true)}
                                            >
                                                <Edit2 size={16} /> Edit Profile
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>Email Address</span>
                                            <span className={styles.value}><Mail size={16} /> {guest.email || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>Phone Number</span>
                                            <span className={styles.value}><Phone size={16} /> {guest.phone || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>Company</span>
                                            <span className={styles.value}><Building2 size={16} /> {guest.company_name || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>GST Number</span>
                                            <span className={styles.value}><Hash size={16} /> {guest.gst_number || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>Address</span>
                                            <span className={styles.value}><MapPin size={16} /> {guest.address || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>ID Proof Type</span>
                                            <span className={styles.value}><FileText size={16} /> {guest.id_proof_type || 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>ID Number</span>
                                            <span className={styles.value}><Hash size={16} /> {guest.id_proof_number || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.blueIcon}`}>
                                        <IndianRupee size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Total Spent</span>
                                        <span className={styles.statValue}>₹{stats.totalSpent.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.greenIcon}`}>
                                        <History size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Total Stays</span>
                                        <span className={styles.statValue}>{stats.totalStays}</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
                                        <Clock size={24} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>Avg. Stay</span>
                                        <span className={styles.statValue}>{stats.avgStay} Days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking History */}
                            <div className={styles.historySection}>
                                <div className={styles.sectionHeader}>
                                    <h3>Booking History</h3>
                                </div>
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Booking ID</th>
                                                <th>Check-in</th>
                                                <th>Check-out</th>
                                                <th>Room</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((booking) => (
                                                <tr key={booking.id}>
                                                    <td>{booking.booking_number || booking.id.slice(0, 8)}</td>
                                                    <td>{booking.check_in_date}</td>
                                                    <td>{booking.check_out_date}</td>
                                                    <td>{booking.rooms?.room_number} ({booking.rooms?.type})</td>
                                                    <td>₹{booking.total_amount}</td>
                                                    <td>
                                                        <span className={`${styles.statusIndicator} ${styles['statusindicator' + booking.status.replace(/\s/g, '')]}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {history.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                                                        No booking history found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && guest && (
                <GuestModal
                    guest={guest}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}
