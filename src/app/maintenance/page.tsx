'use client';

import React from 'react';
import Image from 'next/image';
import {
    Wrench,
    Clock,
    Phone,
    Mail,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import styles from './page.module.css';

export default function MaintenancePage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logoRow}>
                    <Image
                        src="/logo.png"
                        alt="Ave Vista Resort & Spa"
                        width={180}
                        height={55}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </div>

                <div className={styles.badge}>
                    <span className={styles.pulseDot} />
                    <span>Scheduled System Maintenance</span>
                </div>

                <div className={styles.iconEmblem}>
                    <Wrench size={34} />
                </div>

                <h1 className={styles.title}>System Maintenance in Progress</h1>
                <p className={styles.description}>
                    The Ave Vista Property Management System is currently undergoing scheduled database maintenance,
                    security enhancements, and financial audit reconciliations.
                </p>

                <div className={styles.statusCard}>
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Operational Status</span>
                        <span className={styles.statusVal} style={{ color: '#0284c7' }}>
                            Night Audit & Data Sync (72%)
                        </span>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} />
                    </div>

                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Estimated Resumption</span>
                        <span className={styles.statusVal}>Within 30 Minutes</span>
                    </div>

                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Guest Folio Protection</span>
                        <span className={styles.statusVal} style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={16} /> Encrypted & Secure
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '11px 22px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '11px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginBottom: '24px',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                    }}
                >
                    <RefreshCw size={16} />
                    Check System Status
                </button>

                <div className={styles.contactBox}>
                    <span className={styles.contactTitle}>Front Desk Emergency Escalations</span>
                    <div className={styles.contactNumbers}>
                        <a href="tel:+919061554545" className={styles.contactLink}>
                            📞 +91 90615 54545
                        </a>
                        <a href="tel:+919446595722" className={styles.contactLink}>
                            📞 +91 94465 95722
                        </a>
                        <a href="mailto:avevistaresort@gmail.com" className={styles.contactLink}>
                            ✉️ avevistaresort@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
