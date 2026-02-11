'use client';

import Header from '@/components/Header';
import { HelpCircle, Phone, Mail, Book, MessageCircle, CreditCard, Home, Info } from 'lucide-react';
import styles from './page.module.css';

export default function HelpPage() {
    return (
        <>
            <Header title="Help Center" />
            <div className={styles.container}>
                <div className={styles.intro}>
                    <h1>Help & Support</h1>
                    <p className={styles.subtitle}>Everything you need to manage bookings and stay information</p>
                    <p className={styles.overview}>
                        Welcome to the Help Center of Ave Vista Resorts & Hotels. This section provides guidance for guests, booking partners, and administrators using our property management system. Here you can find answers related to reservations, payments, check-in procedures, facilities access, and booking policies.
                    </p>
                </div>

                <div className={styles.grid}>
                    {/* Booking Assistance */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Book size={24} /></div>
                        <h3>Booking Assistance</h3>
                        <ul className={styles.cardList}>
                            <li>How to make a reservation</li>
                            <li>How to modify or cancel bookings</li>
                            <li>Pre-booking requirements</li>
                            <li>Day package & event guidelines</li>
                        </ul>
                    </div>

                    {/* Stay & Property */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Home size={24} /></div>
                        <h3>Stay & Property</h3>
                        <ul className={styles.cardList}>
                            <li>Check-in & check-out timings</li>
                            <li>Pool usage and amenities access</li>
                            <li>Group booking requirements</li>
                            <li>Resort facilities and experiences</li>
                        </ul>
                    </div>

                    {/* Payment Support */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><CreditCard size={24} /></div>
                        <h3>Payment Support</h3>
                        <ul className={styles.cardList}>
                            <li>Accepted payment methods</li>
                            <li>Advance payment confirmation</li>
                            <li>Refund processing timelines</li>
                        </ul>
                    </div>

                    {/* Technical Support */}
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Phone size={24} /></div>
                        <h3>Technical Support</h3>
                        <p>If you experience issues while booking or accessing the system, contact us:</p>
                        <div className={styles.contactInfo}>
                            <a href="tel:+919061554545" className={styles.link}>+91 90615 54545</a>
                            <a href="tel:+919446595722" className={styles.link}>+91 94465 95722</a>
                            <a href="mailto:avevistaresort@gmail.com" className={styles.link}>avevistaresort@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
