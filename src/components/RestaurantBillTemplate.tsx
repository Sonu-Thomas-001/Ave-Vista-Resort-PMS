import React from 'react';
import { Phone, Mail, Globe, FileText, User, UtensilsCrossed, CreditCard, Clock } from 'lucide-react';
import styles from './RestaurantBillTemplate.module.css';

interface BillItem {
    name: string;
    qty: number;
    price: number;
}

interface RestaurantBillTemplateProps {
    bill: {
        bill_number: string;
        guest_name: string;
        room_number?: string | null;
        items: BillItem[];
        subtotal: number;
        tax_amount: number;
        total_amount: number;
        payment_mode: string;
        status: string;
        notes?: string | null;
        created_at: string;
    };
    printRef?: React.RefObject<HTMLDivElement | null>;
}

export function RestaurantBillTemplate({ bill, printRef }: RestaurantBillTemplateProps) {
    const billDate = new Date(bill.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const billTime = new Date(bill.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const statusClass = bill.status === 'Paid'
        ? styles.statusPaid
        : bill.status === 'Partial'
            ? styles.statusPartial
            : styles.statusPending;

    return (
        <div className={styles.container} ref={printRef}>
            {/* ─── Header ─── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.brandName}>Ave Vista Resorts & Hotels</h1>
                    <p className={styles.tagline}>Balapuram, Vayattuparamba, Kannur, Kerala – 670582</p>
                    <div className={styles.contactRow}>
                        <span className={styles.contactItem}>
                            <Phone size={14} /> +91 90615 54545
                        </span>
                        <span className={styles.contactDivider}>|</span>
                        <span className={styles.contactItem}>
                            <Mail size={14} /> avevistaresort@gmail.com
                        </span>
                        <span className={styles.contactDivider}>|</span>
                        <span className={styles.contactItem}>
                            <Globe size={14} /> www.avevistaresorts.com
                        </span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.billBadge}>
                        <UtensilsCrossed size={14} />
                        RESTAURANT BILL
                    </div>
                    <div className={styles.billMeta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Bill No.</span>
                            <span className={styles.metaValue}>{bill.bill_number}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Date</span>
                            <span className={styles.metaValue}>{billDate}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Info Cards ─── */}
            <div className={styles.cardsGrid}>
                {/* Bill Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <FileText size={18} />
                        <h3 className={styles.cardTitle}>Bill Details</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Bill Number</span>
                            <span className={styles.infoValue}>{bill.bill_number}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>{billDate}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Time</span>
                            <span className={styles.infoValue}>{billTime}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Payment</span>
                            <span className={styles.paymentBadge}>{bill.payment_mode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Status</span>
                            <span className={`${styles.statusBadge} ${statusClass}`}>{bill.status}</span>
                        </div>
                    </div>
                </div>

                {/* Guest Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <User size={18} />
                        <h3 className={styles.cardTitle}>Guest Details</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Guest Name</span>
                            <span className={styles.infoValue}>{bill.guest_name}</span>
                        </div>
                        {bill.room_number && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Room</span>
                                <span className={styles.infoValue}>{bill.room_number}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Items Table ─── */}
            <div className={styles.tariffSection}>
                <h3 className={styles.sectionTitle}>
                    <UtensilsCrossed size={18} />
                    Order Items
                </h3>
                <div className={styles.tariffTable}>
                    <div className={styles.tableHeader}>
                        <div>#</div>
                        <div>Description</div>
                        <div style={{ textAlign: 'center' }}>Qty</div>
                        <div style={{ textAlign: 'right' }}>Rate</div>
                        <div style={{ textAlign: 'right' }}>Amount</div>
                    </div>
                    <div className={styles.tableBody}>
                        {bill.items.map((item, index) => (
                            <div key={index} className={styles.tableRow}>
                                <div className={styles.colSno}>{String(index + 1).padStart(2, '0')}</div>
                                <div className={styles.colDescription}>{item.name}</div>
                                <div className={styles.colQty}>{item.qty}</div>
                                <div className={styles.colRate}>₹{item.price.toLocaleString('en-IN')}</div>
                                <div className={styles.colAmount}>₹{(item.qty * item.price).toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Summary Card ─── */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>CGST (2.5%)</span>
                    <span>₹{(bill.tax_amount / 2).toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>SGST (2.5%)</span>
                    <span>₹{(bill.tax_amount / 2).toFixed(2)}</span>
                </div>
                <div className={styles.grandTotalRow}>
                    <span>Grand Total</span>
                    <span>₹{bill.total_amount.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* ─── Notes ─── */}
            {bill.notes && (
                <div className={styles.notesSection}>
                    <strong>Note:</strong> {bill.notes}
                </div>
            )}

            {/* ─── Footer ─── */}
            <div className={styles.footerDivider} />
            <div className={styles.footer}>
                <h2 className={styles.thankYou}>Thank you for dining with us!</h2>
                <p className={styles.thankYouSub}>We hope you enjoyed your meal at Ave Vista</p>
                <div className={styles.footerContact}>
                    <span><Phone size={12} /> +91 90615 54545</span>
                    <span><Mail size={12} /> avevistaresort@gmail.com</span>
                    <span><Globe size={12} /> www.avevistaresorts.com</span>
                </div>
                <p className={styles.footerNote}>This is a computer-generated bill and does not require a signature.</p>
            </div>
        </div>
    );
}
