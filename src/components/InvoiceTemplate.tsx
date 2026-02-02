import React from 'react';
import { Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react';
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
    const subTotal = invoice.total_amount || invoice.amount; // Handle both
    const gstAmount = (subTotal * (invoice.gst_rate || 0)) / 100;
    const grandTotal = subTotal + gstAmount;
    const advance = (invoice.total_amount || invoice.amount || 0) - (invoice.paid_amount || 0);

    // Hardcoding some logic to match the request exactly for now
    // In real app, we would pass these details in
    const invoiceData = {
        no: invoice.invoice_number,
        date: new Date(invoice.created_at || invoice.generated_at).toLocaleDateString(),
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        mode: invoice.payment_mode || invoice.payment_method || 'Direct',
    };

    return (
        <div className={styles.container} ref={printRef}>
            {/* Header */}
            {/* Header */}
            <div className={styles.metaHeader}>
                <span>{new Date().toLocaleString()}</span>
                <span>Ave Vista Resort PMS</span>
            </div>

            <header className={styles.header}>
                <div className={styles.resortName}>Ave Vista Resorts & Hotels</div>
                <div className={styles.resortAddress}>
                    Balapuram, Vayattuparamba<br />
                    Kannur, Kerala – 670582<br />
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={14} color="#E91E63" /> +91 90615 54545
                        </span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={14} color="#1976D2" /> avevistaresort@gmail.com
                        </span>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Globe size={14} color="#03A9F4" /> www.avevistaresorts.com
                    </div>
                </div>
            </header>

            <h1 className={styles.title}>Tax Invoice</h1>

            {/* Info Grid */}
            <div className={styles.infoGrid}>
                <div>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Invoice Information</div>
                        <div className={styles.row}>
                            <span className={styles.label}>Invoice No:</span>
                            <span className={styles.value}>{invoiceData.no}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Date:</span>
                            <span className={styles.value}>{invoiceData.date}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Booking ID:</span>
                            <span className={styles.value}>{invoiceData.bookingRef}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Mode:</span>
                            <span className={styles.value}>{invoiceData.mode}</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Guest Details</div>
                        <div className={styles.row}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{guest.first_name} {guest.last_name}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Phone:</span>
                            <span className={styles.value}>{guest.phone || 'N/A'}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{guest.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Stay Details</div>
                        <div className={styles.row}>
                            <span className={styles.label}>Room Type:</span>
                            <span className={styles.value}>Deluxe Hill View</span>{/* Needs room type join */}
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Room No:</span>
                            <span className={styles.value}>{invoice.room_number}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Check-in:</span>
                            <span className={styles.value}>{booking.check_in_date} 2:00 PM</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Check-out:</span>
                            <span className={styles.value}>{booking.check_out_date} 12:00 PM</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Nights:</span>
                            <span className={styles.value}>{nights}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Pax:</span>
                            <span className={styles.value}>{booking.guests_count} Adults</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charges Table */}
            <div className={styles.tableSection}>
                <div className={styles.sectionTitle}>Tariff & Charges</div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty / Nts</th>
                            <th className={styles.colRight}>Rate</th>
                            <th className={styles.colRight}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Room Tariff</td>
                            <td>{nights}</td>
                            <td className={styles.colRight}>₹{(invoice.total_amount / nights).toFixed(2)}</td>
                            <td className={styles.colRight}>₹{invoice.total_amount.toLocaleString()}</td>
                        </tr>
                        {/* Dynamic Extra Rows would go here */}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
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
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                </div>
            </div>

            <div className={styles.infoGrid} style={{ marginTop: 40 }}>
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Payment Details</div>
                    <div className={styles.row}>
                        <span className={styles.label}>Paid Amount:</span>
                        <span className={styles.value}>₹{invoice.paid_amount.toLocaleString()}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Balance Due:</span>
                        <span className={styles.value} style={{ color: 'red' }}>
                            ₹{((grandTotal) - invoice.paid_amount).toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className={styles.auth}>
                    <div className={styles.signatureLine}></div>
                    <span className={styles.authLabel}>Authorized Signatory</span>
                </div>
            </div>

            {/* Policies */}
            <div className={styles.policies}>
                <strong>Resort Policies:</strong>
                <ul>
                    <li>Check-in: 2:00 PM | Check-out: 12:00 PM</li>
                    <li>Pool Timing: 6:00 AM – 11:00 AM & 4:00 PM – 10:00 PM</li>
                    <li>Outside food not allowed</li>
                    <li>Lost key charge applicable</li>
                </ul>
            </div>

            <div className={styles.footer}>
                Thank you for choosing Ave Vista Resorts & Hotels. We hope you had a pleasant stay!
            </div>

            <div className={styles.connectSection}>
                <div className={styles.qrBlock}>
                    <img src="/google-review-qr.png" alt="Scan to Review" className={styles.qrImage} />
                    <span className={styles.qrText}>Scan to rate your experience on Google</span>
                </div>
                <div className={styles.socialBlock}>
                    <div className={styles.socialRow} style={{ color: '#1877F2' }}>
                        <Facebook size={16} /> Ave Vista Resort Balapuram
                    </div>
                    <div className={styles.socialRow} style={{ color: '#E1306C' }}>
                        <Instagram size={16} /> ave_vista_resorts
                    </div>
                </div>
            </div>

        </div>
    );
};
