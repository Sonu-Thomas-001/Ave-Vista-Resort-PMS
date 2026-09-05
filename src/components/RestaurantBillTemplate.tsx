import React from 'react';
import { Phone, Mail, Globe, FileText, User, UtensilsCrossed } from 'lucide-react';
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
    format?: 'a4' | 'thermal';
}

export function RestaurantBillTemplate({ bill, printRef, format = 'a4' }: RestaurantBillTemplateProps) {
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

    // ─────────────────────────────────────────────────────────────
    // 80MM COMPACT POS THERMAL RECEIPT
    // ─────────────────────────────────────────────────────────────
    if (format === 'thermal') {
        return (
            <div className={styles.thermalContainer} ref={printRef}>
                <div className={styles.thermalCenter}>
                    <h2 className={styles.thermalBrand}>Ave Vista Resorts</h2>
                    <p className={styles.thermalSub}>Vayattuparamba, Kannur, Kerala</p>
                    <p className={styles.thermalContact}>Tel: +91 90615 54545</p>
                    <div className={styles.thermalDashed} />
                    <p style={{ fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', margin: '4px 0' }}>
                        ** DINING RECEIPT **
                    </p>
                    <div className={styles.thermalDashed} />
                </div>

                <div className={styles.thermalMetaRow}>
                    <span>Bill No:</span>
                    <span style={{ fontWeight: 800 }}>{bill.bill_number}</span>
                </div>
                <div className={styles.thermalMetaRow}>
                    <span>Date / Time:</span>
                    <span>{billDate} {billTime}</span>
                </div>
                <div className={styles.thermalMetaRow}>
                    <span>Guest:</span>
                    <span style={{ fontWeight: 700 }}>{bill.guest_name}</span>
                </div>
                {bill.room_number && (
                    <div className={styles.thermalMetaRow}>
                        <span>Room:</span>
                        <span style={{ fontWeight: 800 }}>{bill.room_number}</span>
                    </div>
                )}
                <div className={styles.thermalMetaRow}>
                    <span>Payment:</span>
                    <span style={{ fontWeight: 700 }}>{bill.payment_mode} ({bill.status})</span>
                </div>

                <div className={styles.thermalSolid} />

                {/* Items Table */}
                <div className={styles.thermalTableHeader}>
                    <span>Item</span>
                    <span style={{ textAlign: 'center' }}>Qty</span>
                    <span style={{ textAlign: 'right' }}>Rate</span>
                    <span style={{ textAlign: 'right' }}>Total</span>
                </div>

                {bill.items.map((item, index) => (
                    <div key={index} className={styles.thermalItemRow}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                        </span>
                        <span style={{ textAlign: 'center' }}>{item.qty}</span>
                        <span style={{ textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</span>
                        <span style={{ textAlign: 'right', fontWeight: 700 }}>
                            ₹{(item.qty * item.price).toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}

                <div className={styles.thermalDashed} />

                <div className={styles.thermalTotalRow}>
                    <span>Subtotal:</span>
                    <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {bill.tax_amount > 0 && (
                    <div className={styles.thermalTotalRow}>
                        <span>Tax / GST:</span>
                        <span>₹{bill.tax_amount.toLocaleString('en-IN')}</span>
                    </div>
                )}

                <div className={styles.thermalGrandTotal}>
                    <span>GRAND TOTAL:</span>
                    <span>₹{bill.total_amount.toLocaleString('en-IN')}</span>
                </div>

                {bill.notes && (
                    <div style={{ marginTop: '10px', fontSize: '10px', fontStyle: 'italic' }}>
                        Note: {bill.notes}
                    </div>
                )}

                <div className={styles.thermalDashed} />

                <div className={styles.thermalFooter}>
                    <p style={{ margin: '2px 0', fontWeight: 700 }}>Thank You for Dining With Us!</p>
                    <p style={{ margin: '2px 0', fontSize: '10px' }}>www.avevistaresorts.com</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // STANDARD A4 LUXURY RESORT DINING INVOICE
    // ─────────────────────────────────────────────────────────────
    return (
        <div className={styles.container} ref={printRef}>
            {/* ─── Header ─── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.brandName}>
                        Ave Vista <span>Resorts & Hotels</span>
                    </h1>
                    <p className={styles.tagline}>Balapuram, Vayattuparamba, Kannur, Kerala – 670582</p>
                    <div className={styles.contactRow}>
                        <span className={styles.contactItem}>
                            <Phone size={13} /> +91 90615 54545
                        </span>
                        <span className={styles.contactDivider}>|</span>
                        <span className={styles.contactItem}>
                            <Mail size={13} /> avevistaresort@gmail.com
                        </span>
                        <span className={styles.contactDivider}>|</span>
                        <span className={styles.contactItem}>
                            <Globe size={13} /> www.avevistaresorts.com
                        </span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.billBadge}>
                        <UtensilsCrossed size={14} />
                        Restaurant Bill
                    </div>
                    <div className={styles.billMeta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Bill Number</span>
                            <span className={styles.metaValue}>{bill.bill_number}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Date / Time</span>
                            <span className={styles.metaValue}>{billDate}, {billTime}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Info Cards ─── */}
            <div className={styles.cardsGrid}>
                {/* Bill Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <FileText size={16} />
                        <h3 className={styles.cardTitle}>Bill Details</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Bill Reference</span>
                            <span className={styles.infoValue}>{bill.bill_number}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date Issued</span>
                            <span className={styles.infoValue}>{billDate}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Settlement Mode</span>
                            <span className={styles.paymentBadge}>{bill.payment_mode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Payment Status</span>
                            <span className={`${styles.statusBadge} ${statusClass}`}>{bill.status}</span>
                        </div>
                    </div>
                </div>

                {/* Guest Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <User size={16} />
                        <h3 className={styles.cardTitle}>Guest & Dining Details</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Guest Name</span>
                            <span className={styles.infoValue}>{bill.guest_name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Dining Location</span>
                            <span className={styles.infoValue}>
                                {bill.room_number ? `Room ${bill.room_number} (Room Service)` : 'Restaurant Dine-In'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Total Ordered Items</span>
                            <span className={styles.infoValue}>{bill.items.reduce((s, i) => s + i.qty, 0)} Units</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Items Table ─── */}
            <div className={styles.tariffSection}>
                <h3 className={styles.sectionTitle}>
                    <UtensilsCrossed size={16} />
                    Itemized Order Details
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
                {bill.tax_amount > 0 && (
                    <div className={styles.summaryRow}>
                        <span>Taxes</span>
                        <span>₹{bill.tax_amount.toLocaleString('en-IN')}</span>
                    </div>
                )}
                <div className={styles.grandTotalRow}>
                    <span>Total Amount</span>
                    <span>₹{bill.total_amount.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* ─── Notes ─── */}
            {bill.notes && (
                <div className={styles.notesSection}>
                    <strong>Special Instructions / Notes:</strong> {bill.notes}
                </div>
            )}

            {/* ─── Footer ─── */}
            <div className={styles.footerDivider} />
            <div className={styles.footer}>
                <h2 className={styles.thankYou}>Thank you for dining with us!</h2>
                <p className={styles.thankYouSub}>We hope you enjoyed your culinary experience at Ave Vista</p>
                <div className={styles.footerContact}>
                    <span><Phone size={12} /> +91 90615 54545</span>
                    <span><Mail size={12} /> avevistaresort@gmail.com</span>
                    <span><Globe size={12} /> www.avevistaresorts.com</span>
                </div>
                <p className={styles.footerNote}>This is a computer-generated tax bill and does not require an authorized signature.</p>
            </div>
        </div>
    );
}
