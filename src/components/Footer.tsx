'use client';

import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
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
