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
                    <p className={styles.lastUpdated}>Last Updated: Feb 03, 2026</p>

                    <section>
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as guest data (names, contact info), booking details, and staffing information necessary for PMS operations.</p>
                    </section>

                    <section>
                        <h2>2. How We Use Information</h2>
                        <p>We use the information to facilitate room bookings, manage staff schedules, generate invoices, and improve the overall guest experience at Ave Vista Resort.</p>
                    </section>

                    <section>
                        <h2>3. Data Security</h2>
                        <p>We implement appropriate security measures to protect against unauthorized access, alteration, or destruction of data stored in our system.</p>
                    </section>

                    <section>
                        <h2>4. Third-Party Sharing</h2>
                        <p>We do not sell your personal data. Data may be shared with third-party service providers (e.g., payment processors) only as strictly necessary to provide our services.</p>
                    </section>

                    <section>
                        <h2>5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@avevista.com.</p>
                    </section>
                </div>
            </div>
        </>
    );
}
