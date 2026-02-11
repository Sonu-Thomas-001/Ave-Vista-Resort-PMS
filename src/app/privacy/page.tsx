'use client';

import Header from '@/components/Header';
import styles from './page.module.css';

export default function PrivacyPage() {
    return (
        <>
            <Header title="Privacy Policy" />
            <div className={styles.container}>
                <div className={styles.contentCard}>
                    <h1>Privacy Policy</h1>
                    <p className={styles.subtitle}>How we collect, use, and protect your information</p>

                    <section>
                        <h2>1. Introduction</h2>
                        <p>Ave Vista Resorts & Hotels respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how information is collected, used, stored, and safeguarded when you interact with our property management system, website, or booking services.</p>
                    </section>

                    <section>
                        <h2>2. Information We Collect</h2>
                        <ul className={styles.list}>
                            <li>Name, contact number, and email address</li>
                            <li>Booking details and stay preferences</li>
                            <li>Payment confirmation information</li>
                            <li>Communication history for customer support</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. How We Use Your Information</h2>
                        <ul className={styles.list}>
                            <li>To manage reservations and provide hospitality services</li>
                            <li>To communicate booking confirmations and updates</li>
                            <li>To improve guest experience and service quality</li>
                            <li>For internal analytics and operational management</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Data Protection</h2>
                        <p>We implement secure technical and administrative measures to protect your information against unauthorized access, misuse, or disclosure.</p>
                    </section>

                    <section>
                        <h2>5. Third-Party Sharing</h2>
                        <p>Your personal data will not be sold or shared with third-parties except when required for:</p>
                        <ul className={styles.list}>
                            <li>Payment processing</li>
                            <li>Legal compliance</li>
                            <li>Operational service delivery</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Your Rights</h2>
                        <p>Guests may request access, correction, or removal of personal information by contacting us directly.</p>
                        <p className={styles.contact}>📧 <a href="mailto:avevistaresort@gmail.com">avevistaresort@gmail.com</a></p>
                    </section>
                </div>
            </div>
        </>
    );
}
