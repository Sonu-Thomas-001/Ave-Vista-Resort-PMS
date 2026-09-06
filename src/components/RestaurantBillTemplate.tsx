import React from 'react';
import { Phone, Mail, Globe, FileText, User, UtensilsCrossed, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
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

    const isPaid = bill.status === 'Paid';
    const statusClass = bill.status === 'Paid'
        ? styles.statusBadgePaid
        : bill.status === 'Partial'
            ? styles.statusBadgePartial
            : styles.statusBadgePending;

    // ─────────────────────────────────────────────────────────────
    // 80MM COMPACT POS THERMAL RECEIPT
    // ─────────────────────────────────────────────────────────────
    if (format === 'thermal') {
        return (
            <div className={styles.thermalContainer} ref={printRef}>
                <div className={styles.thermalCenter}>
                    <h2 className={styles.thermalBrand}>AVE VISTA RESORT</h2>
                    <p className={styles.thermalSub}>Fine Dining & In-Room Service</p>
                    <p className={styles.thermalContact}>Kannur, Kerala • Tel: +91 90615 54545</p>
                    <div className={styles.thermalDashed} />
                    <p className={styles.thermalTitlePill}>** DINING RECEIPT **</p>
                    <div className={styles.thermalDashed} />
                </div>

                <div className={styles.thermalMetaRow}>
                    <span>Bill No:</span>
                    <span style={{ fontWeight: 'bold' }}>{bill.bill_number}</span>
                </div>
                <div className={styles.thermalMetaRow}>
                    <span>Date / Time:</span>
                    <span>{billDate} {billTime}</span>
                </div>
                <div className={styles.thermalMetaRow}>
                    <span>Guest:</span>
                    <span style={{ fontWeight: 'bold' }}>{bill.guest_name}</span>
                </div>
                {bill.room_number ? (
                    <div className={styles.thermalMetaRow}>
                        <span>Order Type:</span>
                        <span style={{ fontWeight: 'bold' }}>Room {bill.room_number} (Room Service)</span>
                    </div>
                ) : (
                    <div className={styles.thermalMetaRow}>
                        <span>Order Type:</span>
                        <span>Restaurant Dine-In</span>
                    </div>
                )}
                <div className={styles.thermalMetaRow}>
                    <span>Payment:</span>
                    <span>{bill.payment_mode} ({bill.status})</span>
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
                        <span style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            ₹{(item.qty * item.price).toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}

                <div className={styles.thermalDashed} />

                <div className={styles.thermalTotalRow}>
                    <span>Subtotal:</span>
                    <span>₹{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {bill.tax_amount > 0 && (
                    <div className={styles.thermalTotalRow}>
                        <span>Tax / GST:</span>
                        <span>₹{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                )}

                <div className={styles.thermalGrandTotal}>
                    <span>GRAND TOTAL:</span>
                    <span>₹{bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {bill.notes && (
                    <div className={styles.thermalNotes}>
                        Note: {bill.notes}
                    </div>
                )}

                <div className={styles.thermalDashed} />

                <div className={styles.thermalFooter}>
                    <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Thank You for Dining With Us!</p>
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
                        <Sparkles size={22} style={{ color: '#EA580C' }} />
                        Ave Vista <span>Fine Dining & Culinary</span>
                    </h1>
                    <p className={styles.brandSub}>Ave Vista Resorts & Hotels • Balapuram, Kerala</p>
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
                    <div className={styles.diningBadge}>
                        <UtensilsCrossed size={13} />
                        Restaurant Tax Invoice
                    </div>
                    <div className={styles.billNumberBox}>
                        <div className={styles.billNumLabel}>Bill Reference</div>
                        <div className={styles.billNumValue}>{bill.bill_number}</div>
                    </div>
                    <div className={styles.billDateRow}>
                        Date: <strong>{billDate}, {billTime}</strong>
                    </div>
                </div>
            </header>

            {/* ─── 2-Column Metadata Cards ─── */}
            <section className={styles.cardsGrid}>
                {/* Bill Details Card */}
                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <FileText size={13} />
                        <h3>Settlement & Audit</h3>
                    </div>
                    <div className={styles.infoCardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Bill Number:</span>
                            <span className={styles.infoValue} style={{ fontFamily: 'Courier New', fontWeight: 800 }}>
                                {bill.bill_number}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Order Date:</span>
                            <span className={styles.infoValue}>{billDate}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Payment Mode:</span>
                            <span className={styles.infoValue}>{bill.payment_mode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Status:</span>
                            <span className={statusClass}>{bill.status}</span>
                        </div>
                    </div>
                </div>

                {/* Guest & Location Card */}
                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <User size={13} />
                        <h3>Guest & Dining Location</h3>
                    </div>
                    <div className={styles.infoCardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Guest Name:</span>
                            <span className={styles.infoValue}>{bill.guest_name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Service Destination:</span>
                            <span>
                                {bill.room_number ? (
                                    <span className={styles.locationBadgeRoom}>
                                        <MapPin size={11} /> Room {bill.room_number} (Room Service)
                                    </span>
                                ) : (
                                    <span className={styles.locationBadgeDineIn}>
                                        <UtensilsCrossed size={11} /> Restaurant Dine-In
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Total Units:</span>
                            <span className={styles.infoValue}>
                                {bill.items.reduce((sum, item) => sum + item.qty, 0)} Items
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Itemized Culinary Catalog Table ─── */}
            <section className={styles.tableSection}>
                <h3 className={styles.sectionHeading}>
                    <UtensilsCrossed size={14} style={{ color: '#EA580C' }} />
                    Itemized Order Catalog & Culinary Details
                </h3>
                <div className={styles.itemsTableWrapper}>
                    <table className={styles.itemsTable}>
                        <thead>
                            <tr>
                                <th className={styles.colIndex}>#</th>
                                <th className={styles.colItem}>Dish / Item Description</th>
                                <th className={styles.colQty}>Qty</th>
                                <th className={styles.colPrice}>Unit Price (₹)</th>
                                <th className={styles.colTotal}>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td className={styles.colIndex}>{index + 1}</td>
                                    <td className={styles.colItem}>
                                        <div className={styles.dishTitle}>{item.name}</div>
                                    </td>
                                    <td className={styles.colQty}>
                                        <span className={styles.qtyPill}>{item.qty}</span>
                                    </td>
                                    <td className={styles.colPrice}>
                                        ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className={styles.colTotal}>
                                        ₹{(item.qty * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ─── Settlement & Summary Grid ─── */}
            <section className={styles.settlementGrid}>
                {/* Left: Notes & Kitchen Remarks */}
                <div className={styles.notesCard}>
                    <div className={styles.notesHeader}>Culinary & Preparation Notes</div>
                    <div className={styles.notesContent}>
                        {bill.notes || 'Standard freshly prepared culinary service. All taxes computed per statutory rates.'}
                    </div>
                </div>

                {/* Right: Subtotal, Tax, Grand Total */}
                <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal (Net Amount)</span>
                        <strong>₹{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    {bill.tax_amount > 0 && (
                        <div className={styles.summaryRow}>
                            <span>Culinary GST / Tax</span>
                            <strong>₹{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                    )}
                    <div className={styles.summaryDivider} />
                    <div className={styles.grandTotalRow}>
                        <span>Total Payable</span>
                        <span className={styles.grandTotalAmount}>
                            ₹{bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className={styles.footer}>
                <div>
                    <p className={styles.thankYouText}>Thank you for dining with Ave Vista Resorts & Hotels!</p>
                    <p className={styles.copyrightText}>
                        © 2026 Ave Vista Fine Dining • Vayattuparamba, Kannur, Kerala
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        Printed via Ave Vista POS Engine
                    </span>
                </div>
            </footer>
        </div>
    );
}
