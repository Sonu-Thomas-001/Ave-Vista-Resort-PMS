'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Building2,
    CalendarDays,
    UtensilsCrossed,
    BarChart3,
    Shield,
    LogIn,
    UserPlus,
    Lock
} from 'lucide-react';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import AuthFooter from './AuthFooter';
import styles from './AuthScreen.module.css';

interface AuthScreenProps {
    initialMode: 'login' | 'signup';
}

export default function AuthScreen({ initialMode }: AuthScreenProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

    // Keep mode synchronized with current route if back/forward button is pressed
    useEffect(() => {
        if (pathname.includes('signup')) {
            setMode('signup');
        } else if (pathname.includes('login')) {
            setMode('login');
        }
    }, [pathname]);

    const switchMode = (newMode: 'login' | 'signup') => {
        if (newMode === mode) return;
        setMode(newMode);
        router.replace(newMode === 'signup' ? '/signup' : '/login', { scroll: false });
    };

    return (
        <div className={styles.pageContainer}>
            {/* Left Showcase Hero Panel */}
            <div className={styles.showcasePanel}>
                <div className={styles.showcaseContent}>
                    {/* Top Brand & Status */}
                    <div className={styles.brandHeader}>
                        <Image
                            src="/logo-white.png"
                            alt="Ave Vista Resort & Spa"
                            width={160}
                            height={54}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                        <div className={styles.brandBadge}>
                            <span className={styles.pulseDot} />
                            Enterprise PMS
                        </div>
                    </div>

                    {/* Middle Highlights */}
                    <div className={styles.showcaseMiddle}>
                        <p className={styles.showcaseTagline}>Hospitality Intelligence Suite</p>
                        <h1 className={styles.showcaseHeadline}>
                            Elevating Luxury Resort Operations & Guest Folios
                        </h1>
                        <p className={styles.showcaseDescription}>
                            Comprehensive workstation for reservations, instant room inventory control,
                            restaurant POS dining, and executive financial auditing.
                        </p>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIconBox}>
                                    <CalendarDays size={18} />
                                </div>
                                <span className={styles.featureText}>
                                    Unified Reservations & Front Desk Operations
                                </span>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIconBox}>
                                    <UtensilsCrossed size={18} />
                                </div>
                                <span className={styles.featureText}>
                                    Kitchen POS Orders & In-Room Dining Billing
                                </span>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIconBox}>
                                    <BarChart3 size={18} />
                                </div>
                                <span className={styles.featureText}>
                                    Executive Night Audits, Occupancy & Tax Intelligence
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Legal & Property Info */}
                    <div className={styles.showcaseFooter}>
                        <span className={styles.resortLocation}>
                            Ave Vista Resort & Spa • Calicut, India
                        </span>
                        <div className={styles.showcaseLinks}>
                            <Link href="/help" className={styles.showcaseLink}>Help Desk</Link>
                            <Link href="/privacy" className={styles.showcaseLink}>Privacy</Link>
                            <Link href="/terms" className={styles.showcaseLink}>Terms</Link>
                            <Link href="/cancellation-policy" className={styles.showcaseLink}>Refunds</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Auth Portal Panel */}
            <div className={styles.portalPanel}>
                <div className={styles.portalCard}>
                    {/* Portal Header */}
                    <div className={styles.portalHeader}>
                        <div className={styles.mobileBrandLogo}>
                            <Image
                                src="/logo.png"
                                alt="Ave Vista Resort & Spa"
                                width={160}
                                height={50}
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>

                        <div className={styles.portalEmblemRow}>
                            <div className={styles.portalEmblem}>
                                <Building2 size={26} />
                            </div>
                        </div>
                        <h2 className={styles.portalTitle}>
                            {mode === 'login' ? 'Staff Sign In' : 'Create Staff Account'}
                        </h2>
                        <p className={styles.portalSubtitle}>
                            {mode === 'login'
                                ? 'Enter your institutional credentials to access the PMS workspace'
                                : 'Join the Ave Vista Resort & Spa hospitality operations team'}
                        </p>
                    </div>

                    {/* Mode Segmented Tab Switcher */}
                    <div className={styles.modeSwitcher}>
                        <button
                            type="button"
                            className={`${styles.modeBtn} ${mode === 'login' ? styles.modeBtnActive : ''}`}
                            onClick={() => switchMode('login')}
                        >
                            <LogIn size={18} />
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`${styles.modeBtn} ${mode === 'signup' ? styles.modeBtnActive : ''}`}
                            onClick={() => switchMode('signup')}
                        >
                            <UserPlus size={18} />
                            Create Account
                        </button>
                    </div>

                    {/* Active Form */}
                    <div className={styles.formWrapper} key={mode}>
                        {mode === 'login' ? (
                            <LoginForm onSwitchToSignup={() => switchMode('signup')} />
                        ) : (
                            <SignupForm onSwitchToLogin={() => switchMode('login')} />
                        )}
                    </div>
                </div>

                {/* Bottom Copyright Notice */}
                <div style={{ width: '100%', maxWidth: '480px', marginTop: 'auto', flexShrink: 0 }}>
                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}
