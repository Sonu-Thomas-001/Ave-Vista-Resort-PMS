import React from 'react';
import { Phone, Mail, Globe, FileText, Calendar, User, Home, CreditCard, CheckCircle2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import styles from './InvoiceTemplate.module.css';
import { isSpecialRoomType, getQuantityLabel } from '@/lib/constants';

interface InvoiceTemplateProps {
    invoice: any;
    booking: any;
    guest: any;
    printRef?: React.RefObject<HTMLDivElement | null>;
}

export const InvoiceTemplate = ({ invoice, booking, guest, printRef }: InvoiceTemplateProps) => {
    if (!invoice || !booking) return null;

    // Safely calculate nights, ensuring we get a positive number and at least 1 night
    const checkInTime = new Date(booking.check_in_date).getTime();
    const checkOutTime = new Date(booking.check_out_date).getTime();
    const nights = Math.max(1, Math.ceil(Math.abs(checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)));

    // 1st priority: invoice amount. 2nd: booking total. Fallback: 0
    const subTotal = invoice.total_amount || invoice.amount || booking.total_price || 0;
    const gstRate = invoice.gst_rate || 0;
    const gstAmount = (subTotal * gstRate) / 100;
    const grandTotal = subTotal + gstAmount;
    const paidAmount = Number(invoice.paid_amount) || 0;
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const isSettled = balanceDue <= 0.5;

    const invoiceData = {
        no: invoice.invoice_number,
        date: new Date(invoice.created_at || invoice.generated_at || Date.now()).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        bookingRef: booking.booking_number || booking.id?.slice(0, 8).toUpperCase(),
        source: booking.source || 'Direct Reservation',
        paymentMode: invoice.payment_mode || invoice.payment_method || 'Cash',
    };

    const roomType = booking.room_type || booking.room?.type || 'Luxury Villa';
    const roomNumber = invoice.room_number || booking.room?.room_number || booking.room_number || 'TBD';
    const isSpecial = isSpecialRoomType(roomType);
    const qtyLabel = getQuantityLabel(roomType);

    const roomRate = booking.room_rate || (subTotal / (isSpecial ? 1 : nights));
    const extraPax = booking.extra_pax || 0;
    const extraPaxRate = booking.extra_pax_rate || 600;
    const extraPaxTotal = extraPax * extraPaxRate * (isSpecial ? 1 : nights);
    const roomTotal = roomRate * (isSpecial ? (booking.special_quantity || 1) : nights);

    const guestName = guest
        ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Valued Guest'
        : 'Valued Guest';

    return (
        <div className={styles.container} ref={printRef}>
            {/* ─── Executive Letterhead ─── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.brandName}>
                        <Sparkles size={22} style={{ color: '#0284C7' }} />
                        Ave Vista Resorts & Hotels
                    </h1>
                    <p className={styles.brandSub}>Hospitality • Luxury Suites • Fine Dining</p>
                    <p className={styles.address}>
                        Balapuram, Vayattuparamba, Kannur, Kerala – 670582
                    </p>
                    <div className={styles.contactBar}>
                        <span className={styles.contactItem}>
                            <Phone size={12} /> +91 90615 54545
                        </span>
                        <span className={styles.barDivider}>•</span>
                        <span className={styles.contactItem}>
                            <Mail size={12} /> avevistaresort@gmail.com
                        </span>
                        <span className={styles.barDivider}>•</span>
                        <span className={styles.contactItem}>
                            <Globe size={12} /> www.avevistaresorts.com
                        </span>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.taxBadge}>
                        <ShieldCheck size={14} />
                        Official Tax Invoice
                    </div>
                    <div className={styles.invoiceNumberBox}>
                        <div className={styles.invoiceNumLabel}>Invoice Reference</div>
                        <div className={styles.invoiceNumValue}>{invoiceData.no}</div>
                    </div>
                    <div className={styles.invoiceDateRow}>
                        Date: <strong>{invoiceData.date}</strong>
                    </div>
                </div>
            </header>

            {/* ─── 3-Column Executive Folio Metadata Grid ─── */}
            <section className={styles.folioGrid}>
                {/* Column 1: Guest Information */}
                <div className={styles.folioCard}>
                    <div className={styles.folioCardHeader}>
                        <User size={13} />
                        <h3>Billed To (Guest)</h3>
                    </div>
                    <div className={styles.folioCardBody}>
                        <div className={styles.guestMainName}>{guestName}</div>
                        {guest?.company_name && (
                            <div className={styles.folioRow}>
                                <span className={styles.folioLabel}>Company:</span>
                                <span className={styles.folioValue}>{guest.company_name}</span>
                            </div>
                        )}
                        {guest?.gst_number && (
                            <div className={styles.folioRow}>
                                <span className={styles.folioLabel}>GSTIN:</span>
                                <span className={styles.folioValue} style={{ fontFamily: 'Courier New', fontWeight: 800 }}>
                                    {guest.gst_number}
                                </span>
                            </div>
                        )}
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Phone:</span>
                            <span className={styles.folioValue}>{guest?.phone || 'N/A'}</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Email:</span>
                            <span className={styles.folioValue}>{guest?.email || 'N/A'}</span>
                        </div>
                        {guest?.address && (
                            <div className={styles.folioRow}>
                                <span className={styles.folioLabel}>City / State:</span>
                                <span className={styles.folioValue}>{guest.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Stay Schedule & Room */}
                <div className={styles.folioCard}>
                    <div className={styles.folioCardHeader}>
                        <Calendar size={13} />
                        <h3>Stay Schedule</h3>
                    </div>
                    <div className={styles.folioCardBody}>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Room Number:</span>
                            <span className={styles.roomPill}>Room {roomNumber}</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Category:</span>
                            <span className={styles.folioValue}>{roomType}</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Check-In:</span>
                            <span className={styles.folioValue}>{booking.check_in_date} (2 PM)</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Check-Out:</span>
                            <span className={styles.folioValue}>{booking.check_out_date} (11 AM)</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Duration:</span>
                            <span className={styles.folioValue}>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                        </div>
                    </div>
                </div>

                {/* Column 3: Folio & Booking Details */}
                <div className={styles.folioCard}>
                    <div className={styles.folioCardHeader}>
                        <FileText size={13} />
                        <h3>Folio & Channel</h3>
                    </div>
                    <div className={styles.folioCardBody}>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Booking ID:</span>
                            <span className={styles.folioValue} style={{ fontFamily: 'Courier New', fontWeight: 800 }}>
                                {invoiceData.bookingRef}
                            </span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Channel:</span>
                            <span className={styles.folioValue}>{invoiceData.source}</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Pay Mode:</span>
                            <span className={styles.folioValue}>{invoiceData.paymentMode}</span>
                        </div>
                        <div className={styles.folioRow}>
                            <span className={styles.folioLabel}>Settlement:</span>
                            <span>
                                {isSettled ? (
                                    <span className={styles.statusPillPaid}>Settled (Paid)</span>
                                ) : (
                                    <span className={styles.statusPillPending}>Payment Pending</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Itemized Tariff & Charges Table ─── */}
            <section className={styles.tariffSection}>
                <h3 className={styles.sectionHeading}>
                    <CreditCard size={14} style={{ color: '#0284C7' }} />
                    Itemized Room Tariffs & Stay Charges
                </h3>
                <div className={styles.tariffTableWrapper}>
                    <table className={styles.tariffTable}>
                        <thead>
                            <tr>
                                <th className={styles.colDesc}>Particulars / Description</th>
                                <th className={styles.colQty}>Quantity / Stay</th>
                                <th className={styles.colRate}>Rate (₹)</th>
                                <th className={styles.colAmount}>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={styles.colDesc}>
                                    <div className={styles.itemTitle}>Room Tariff — {roomType}</div>
                                    <div className={styles.itemSubtitle}>Inclusive of resort amenities, housekeeping & Wi-Fi</div>
                                </td>
                                <td className={styles.colQty}>
                                    {isSpecial ? (booking.special_quantity || 1) : nights} {isSpecial ? qtyLabel : (nights === 1 ? 'Night' : 'Nights')}
                                </td>
                                <td className={styles.colRate}>₹{roomRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className={styles.colAmount}>₹{roomTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            {extraPax > 0 && (
                                <tr>
                                    <td className={styles.colDesc}>
                                        <div className={styles.itemTitle}>Extra Occupancy / Pax Charges</div>
                                        <div className={styles.itemSubtitle}>Additional {extraPax} guest(s) accommodation & bedding</div>
                                    </td>
                                    <td className={styles.colQty}>
                                        {isSpecial ? 1 : nights} {isSpecial ? 'Stay' : (nights === 1 ? 'Night' : 'Nights')}
                                    </td>
                                    <td className={styles.colRate}>₹{extraPaxRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className={styles.colAmount}>₹{extraPaxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ─── Financial Settlement & Official Signature ─── */}
            <section className={styles.settlementGrid}>
                {/* Left Side: Payment Details & Authorized Signatory */}
                <div className={styles.settlementLeft}>
                    <div className={styles.paymentSummaryCard}>
                        <div className={styles.paymentSummaryHeader}>
                            <CreditCard size={13} />
                            Payment Method & Authorization
                        </div>
                        <div className={styles.paymentDetailRows}>
                            <div className={styles.paymentDetailRow}>
                                <span className={styles.folioLabel}>Payment Mode:</span>
                                <span className={styles.folioValue}>{invoiceData.paymentMode}</span>
                            </div>
                            <div className={styles.paymentDetailRow}>
                                <span className={styles.folioLabel}>Settlement Date:</span>
                                <span className={styles.folioValue}>{invoiceData.date}</span>
                            </div>
                            {isSettled ? (
                                <div>
                                    <div className={styles.paidStamp}>
                                        <CheckCircle2 size={14} />
                                        Payment Completed in Full
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.paymentDetailRow}>
                                    <span className={styles.folioLabel}>Outstanding Balance:</span>
                                    <span style={{ color: '#DC2626', fontWeight: 800 }}>
                                        ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.signatureArea}>
                        <div className={styles.signatureLine} />
                        <span className={styles.signatureLabel}>Authorized Signatory & Seal</span>
                    </div>
                </div>

                {/* Right Side: Calculation & Grand Total */}
                <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal (Net Amount)</span>
                        <strong>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    {gstRate > 0 && (
                        <div className={styles.summaryRow}>
                            <span>Goods & Services Tax (GST @ {gstRate}%)</span>
                            <strong>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                    )}
                    <div className={styles.summaryDivider} />
                    <div className={styles.grandTotalRow}>
                        <span>Total Payable</span>
                        <span className={styles.grandTotalAmount}>
                            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Total Paid</span>
                        <strong style={{ color: '#059669' }}>
                            ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                    </div>
                    <div className={`${styles.balanceDueRow} ${isSettled ? styles.balanceZero : ''}`}>
                        <span>Balance Due</span>
                        <span>₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </section>

            {/* ─── Compact Resort House Policies ─── */}
            <section className={styles.policiesCard}>
                <h4 className={styles.policiesTitle}>
                    <MapPin size={13} style={{ color: '#0284C7' }} />
                    Resort Guidelines & Guest Information
                </h4>
                <div className={styles.policiesGrid}>
                    <div className={styles.policyBullet}>
                        <span>•</span> Check-in: 2:00 PM | Standard Check-out: 11:00 AM.
                    </div>
                    <div className={styles.policyBullet}>
                        <span>•</span> Valid government photo ID is required for all resident guests.
                    </div>
                    <div className={styles.policyBullet}>
                        <span>•</span> Quiet hours observed from 10:30 PM to preserve tranquility.
                    </div>
                    <div className={styles.policyBullet}>
                        <span>•</span> Swimming pool usage is strictly subject to resort safety rules.
                    </div>
                </div>
            </section>

            {/* ─── Luxury Footer & Google Review ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerLeft}>
                    <img
                        src="/google-review-qr.png"
                        alt="Google Review QR"
                        className={styles.qrImage}
                        onError={(e) => {
                            // Fallback if image not found
                            (e.target as HTMLElement).style.display = 'none';
                        }}
                    />
                    <div className={styles.qrText}>
                        <strong>Share Your Experience</strong>
                        Scan with your phone to review Ave Vista Resorts on Google.
                    </div>
                </div>

                <div className={styles.footerRight}>
                    <p className={styles.thankYouMessage}>
                        Thank you for staying at Ave Vista Resorts & Hotels!
                    </p>
                    <p className={styles.copyright}>
                        © 2026 Ave Vista Resorts & Hotels. All rights reserved. • Balapuram, Kannur, Kerala
                    </p>
                </div>
            </footer>
        </div>
    );
};
