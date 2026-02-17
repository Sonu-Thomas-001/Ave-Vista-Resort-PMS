import React from 'react';
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
        room_number?: string;
        items: BillItem[];
        subtotal: number;
        tax_amount: number;
        total_amount: number;
        payment_mode: string;
        status: string;
        notes?: string;
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

    return (
        <div className={styles.billContainer} ref={printRef}>
            {/* Header */}
            <div className={styles.billHeader}>
                <h1 className={styles.hotelName}>AVE VISTA RESORT</h1>
                <p className={styles.hotelSubtitle}>Premium Hospitality & Dining</p>
                <p className={styles.hotelContact}>
                    📞 +91 98765 43210 &nbsp;|&nbsp; ✉ info@avevista.com
                </p>
                <div className={styles.restaurantLabel}>🍽️ RESTAURANT BILL</div>
            </div>

            {/* Bill Info */}
            <div className={styles.billInfo}>
                <div className={styles.infoGroup}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Bill No:</span>
                        <span className={styles.infoValue}>{bill.bill_number}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Date:</span>
                        <span className={styles.infoValue}>{billDate}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Time:</span>
                        <span className={styles.infoValue}>{billTime}</span>
                    </div>
                </div>
                <div className={styles.infoGroup}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Guest:</span>
                        <span className={styles.infoValue}>{bill.guest_name}</span>
                    </div>
                    {bill.room_number && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Room:</span>
                            <span className={styles.infoValue}>{bill.room_number}</span>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Payment:</span>
                        <span className={styles.paymentBadge}>{bill.payment_mode}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className={styles.itemsTable}>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Item Description</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Rate</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items.map((item, index) => (
                        <tr key={index}>
                            <td className={styles.snoCell}>{index + 1}</td>
                            <td>{item.name}</td>
                            <td className={styles.qtyCell}>{item.qty}</td>
                            <td className={styles.priceCell}>₹{item.price.toLocaleString()}</td>
                            <td className={styles.totalCell}>₹{(item.qty * item.price).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className={styles.totals}>
                <div className={styles.totalsBox}>
                    <div className={styles.totalLine}>
                        <span>Subtotal</span>
                        <span>₹{bill.subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles.totalLine}>
                        <span>GST (5%)</span>
                        <span>₹{bill.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className={styles.totalLine}>
                        <span>Grand Total</span>
                        <span>₹{bill.total_amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {bill.notes && (
                <div style={{ marginBottom: 20, fontSize: '0.9rem', color: '#64748B' }}>
                    <strong>Notes:</strong> {bill.notes}
                </div>
            )}

            {/* Footer */}
            <div className={styles.billFooter}>
                <p className={styles.footerNote}>This is a computer-generated bill.</p>
                <p className={styles.footerNote}>For any queries, please contact the front desk.</p>
                <p className={styles.thankYou}>Thank you for dining with us! 🙏</p>
            </div>
        </div>
    );
}
