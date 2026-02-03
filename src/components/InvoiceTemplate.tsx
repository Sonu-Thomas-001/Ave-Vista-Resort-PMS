import React from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, FileText, Calendar, User, Home, CreditCard } from 'lucide-react';
import styles from './InvoiceTemplate.module.css';

interface InvoiceTemplateProps {
    invoice: any;
    booking: any;
    guest: any;
    printRef?: React.RefObject<HTMLDivElement>;
}

export const InvoiceTemplate = ({ invoice, booking, guest, printRef }: InvoiceTemplateProps) => {
    if (!invoice || !booking) return null;

    const nights = Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
    const subTotal = invoice.total_amount || invoice.amount;
    const gstAmount = (subTotal * (invoice.gst_rate || 0)) / 100;
    const grandTotal = subTotal + gstAmount;

    const invoiceData = {
        no: invoice.invoice_number,
        date: new Date(invoice.created_at || invoice.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        mode: invoice.payment_mode || invoice.payment_method || 'Direct',
    };

    return (
        <div className={styles.container} ref={printRef}>
            {/* Modern Hero Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.brandName}>Ave Vista Resorts & Hotels</h1>
                    <p className={styles.address}>Balapuram, Vayattuparamba, Kannur, Kerala – 670582</p>
                    <div className={styles.contactRow}>
                        <span className={styles.contactItem}>
                            <Phone size={14} /> +91 90615 54545
                        </span>
                        <span className={styles.divider}>|</span>
                        <span className={styles.contactItem}>
                            <Mail size={14} /> avevistaresort@gmail.com
                        </span>
                        <span className={styles.divider}>|</span>
                        <span className={styles.contactItem}>
                            <Globe size={14} /> www.avevistaresorts.com
                        </span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.invoiceBadge}>TAX INVOICE</div>
                    <div className={styles.invoiceMeta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Invoice No.</span>
                            <span className={styles.metaValue}>{invoiceData.no}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Date</span>
                            <span className={styles.metaValue}>{invoiceData.date}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Info Cards Section */}
            <div className={styles.cardsGrid}>
                {/* Invoice Information Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <FileText size={18} />
                        <h3>Invoice Information</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Invoice No</span>
                            <span className={styles.infoValue}>{invoiceData.no}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>{invoiceData.date}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Booking ID</span>
                            <span className={styles.infoValue}>{invoiceData.bookingRef}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Mode</span>
                            <span className={styles.infoValue}>{invoiceData.mode}</span>
                        </div>
                    </div>
                </div>

                {/* Stay Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <Home size={18} />
                        <h3>Stay Details</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Room Type</span>
                            <span className={styles.infoValue}>Deluxe Hill View</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Room No</span>
                            <span className={styles.infoValue}>{invoice.room_number}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Check-in</span>
                            <span className={styles.infoValue}>{booking.check_in_date} 2:00 PM</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Check-out</span>
                            <span className={styles.infoValue}>{booking.check_out_date} 12:00 PM</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nights</span>
                            <span className={styles.infoValue}>{nights}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Pax</span>
                            <span className={styles.infoValue}>{booking.guests_count} Adults</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Details Section */}
            <div className={styles.guestSection}>
                <div className={styles.guestHeader}>
                    <User size={18} />
                    <h3>Guest Details</h3>
                </div>
                <div className={styles.guestInfo}>
                    <div className={styles.guestItem}>
                        <span className={styles.guestName}>{guest.first_name} {guest.last_name}</span>
                    </div>
                    <div className={styles.guestItem}>
                        <Phone size={14} />
                        <span>{guest.phone || 'N/A'}</span>
                    </div>
                    <div className={styles.guestItem}>
                        <Mail size={14} />
                        <span>{guest.email || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Modern Tariff Table */}
            <div className={styles.tariffSection}>
                <h3 className={styles.sectionTitle}>Tariff & Charges</h3>
                <div className={styles.tariffTable}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colDescription}>Description</div>
                        <div className={styles.colQty}>Qty / Nts</div>
                        <div className={styles.colRate}>Rate</div>
                        <div className={styles.colAmount}>Amount</div>
                    </div>
                    <div className={styles.tableBody}>
                        <div className={styles.tableRow}>
                            <div className={styles.colDescription}>Room Tariff</div>
                            <div className={styles.colQty}>{nights}</div>
                            <div className={styles.colRate}>₹{(invoice.total_amount / nights).toFixed(2)}</div>
                            <div className={styles.colAmount}>₹{invoice.total_amount.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Total Summary Card */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                    <span>Sub Total</span>
                    <span>₹{subTotal.toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>CGST ({(invoice.gst_rate || 0) / 2}%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>SGST ({(invoice.gst_rate || 0) / 2}%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className={styles.grandTotalRow}>
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Section */}
            <div className={styles.paymentSection}>
                <div className={styles.paymentLeft}>
                    <div className={styles.paymentCard}>
                        <CreditCard size={18} />
                        <h3>Payment Summary</h3>
                    </div>
                    <div className={styles.paymentDetails}>
                        <div className={styles.paymentRow}>
                            <span className={styles.paymentLabel}>Paid Amount</span>
                            <span className={styles.paymentValue}>₹{invoice.paid_amount.toLocaleString()}</span>
                        </div>
                        <div className={styles.paymentRow}>
                            <span className={styles.paymentLabel}>Balance Due</span>
                            <span className={styles.balanceDue}>₹{((grandTotal) - invoice.paid_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.signatureBox}>
                    <div className={styles.signatureLine}></div>
                    <span className={styles.signatureLabel}>Authorized Signatory</span>
                </div>
            </div>

            {/* Policies */}
            <div className={styles.policies}>
                <h4>Resort Policies</h4>
                <ul>
                    <li>Check-in: 2:00 PM | Check-out: 12:00 PM</li>
                    <li>Pool Timing: 6:00 AM – 11:00 AM & 4:00 PM – 10:00 PM</li>
                    <li>Outside food not allowed</li>
                    <li>Lost key charge applicable</li>
                </ul>
            </div>

            {/* Modern Luxury Footer */}
            <div className={styles.footerDivider}></div>

            <footer className={styles.modernFooter}>
                {/* QR Card */}
                <div className={styles.qrCard}>
                    <div className={styles.qrImageWrapper}>
                        <img src="/google-review-qr.png" alt="Review QR" className={styles.qrCodeImage} />
                    </div>
                    <p className={styles.qrLabel}>
                        <span className={styles.starIcon}>⭐</span>
                        Scan to share your experience
                    </p>
                </div>

                {/* Thank You Message */}
                <div className={styles.thankYouSection}>
                    <h2 className={styles.thankYouTitle}>
                        Thank you for choosing Ave Vista Resorts & Hotels
                    </h2>
                    <p className={styles.thankYouSubtitle}>
                        We hope you had a wonderful stay!
                    </p>
                </div>

                {/* Social Links */}
                <div className={styles.socialSection}>
                    <div className={styles.socialLink}>
                        <div className={styles.socialIconCircle} style={{ background: '#E8F4FD' }}>
                            <Facebook size={16} color="#1877F2" />
                        </div>
                        <span>Ave Vista Resort Balapuram</span>
                    </div>
                    <div className={styles.socialLink}>
                        <div className={styles.socialIconCircle} style={{ background: '#FDE8F3' }}>
                            <Instagram size={16} color="#E1306C" />
                        </div>
                        <span>ave_vista_resorts</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
