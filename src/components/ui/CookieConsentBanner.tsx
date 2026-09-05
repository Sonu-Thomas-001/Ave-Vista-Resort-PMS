'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import styles from './CookieConsentBanner.module.css';

export default function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const consent = localStorage.getItem('ave_vista_cookie_consent');
        if (!consent) {
            // Show after brief polite delay
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('ave_vista_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.bannerWrapper} role="dialog" aria-label="Cookie preferences">
            <div className={styles.headerRow}>
                <div className={styles.iconBox}>
                    <Cookie size={18} />
                </div>
                <h4 className={styles.title}>Digital Cookie Preferences</h4>
            </div>
            <p className={styles.desc}>
                We use essential session tokens to verify staff credentials and ensure smooth resort operations.
            </p>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.acceptBtn}
                    onClick={handleAccept}
                >
                    Accept Essential
                </button>
                <Link href="/cookie-policy" className={styles.policyBtn}>
                    View Policy
                </Link>
            </div>
        </div>
    );
}
