'use client';

import { Calendar, CreditCard, Upload, User } from 'lucide-react';
import styles from './NewBookingForm.module.css';

export default function NewBookingForm() {
    return (
        <div className={styles.formContainer}>
            <h2 className={styles.header}>New Reservation</h2>

            <form className={styles.form}>
                {/* Guest Section */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Guest Details</h3>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Full Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={18} className={styles.icon} />
                                <input type="text" className={styles.input} placeholder="John Doe" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input type="tel" className={styles.input} placeholder="+91 98765 43210" />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>ID Proof (Aadhar/Passport)</label>
                            <button type="button" className={`${styles.input} ${styles.fileBtn}`}>
                                <Upload size={18} /> Upload Identity Card
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stay Details */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Stay Details</h3>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Booking Source</label>
                            <select className={styles.select}>
                                <option>Walk-in</option>
                                <option>Phone</option>
                                <option>Website</option>
                                <option>Booking.com</option>
                                <option>Airbnb</option>
                                <option>MakeMyTrip</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-in Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar size={18} className={styles.icon} />
                                <input type="date" className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-out Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar size={18} className={styles.icon} />
                                <input type="date" className={styles.input} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Room Type</label>
                            <select className={styles.select}>
                                <option>Deluxe Hill View</option>
                                <option>Premium Suite</option>
                                <option>Standard Room</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className={styles.label} style={{ marginBottom: 0 }}>Room Number</label>
                                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                    <input type="checkbox" /> Auto-assign
                                </label>
                            </div>
                            <select className={styles.select}>
                                <option>101</option>
                                <option>102</option>
                                <option>103</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Payment */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Payment Info</h3>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Advance Amount (₹)</label>
                            <div className={styles.inputWrapper}>
                                <CreditCard size={18} className={styles.icon} />
                                <input type="number" className={styles.input} placeholder="5000" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Payment Mode</label>
                            <select className={styles.select}>
                                <option>UPI</option>
                                <option>Credit/Debit Card</option>
                                <option>Cash</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Confirm Booking</button>
                </div>
            </form>
        </div>
    );
}
