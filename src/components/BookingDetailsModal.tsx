'use client';

import { X, User, Calendar, CreditCard, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './BookingDetailsModal.module.css';

interface BookingDetailsModalProps {
    booking: any;
    onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
    if (!booking) return null;

    const guestName = booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Unknown Guest';
    const email = booking.guests?.email || '';
    const phone = booking.guests?.phone || '';


    return (
        <div className={styles.overlay}>
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h2>Booking Details</h2>
                        <span className={styles.bookingId}>#{booking.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <User size={18} className={styles.icon} />
                            <h3>Guest Information</h3>
                        </div>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Full Name</label>
                                <span>{guestName}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email</label>
                                <div className={styles.contactRow}><Mail size={14} /> {email}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone</label>
                                <div className={styles.contactRow}><Phone size={14} /> {phone}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Calendar size={18} className={styles.icon} />
                            <h3>Stay Details</h3>
                        </div>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Check-in</label>
                                <span>{booking.check_in_date}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Check-out</label>
                                <span>{booking.check_out_date}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Status</label>
                                <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase().replace(' ', '')]}`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <CreditCard size={18} className={styles.icon} />
                            <h3>Payment</h3>
                        </div>
                        <div className={styles.paymentRow}>
                            <span className={styles.totalLabel}>Total Amount</span>
                            <span className={styles.totalAmount}>₹{booking.total_amount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.outlineBtn} onClick={() => {
                        window.open(`mailto:${email}?subject=Invoice for Booking #${booking.id}&body=Dear ${guestName}, please find your invoice attached.`);
                    }}>
                        Email Invoice
                    </button>
                    <button className={styles.outlineBtn} onClick={() => {
                        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi ${guestName}, this is regarding your booking at Ave Vista.`);
                    }}>
                        WhatsApp
                    </button>
                    <button onClick={onClose} className={styles.closeActionBtn}>Close</button>
                </div>

            </motion.div>
        </div>
    );
}
