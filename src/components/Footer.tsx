'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.linksRow}>
                    <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
                    <span className={styles.divider}>&bull;</span>
                    <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                    <span className={styles.divider}>&bull;</span>
                    <Link href="/cancellation-policy" className={styles.footerLink}>Cancellation Policy</Link>
                    <span className={styles.divider}>&bull;</span>
                    <Link href="/cookie-policy" className={styles.footerLink}>Cookie Policy</Link>
                    <span className={styles.divider}>&bull;</span>
                    <Link href="/help" className={styles.footerLink}>Help Center</Link>
                </div>
                <p className={styles.copyrightText}>
                    <span>&copy; {currentYear} <strong>Ave Vista Resorts PMS</strong>.</span>
                    <span className={styles.divider}>&bull;</span>
                    <span>A product of <strong>MidCell Studios</strong>.</span>
                    <span className={styles.divider}>&bull;</span>
                    <span>Proprietary Software. All Rights Reserved</span>
                </p>
            </div>
        </footer>
    );
}
