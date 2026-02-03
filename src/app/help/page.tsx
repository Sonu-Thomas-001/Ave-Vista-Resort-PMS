'use client';

import Header from '@/components/Header';
import { HelpCircle, Phone, Mail, Book, MessageCircle } from 'lucide-react';
import styles from './page.module.css';

export default function HelpPage() {
    return (
        <>
            <Header title="Help Center" />
            <div className={styles.container}>

                {/* Support Options */}
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Phone size={24} /></div>
                        <h3>24/7 Support</h3>
                        <p>Call our dedicated support line for urgent issues.</p>
                        <a href="tel:+1234567890" className={styles.link}>+91 98765 43210</a>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Mail size={24} /></div>
                        <h3>Email Us</h3>
                        <p>Send us an email and we'll reply within 2 hours.</p>
                        <a href="mailto:support@avevista.com" className={styles.link}>support@avevista.com</a>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconWrapper}><Book size={24} /></div>
                        <h3>Documentation</h3>
                        <p>Read detailed guides on how to use PMS features.</p>
                        <a href="#" className={styles.link}>View Docs &raarr;</a>
                    </div>
                </div>

                {/* FAQs */}
                <div className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>

                    <div className={styles.faqItem}>
                        <h3>How do I change a room status?</h3>
                        <p>Go to the <strong>Rooms</strong> tab, select the room you want to update, and use the status dropdown (Clean/Dirty/Maintenance) in the room details card.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>Can I refund a payment?</h3>
                        <p>Yes, navigate to <strong>Billing</strong>, find the invoice, and click the "Refund" action button. Note that this requires Manager or Admin permissions.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>How do I export monthly reports?</h3>
                        <p>Visit the <strong>Reports</strong> section via the sidebar. Select your date range to "This Month" and click the "Export PDF" button at the top right.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>I forgot my password.</h3>
                        <p>Please contact your System Administrator to reset your staff login credentials.</p>
                    </div>
                </div>

            </div>
        </>
    );
}
