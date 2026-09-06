'use client';

import { useMemo } from 'react';
import {
    X,
    User,
    Phone,
    Mail,
    MapPin,
    Building2,
    Crown,
    Key,
    Calendar,
    FileText,
    Sparkles,
    Edit2,
    MessageCircle,
    CheckCircle2,
    Clock,
    Moon,
    Users
} from 'lucide-react';
import styles from './GuestDetailsModal.module.css';

export interface GuestBookingItem {
    id?: string;
    booking_number?: string;
    status: string;
    rooms?: { room_number: string; type?: string } | { room_number: string; type?: string }[] | null;
    check_in_date: string;
    check_out_date: string;
    total_amount?: number;
    adults?: number;
    children?: number;
}

export interface GuestDetailsModalData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name?: string;
    gst_number?: string;
    address?: string;
    is_vip: boolean;
    notes?: string;
    created_at?: string;
    bookings?: GuestBookingItem[];
    computedStatus?: string;
    currentRoom?: string;
    totalStays?: number;
}

interface GuestDetailsModalProps {
    guest: GuestDetailsModalData | null;
    onClose: () => void;
    onEdit?: (guest: GuestDetailsModalData) => void;
}

// Gradients matching Ave Vista's design
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

const getInitials = (first: string, last: string) => {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    return 'G';
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 1;
    try {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const diff = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    } catch {
        return 1;
    }
};

export default function GuestDetailsModal({ guest, onClose, onEdit }: GuestDetailsModalProps) {
    if (!guest) return null;

    const fullName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest Profile';
    const initials = getInitials(guest.first_name, guest.last_name);

    // Compute status if not already passed
    const status = useMemo(() => {
        if (guest.computedStatus) return guest.computedStatus;
        if (!guest.bookings || guest.bookings.length === 0) return 'Past Guest';
        const today = new Date().toISOString().split('T')[0];
        const hasCheckedIn = guest.bookings.some(b => b.status === 'Checked In');
        if (hasCheckedIn) return 'In-House';
        const hasUpcoming = guest.bookings.some(b => b.status === 'Confirmed' && b.check_in_date >= today);
        if (hasUpcoming) return 'Reserved';
        return 'Past Guest';
    }, [guest]);

    // Compute current room
    const currentRoom = useMemo(() => {
        if (guest.currentRoom) return guest.currentRoom;
        if (!guest.bookings) return '-';
        const activeBooking = guest.bookings.find(b => b.status === 'Checked In');
        if (activeBooking && activeBooking.rooms) {
            const r = activeBooking.rooms;
            return Array.isArray(r) ? r[0]?.room_number : r?.room_number;
        }
        return '-';
    }, [guest]);

    const totalStays = guest.totalStays ?? (guest.bookings ? guest.bookings.length : 0);

    // Calculate total spend if bookings contain amounts
    const totalSpend = useMemo(() => {
        if (!guest.bookings) return 0;
        return guest.bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    }, [guest.bookings]);

    const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, '') : '';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 1. Header Banner */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />
                    
                    <div className={styles.headerTopBar}>
                        <div className={styles.folioTag}>
                            <User size={12} />
                            <span>Guest Folio • #{guest.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close guest details"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.guestHero}>
                        <div
                            className={styles.avatar}
                            style={{ background: getAvatarBackground(fullName) }}
                        >
                            {initials}
                        </div>

                        <div className={styles.guestHeroMeta}>
                            <div className={styles.nameRow}>
                                <h2 className={styles.guestName}>{fullName}</h2>
                                {guest.is_vip && (
                                    <span className={styles.vipBadge}>
                                        <Crown size={12} /> VIP Clientele
                                    </span>
                                )}
                            </div>

                            <div className={styles.subRow}>
                                <span className={styles.statusCapsule}>
                                    <span
                                        className={`${styles.statusDot} ${status === 'In-House' ? styles.pulseDot : ''}`}
                                        style={{
                                            backgroundColor:
                                                status === 'In-House' ? '#4ade80' : status === 'Reserved' ? '#60a5fa' : '#94a3b8'
                                        }}
                                    />
                                    {status} {currentRoom && currentRoom !== '-' ? `• Room ${currentRoom}` : ''}
                                </span>

                                <span className={styles.staysTag}>
                                    <Sparkles size={11} />
                                    {totalStays} {totalStays === 1 ? 'Stay Record' : 'Stay Records'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Metrics Strip */}
                <div className={styles.metricsGrid}>
                    <div className={styles.metricTile}>
                        <span className={styles.metricLabel}>Total Stays</span>
                        <span className={`${styles.metricValue} ${styles.metricValueHighlight}`}>
                            {totalStays}
                        </span>
                    </div>
                    <div className={styles.metricTile}>
                        <span className={styles.metricLabel}>Assigned Room</span>
                        <span className={styles.metricValue}>
                            {currentRoom && currentRoom !== '-' ? `Room ${currentRoom}` : 'None'}
                        </span>
                    </div>
                    <div className={styles.metricTile}>
                        <span className={styles.metricLabel}>Client Tier</span>
                        <span className={styles.metricValue}>
                            {guest.is_vip ? 'VIP Luxury' : 'Standard'}
                        </span>
                    </div>
                    <div className={styles.metricTile}>
                        <span className={styles.metricLabel}>Total Spend</span>
                        <span className={styles.metricValue}>
                            {totalSpend > 0 ? `₹${totalSpend.toLocaleString('en-IN')}` : '—'}
                        </span>
                    </div>
                </div>

                {/* 3. Scrollable Content Body */}
                <div className={styles.body}>
                    {/* Information Cards Grid */}
                    <div className={styles.cardsGrid}>
                        {/* Contact Information */}
                        <div className={styles.infoCard}>
                            <h4 className={styles.cardTitle}>
                                <Phone size={14} className={styles.cardTitleIcon} />
                                Contact Information
                            </h4>
                            <div className={styles.fieldList}>
                                <div className={styles.fieldItem}>
                                    <Phone size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>Phone Number</span>
                                        {guest.phone ? (
                                            <a href={`tel:${guest.phone}`} className={styles.fieldLink}>
                                                {guest.phone}
                                            </a>
                                        ) : (
                                            <span className={styles.fieldValue} style={{ color: '#94a3b8' }}>
                                                Not provided
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.fieldItem}>
                                    <Mail size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>Email Address</span>
                                        {guest.email ? (
                                            <a href={`mailto:${guest.email}`} className={styles.fieldLink}>
                                                {guest.email}
                                            </a>
                                        ) : (
                                            <span className={styles.fieldValue} style={{ color: '#94a3b8' }}>
                                                Not provided
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.fieldItem}>
                                    <MapPin size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>Residential Address</span>
                                        <span className={styles.fieldValue}>
                                            {guest.address || 'No address registered'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corporate & Identity Card */}
                        <div className={styles.infoCard}>
                            <h4 className={styles.cardTitle}>
                                <Building2 size={14} className={styles.cardTitleIcon} />
                                Corporate & Billing
                            </h4>
                            <div className={styles.fieldList}>
                                <div className={styles.fieldItem}>
                                    <Building2 size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>Company Name</span>
                                        <span className={styles.fieldValue}>
                                            {guest.company_name || 'Individual / Personal'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.fieldItem}>
                                    <FileText size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>GSTIN / Tax ID</span>
                                        <span className={styles.fieldValue}>
                                            {guest.gst_number || 'Not registered'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.fieldItem}>
                                    <Calendar size={14} className={styles.fieldIcon} />
                                    <div className={styles.fieldData}>
                                        <span className={styles.fieldLabel}>Client Since</span>
                                        <span className={styles.fieldValue}>
                                            {formatDate(guest.created_at || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Special Preferences */}
                    {guest.notes && (
                        <div className={styles.notesCard}>
                            <div className={styles.notesHeader}>
                                <FileText size={14} />
                                Special Preferences & Guest Notes
                            </div>
                            <p className={styles.notesContent}>{guest.notes}</p>
                        </div>
                    )}

                    {/* Stay History / Reservations */}
                    <div className={styles.historySection}>
                        <div className={styles.historyHeader}>
                            <h3 className={styles.historyTitle}>
                                <Calendar size={15} style={{ color: '#0284c7' }} />
                                Stay & Reservation History
                                <span className={styles.historyCountBadge}>
                                    {guest.bookings ? guest.bookings.length : 0}
                                </span>
                            </h3>
                        </div>

                        {guest.bookings && guest.bookings.length > 0 ? (
                            <div className={styles.bookingsList}>
                                {guest.bookings.map((booking, idx) => {
                                    const roomInfo = Array.isArray(booking.rooms)
                                        ? booking.rooms[0]
                                        : booking.rooms;
                                    const roomNumber = roomInfo?.room_number || 'Unassigned';
                                    const roomType = roomInfo?.type || 'Room';
                                    const nights = calculateNights(booking.check_in_date, booking.check_out_date);

                                    const isCurrent = booking.status === 'Checked In';
                                    const isReserved = booking.status === 'Confirmed';
                                    const isCancelled = booking.status === 'Cancelled';

                                    return (
                                        <div key={booking.id || idx} className={styles.bookingCard}>
                                            <div className={styles.bookingLeft}>
                                                <div className={styles.roomTag}>
                                                    <span className={styles.roomNum}>
                                                        {roomNumber !== 'Unassigned' ? `#${roomNumber}` : '—'}
                                                    </span>
                                                    <span className={styles.roomType}>{roomType}</span>
                                                </div>

                                                <div className={styles.bookingDetails}>
                                                    <div className={styles.bookingDates}>
                                                        <span>{formatDate(booking.check_in_date)}</span>
                                                        <span style={{ color: '#94a3b8' }}>→</span>
                                                        <span>{formatDate(booking.check_out_date)}</span>
                                                    </div>
                                                    <div className={styles.bookingSub}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                            <Moon size={12} /> {nights} {nights === 1 ? 'Night' : 'Nights'}
                                                        </span>
                                                        {(booking.adults || booking.children) && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                <Users size={12} /> {booking.adults || 1} Adult
                                                                {(booking.adults || 1) > 1 ? 's' : ''}
                                                                {booking.children ? `, ${booking.children} Ch` : ''}
                                                            </span>
                                                        )}
                                                        {booking.booking_number && (
                                                            <span style={{ color: '#64748b', fontWeight: 600 }}>
                                                                #{booking.booking_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.bookingRight}>
                                                <span
                                                    className={`${styles.bookingStatus} ${
                                                        isCurrent
                                                            ? styles.statusCheckedIn
                                                            : isReserved
                                                            ? styles.statusReserved
                                                            : isCancelled
                                                            ? styles.statusCancelled
                                                            : styles.statusCheckedOut
                                                    }`}
                                                >
                                                    {isCurrent && <CheckCircle2 size={11} />}
                                                    {isReserved && <Clock size={11} />}
                                                    {booking.status}
                                                </span>

                                                {booking.total_amount ? (
                                                    <span className={styles.bookingAmount}>
                                                        ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyHistory}>
                                No reservation records found for this guest folio.
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Footer Actions */}
                <div className={styles.footer}>
                    {cleanPhone ? (
                        <a
                            href={`https://wa.me/${cleanPhone}?text=Hello ${encodeURIComponent(
                                fullName
                            )}, contacting you from Ave Vista Resort & PMS regarding your stay.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsAppBtn}
                            title="Message guest on WhatsApp"
                        >
                            <MessageCircle size={15} />
                            WhatsApp
                        </a>
                    ) : (
                        <div />
                    )}

                    <div className={styles.footerActions}>
                        <button
                            type="button"
                            className={styles.closeBtnSecondary}
                            onClick={onClose}
                        >
                            Close
                        </button>
                        {onEdit && (
                            <button
                                type="button"
                                className={styles.editBtnPrimary}
                                onClick={() => onEdit(guest)}
                            >
                                <Edit2 size={14} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
