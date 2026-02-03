'use client';

import Header from '@/components/Header';
import styles from './page.module.css';

export default function TermsPage() {
    return (
        <>
            <Header title="Terms of Service" />
            <div className={styles.container}>
                <div className={styles.contentCard}>
                    <h1>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last Updated: Feb 03, 2026</p>

                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using Ave Vista PMS, you agree to comply with and be bound by these Terms of Service. If you do not agree, please strictly do not use our services.</p>
                    </section>

                    <section>
                        <h2>2. Use of Service</h2>
                        <p>You agree to use the PMS solely for legitimate property management operations. Any unauthorized use, including data scraping or malicious attacks, is strictly prohibited.</p>
                    </section>

                    <section>
                        <h2>3. User Responsibilities</h2>
                        <p>Users are responsible for maintaining the confidentiality of their login credentials and for all activities that occur under their account.</p>
                    </section>

                    <section>
                        <h2>4. Limitation of Liability</h2>
                        <p>Ave Vista PMS is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
                    </section>

                    <section>
                        <h2>5. Termination</h2>
                        <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any breach of these Terms.</p>
                    </section>
                </div>
            </div>
        </>
    );
}
