'use client';

import Header from '@/components/Header';
import styles from './page.module.css';

export default function TermsPage() {
    return (
        <>
            <Header title="Terms of Service" />
            <div className={styles.container}>
                <div className={styles.contentCard}>
                    <h1>Terms & Conditions</h1>
                    <p className={styles.subtitle}>Booking and stay policies for Ave Vista Resorts & Hotels</p>

                    <section>
                        <h2>1. Booking Confirmation</h2>
                        <ul className={styles.list}>
                            <li>Reservations are confirmed only after advance payment or official confirmation from the resort.</li>
                            <li>Guests must provide accurate contact details during booking.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Check-In & Check-Out</h2>
                        <ul className={styles.list}>
                            <li>Standard check-in and check-out timings apply unless approved by management.</li>
                            <li>Early check-in or late check-out is subject to availability and additional charges.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Payment Policy</h2>
                        <ul className={styles.list}>
                            <li>Full or partial payment may be required prior to arrival.</li>
                            <li>Tariffs may change during peak seasons or special events.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Resort Usage Rules</h2>
                        <ul className={styles.list}>
                            <li>Guests must respect property guidelines and maintain a peaceful environment.</li>
                            <li>Damages to property will be charged accordingly.</li>
                            <li>Outside food policies and pool timings must be followed.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Cancellation Policy</h2>
                        <ul className={styles.list}>
                            <li>Cancellation terms depend on the booking type and offer conditions.</li>
                            <li>Refund eligibility is determined by management policies.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Liability</h2>
                        <p>Ave Vista Resorts & Hotels is not responsible for loss of personal belongings or damages caused by misuse of facilities.</p>
                    </section>

                    <section>
                        <h2>7. Policy Updates</h2>
                        <p>Management reserves the right to update (modify) these terms without prior notice.</p>
                    </section>
                </div>
            </div>
        </>
    );
}
