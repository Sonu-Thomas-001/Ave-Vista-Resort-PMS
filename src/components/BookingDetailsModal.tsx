'use client';

import { useState, useMemo } from 'react';
import {
    X,
    User,
    Calendar,
    CreditCard,
    Mail,
    Phone,
    Send,
    MessageCircle,
    Building2,
    Users,
    Moon,
    Bookmark,
    Key,
    Pencil,
    FileText,
    CheckCircle2,
    Clock,
    Sparkles,
    Crown,
    Receipt,
    ArrowRight
} from 'lucide-react';
import styles from './BookingDetailsModal.module.css';
import { EmailService } from '@/lib/email-service';
import { InvoicePreviewModal } from './ui/InvoicePreviewModal';
import { InvoiceTemplate } from './InvoiceTemplate';

interface BookingDetailsModalProps {
    booking: any;
    onClose: () => void;
    onEdit?: (booking: any) => void;
}

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

const getInitials = (first?: string, last?: string) => {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    return 'G';
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

export default function BookingDetailsModal({ booking, onClose, onEdit }: BookingDetailsModalProps) {
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);

    if (!booking) return null;

    const guestObj = booking.guests || {};
    const guestName = `${guestObj.first_name || ''} ${guestObj.last_name || ''}`.trim() || 'Valued Guest';
    const initials = getInitials(guestObj.first_name, guestObj.last_name);
    const email = guestObj.email || '';
    const phone = guestObj.phone || '';
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    // Room info
    const roomInfo = booking.rooms || {};
    const roomNumber = roomInfo.room_number || booking.room_number || 'Unassigned';
    const roomType = roomInfo.type || booking.room_type || 'Standard Villa';

    // Calculate nights
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    // Financial calculations
    const roomRate = Number(booking.room_rate) || (nights > 0 ? (Number(booking.total_amount) || 0) / nights : 0);
    const roomTotal = roomRate * nights;
    const extraPax = Number(booking.extra_pax) || 0;
    const extraPaxRate = Number(booking.extra_pax_rate) || 600;
    const extraPaxTotal = extraPax * extraPaxRate * nights;
    const totalAmount = Number(booking.total_amount) || (roomTotal + extraPaxTotal);
    const advanceAmount = Number(booking.advance_amount) || 0;
    const balanceDue = Math.max(0, totalAmount - advanceAmount);
    const isSettled = balanceDue <= 0.01 || booking.status === 'Checked Out';

    const adults = booking.adults || 1;
    const children = booking.children || 0;
    const totalGuests = adults + children;

    const statusLower = (booking.status || 'confirmed').toLowerCase().replace(/\s+/g, '');

    const handleEmailInvoice = async () => {
        if (!email) return alert('No email address registered for this guest.');
        try {
            setSendingEmail(true);
            setEmailSuccess(false);
            await EmailService.triggerEmail('invoice-email', {
                invoice_number: booking.booking_number || booking.id.slice(0, 8).toUpperCase(),
                invoice_date: new Date().toISOString().split('T')[0],
                guest_name: guestName,
                email: email,
                booking_type: booking.source || 'Direct',
                room_number: roomNumber,
                room_type: roomType,
                total_amount: totalAmount,
                amount: totalAmount,
                payment_status: isSettled ? 'Paid' : 'Pending',
                payment_method: 'Direct',
                payment_mode: 'Direct',
                check_in_date: booking.check_in_date,
                check_out_date: booking.check_out_date,
                nights: nights,
                guests_count: totalGuests,
                room_rate: roomRate,
                extra_pax: extraPax,
                extra_pax_rate: extraPaxRate,
                gst_rate: 12,
                paid_amount: advanceAmount || (isSettled ? totalAmount : 0),
                balance_due: balanceDue,
                status: booking.status === 'Checked Out' ? 'Paid' : 'Pending',
                booking_id: booking.id
            });
            setEmailSuccess(true);
            setTimeout(() => setEmailSuccess(false), 4000);
        } catch (e) {
            console.error(e);
            alert('Failed to send invoice email.');
        } finally {
            setSendingEmail(false);
        }
    };

    // Synthesize invoice data for preview modal
    const synthesizedInvoice = useMemo(() => ({
        invoice_number: booking.booking_number ? `INV-${booking.booking_number}` : `INV-${booking.id.slice(0, 8).toUpperCase()}`,
        created_at: booking.created_at || new Date().toISOString(),
        total_amount: totalAmount,
        paid_amount: advanceAmount || (isSettled ? totalAmount : 0),
        status: isSettled ? 'Paid' : 'Pending',
        payment_mode: 'Direct / PMS',
        gst_rate: 12,
        room_number: roomNumber
    }), [booking, totalAmount, advanceAmount, isSettled, roomNumber]);

    return (
        <>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    {/* 1. Header Banner */}
                    <div className={styles.header}>
                        <div className={styles.headerGlow} />

                        <div className={styles.headerTopBar}>
                            <div className={styles.folioGroup}>
                                <div className={styles.folioTag}>
                                    <Bookmark size={12} />
                                    <span>#{booking.booking_number || booking.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className={styles.sourceTag}>
                                    <span>{booking.source || 'Direct Reservation'}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={styles.closeBtn}
                                onClick={onClose}
                                title="Close Details"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.heroRow}>
                            <div className={styles.heroRoomBox}>
                                <div className={styles.roomIconBox}>
                                    <Key size={24} />
                                </div>
                                <div className={styles.heroRoomMeta}>
                                    <h2 className={styles.heroRoomTitle}>
                                        {roomNumber !== 'Unassigned' ? `Room ${roomNumber}` : 'Unallocated Room'}
                                    </h2>
                                    <span className={styles.heroRoomSub}>{roomType}</span>
                                </div>
                            </div>

                            <div className={styles.heroStatusBox}>
                                <span
                                    className={`${styles.statusPill} ${
                                        styles[`status${statusLower}`] || styles.statusConfirmed
                                    }`}
                                >
                                    {booking.status === 'Checked In' && <span className={styles.beaconDot} />}
                                    {booking.status === 'Confirmed' && <Clock size={12} />}
                                    {booking.status === 'Checked Out' && <CheckCircle2 size={12} />}
                                    {booking.status || 'Confirmed'}
                                </span>

                                <div className={styles.heroDatesPill}>
                                    <Calendar size={12} />
                                    <span>{formatDate(booking.check_in_date)}</span>
                                    <ArrowRight size={11} style={{ opacity: 0.8 }} />
                                    <span>{formatDate(booking.check_out_date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Quick Metrics Bar */}
                    <div className={styles.metricsGrid}>
                        <div className={styles.metricTile}>
                            <span className={styles.metricLabel}>Duration</span>
                            <span className={`${styles.metricValue} ${styles.metricHighlight}`}>
                                {nights} {nights === 1 ? 'Night' : 'Nights'}
                            </span>
                        </div>
                        <div className={styles.metricTile}>
                            <span className={styles.metricLabel}>Occupancy</span>
                            <span className={styles.metricValue}>
                                {adults} Adult{adults > 1 ? 's' : ''}
                                {children > 0 ? `, ${children} Ch` : ''}
                            </span>
                        </div>
                        <div className={styles.metricTile}>
                            <span className={styles.metricLabel}>Total Billed</span>
                            <span className={styles.metricValue}>
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className={styles.metricTile}>
                            <span className={styles.metricLabel}>Settlement</span>
                            <span
                                className={`${styles.metricValue} ${
                                    isSettled ? styles.metricSettled : styles.metricDue
                                }`}
                            >
                                {isSettled ? 'Paid in Full' : `₹${balanceDue.toLocaleString('en-IN')} Due`}
                            </span>
                        </div>
                    </div>

                    {/* 3. Scrollable Content Body */}
                    <div className={styles.body}>
                        <div className={styles.cardsGrid}>
                            {/* Guest Details Card */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <User size={14} className={styles.cardHeaderIcon} />
                                    <span>Primary Guest Information</span>
                                </div>

                                <div className={styles.guestIdentity}>
                                    <div
                                        className={styles.guestAvatar}
                                        style={{ background: getAvatarBackground(guestName) }}
                                    >
                                        {initials}
                                    </div>
                                    <div className={styles.guestMeta}>
                                        <span className={styles.guestName}>
                                            {guestName}
                                            {guestObj.is_vip && (
                                                <span className={styles.vipPill}>
                                                    <Crown size={10} /> VIP
                                                </span>
                                            )}
                                        </span>
                                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                            Guest Folio ID: #{booking.guest_id ? String(booking.guest_id).slice(0, 8).toUpperCase() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.fieldList}>
                                    <div className={styles.fieldItem}>
                                        <Phone size={14} className={styles.fieldIcon} />
                                        <div className={styles.fieldData}>
                                            <span className={styles.fieldLabel}>Phone</span>
                                            {phone ? (
                                                <a href={`tel:${phone}`} className={styles.fieldLink}>
                                                    {phone}
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
                                            <span className={styles.fieldLabel}>Email</span>
                                            {email ? (
                                                <a href={`mailto:${email}`} className={styles.fieldLink}>
                                                    {email}
                                                </a>
                                            ) : (
                                                <span className={styles.fieldValue} style={{ color: '#94a3b8' }}>
                                                    Not provided
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {guestObj.company_name && (
                                        <div className={styles.fieldItem}>
                                            <Building2 size={14} className={styles.fieldIcon} />
                                            <div className={styles.fieldData}>
                                                <span className={styles.fieldLabel}>Company</span>
                                                <span className={styles.fieldValue}>{guestObj.company_name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stay & Room Details Card */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <Calendar size={14} className={styles.cardHeaderIcon} />
                                    <span>Stay & Allocation Details</span>
                                </div>

                                <div className={styles.fieldList}>
                                    <div className={styles.fieldItem}>
                                        <Calendar size={14} className={styles.fieldIcon} />
                                        <div className={styles.fieldData}>
                                            <span className={styles.fieldLabel}>Arrival / Departure</span>
                                            <span className={styles.fieldValue}>
                                                {formatDate(booking.check_in_date)} — {formatDate(booking.check_out_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.fieldItem}>
                                        <Moon size={14} className={styles.fieldIcon} />
                                        <div className={styles.fieldData}>
                                            <span className={styles.fieldLabel}>Duration</span>
                                            <span className={styles.fieldValue}>
                                                {nights} {nights === 1 ? 'Night' : 'Nights'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.fieldItem}>
                                        <Users size={14} className={styles.fieldIcon} />
                                        <div className={styles.fieldData}>
                                            <span className={styles.fieldLabel}>Guests Allocated</span>
                                            <span className={styles.fieldValue}>
                                                {adults} Adult{adults > 1 ? 's' : ''}
                                                {children > 0 ? `, ${children} Children` : ''}
                                                {extraPax > 0 ? ` (+${extraPax} Extra Pax)` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.fieldItem}>
                                        <Bookmark size={14} className={styles.fieldIcon} />
                                        <div className={styles.fieldData}>
                                            <span className={styles.fieldLabel}>Reservation Channel</span>
                                            <span className={styles.fieldValue}>
                                                {booking.source || 'Direct Booking'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financials & Tariff Breakdown Card */}
                        <div className={styles.financialsCard}>
                            <div className={styles.financesHeader}>
                                <h4 className={styles.financesTitle}>
                                    <CreditCard size={15} />
                                    Tariff Breakdown & Payment Status
                                </h4>
                                <span
                                    style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: '#166534',
                                        background: '#dcfce7',
                                        padding: '2px 8px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    GST Rate: 12%
                                </span>
                            </div>

                            <div className={styles.ratesTable}>
                                <div className={styles.rateRow}>
                                    <span>
                                        Room Tariff ({nights} {nights === 1 ? 'Night' : 'Nights'} × ₹{roomRate.toLocaleString('en-IN')})
                                    </span>
                                    <span className={styles.rateValue}>₹{roomTotal.toLocaleString('en-IN')}</span>
                                </div>

                                {extraPax > 0 && (
                                    <div className={styles.rateRow}>
                                        <span>
                                            Extra Pax ({extraPax} Pax × {nights} N × ₹{extraPaxRate})
                                        </span>
                                        <span className={styles.rateValue}>₹{extraPaxTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                {advanceAmount > 0 && (
                                    <div className={styles.rateRow} style={{ color: '#166534' }}>
                                        <span>Advance Deposited / Received</span>
                                        <span className={styles.rateValue} style={{ color: '#166534' }}>
                                            - ₹{advanceAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.divider} />

                                <div className={styles.totalRow}>
                                    <span>Total Billed Amount</span>
                                    <span className={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>

                                <div
                                    className={`${styles.balanceRow} ${
                                        isSettled ? styles.balanceSettledBox : styles.balanceDueBox
                                    }`}
                                >
                                    <span>Balance Settlement</span>
                                    <span>
                                        {isSettled
                                            ? 'Fully Settled (₹0.00)'
                                            : `₹${balanceDue.toLocaleString('en-IN')} Pending`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Footer Actions */}
                    <div className={styles.footer}>
                        <div className={styles.contactActions}>
                            {cleanPhone && (
                                <a
                                    href={`https://wa.me/${cleanPhone}?text=Hi ${encodeURIComponent(
                                        guestName
                                    )}, this is regarding your reservation #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()} at Ave Vista Resort.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.whatsAppBtn}
                                    title="WhatsApp Guest"
                                >
                                    <MessageCircle size={15} />
                                    WhatsApp
                                </a>
                            )}

                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                onClick={handleEmailInvoice}
                                disabled={sendingEmail || !email}
                                title="Email Invoice / Confirmation"
                            >
                                {sendingEmail ? (
                                    <span className={styles.spinner} />
                                ) : emailSuccess ? (
                                    <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                                ) : (
                                    <Send size={15} />
                                )}
                                {sendingEmail ? 'Sending...' : emailSuccess ? 'Email Sent!' : 'Email Invoice'}
                            </button>
                        </div>

                        <div className={styles.footerActions}>
                            <button
                                type="button"
                                className={styles.invoiceBtn}
                                onClick={() => setShowInvoicePreview(true)}
                                title="Preview and Print Official Invoice"
                            >
                                <Receipt size={15} />
                                View Invoice
                            </button>

                            {onEdit && (
                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={() => onEdit(booking)}
                                    title="Edit Reservation Details"
                                >
                                    <Pencil size={14} />
                                    Edit Booking
                                </button>
                            )}

                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Invoice Preview Modal */}
            {showInvoicePreview && (
                <InvoicePreviewModal
                    isOpen={showInvoicePreview}
                    onClose={() => setShowInvoicePreview(false)}
                    title={`Folio Invoice #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}`}
                    subtitle={`${guestName} • Room ${roomNumber}`}
                    filename={`Invoice_${booking.booking_number || 'Folio'}_${guestName.replace(/\s+/g, '_')}`}
                >
                    <InvoiceTemplate
                        invoice={synthesizedInvoice}
                        booking={booking}
                        guest={guestObj}
                    />
                </InvoicePreviewModal>
            )}
        </>
    );
}
