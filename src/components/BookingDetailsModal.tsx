'use client';

import { useState } from 'react';
import { X, User, Calendar, CreditCard, Mail, Phone, Send, MessageCircle, Building2, Users, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './BookingDetailsModal.module.css';
import { EmailService } from '@/lib/email-service';

interface BookingDetailsModalProps {
    booking: any;
    onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
    const [sendingEmail, setSendingEmail] = useState(false);
    if (!booking) return null;

    const guestName = booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Unknown Guest';
    const email = booking.guests?.email || '';
    const phone = booking.guests?.phone || '';

    // Calculate nights
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const handleEmailInvoice = async () => {
        if (!email) return alert('No email address for this guest.');
        try {
            setSendingEmail(true);
            await EmailService.triggerEmail('invoice-email', {
                invoice_number: booking.id.split('-')[0].toUpperCase(),
                guest_name: guestName,
                email: email,
                room_number: booking.rooms?.room_number || 'N/A',
                total_amount: booking.total_amount,
                amount: booking.total_amount,
                payment_status: booking.status === 'Checked Out' ? 'Paid' : 'Pending',
                payment_method: 'Direct',
                check_in_date: booking.check_in_date,
                check_out_date: booking.check_out_date,
                nights: Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24)),
                guests_count: (booking.adults || 1) + (booking.children || 0),
                gst_rate: 12,
                paid_amount: booking.total_amount,
                booking_id: booking.id
            });
            alert('Invoice sent successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to send invoice.');
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <h2>Booking Details</h2>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.bookingMeta}>
                            <span className={styles.bookingId}>#{booking.id.split('-')[0].toUpperCase()}</span>
                            <span className={`${styles.statusPill} ${styles[booking.status.toLowerCase().replace(' ', '')]}`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Guest Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <User size={18} />
                            </div>
                            <h3>Guest Information</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.guestName}>{guestName}</div>
                            <div className={styles.contactList}>
                                <div className={styles.contactItem}>
                                    <Mail size={16} />
                                    <span>{email || 'No email provided'}</span>
                                </div>
                                <div className={styles.contactItem}>
                                    <Phone size={16} />
                                    <span>{phone || 'No phone provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stay Details Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Calendar size={18} />
                            </div>
                            <h3>Stay Details</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.stayGrid}>
                                <div className={styles.stayItem}>
                                    <div className={styles.stayLabel}>Check-in</div>
                                    <div className={styles.stayValue}>{new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className={styles.stayItem}>
                                    <div className={styles.stayLabel}>Check-out</div>
                                    <div className={styles.stayValue}>{new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className={styles.stayItem}>
                                    <div className={styles.stayLabel}>
                                        <Moon size={14} />
                                        Nights
                                    </div>
                                    <div className={styles.stayValue}>{nights}</div>
                                </div>
                                <div className={styles.stayItem}>
                                    <div className={styles.stayLabel}>
                                        <Users size={14} />
                                        Guests
                                    </div>
                                    <div className={styles.stayValue}>{(booking.adults || 1) + (booking.children || 0)}</div>
                                </div>
                            </div>
                            {booking.rooms?.room_number && (
                                <div className={styles.roomBadge}>
                                    <Building2 size={16} />
                                    Room {booking.rooms.room_number}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className={styles.paymentCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <CreditCard size={18} />
                            </div>
                            <h3>Payment</h3>
                        </div>
                        <div className={styles.paymentBody}>
                            <div className={styles.paymentRow}>
                                <span>Total Amount</span>
                                <span className={styles.amount}>₹{booking.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    <button
                        disabled={sendingEmail || !email}
                        className={styles.actionBtn}
                        onClick={handleEmailInvoice}
                    >
                        <Send size={16} />
                        {sendingEmail ? 'Sending...' : 'Email Invoice'}
                    </button>
                    <button
                        className={styles.actionBtn}
                        disabled={!phone}
                        onClick={() => {
                            window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi ${guestName}, this is regarding your booking at Ave Vista.`);
                        }}
                    >
                        <MessageCircle size={16} />
                        WhatsApp
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
