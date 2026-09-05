'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Compass,
    ArrowLeft,
    LayoutDashboard,
    CalendarDays,
    ConciergeBell,
    HelpCircle
} from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>
                    <Compass size={16} />
                    <span>Navigation Notice • Error 404</span>
                </div>

                <div className={styles.glitchNumber}>404</div>

                <h1 className={styles.title}>Lost in Paradise?</h1>
                <p className={styles.description}>
                    The PMS folio or operational resource you are searching for does not exist,
                    has been relocated, or is momentarily unavailable.
                </p>

                <div className={styles.navSectionTitle}>Recommended Destinations</div>

                <div className={styles.pillsGrid}>
                    <Link href="/" className={styles.navPill}>
                        <div className={styles.pillIconBox}>
                            <LayoutDashboard size={18} />
                        </div>
                        <div>
                            <div>PMS Dashboard</div>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>Executive Overview</span>
                        </div>
                    </Link>

                    <Link href="/front-desk" className={styles.navPill}>
                        <div className={styles.pillIconBox}>
                            <ConciergeBell size={18} />
                        </div>
                        <div>
                            <div>Front Desk</div>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>Live Guest Check-ins</span>
                        </div>
                    </Link>

                    <Link href="/bookings" className={styles.navPill}>
                        <div className={styles.pillIconBox}>
                            <CalendarDays size={18} />
                        </div>
                        <div>
                            <div>Reservations</div>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>Room Bookings List</span>
                        </div>
                    </Link>

                    <Link href="/help" className={styles.navPill}>
                        <div className={styles.pillIconBox}>
                            <HelpCircle size={18} />
                        </div>
                        <div>
                            <div>Help Center</div>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>Guides & Staff Support</span>
                        </div>
                    </Link>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <Link href="/" className={styles.primaryBtn}>
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
