'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Clock,
    Layers,
    ArrowRight,
    CalendarCheck,
    BedDouble,
    CreditCard,
    BarChart3
} from 'lucide-react';
import styles from './onboarding.module.css';

interface WelcomeModalProps {
    isOpen: boolean;
    role: string;
    totalSteps: number;
    onStart: () => void;
    onSkip: () => void;
}

export default function WelcomeModal({
    isOpen,
    role,
    totalSteps,
    onStart,
    onSkip
}: WelcomeModalProps) {
    const startBtnRef = useRef<HTMLButtonElement>(null);

    // Focus primary button when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                startBtnRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                onSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onSkip]);

    if (!isOpen) return null;

    const roleName = role ? `${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Staff';

    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            aria-describedby="welcome-subtitle"
        >
            <div className={styles.welcomeCard}>
                <div className={styles.welcomeGlowAccent} aria-hidden="true" />

                <div className={styles.welcomeHeader}>
                    {/* Resort Logo */}
                    <div className={styles.welcomeLogoWrapper}>
                        <Image
                            src="/logo.png"
                            alt="Ave Vista Resort & Hotels"
                            width={160}
                            height={66}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>

                    {/* Role Pill */}
                    <div className={styles.roleChip}>
                        <span className={styles.roleChipDot} />
                        <span>{roleName} Workstation Tour</span>
                    </div>

                    <h1 id="welcome-title" className={styles.welcomeTitle}>
                        Welcome to Ave Vista PMS
                    </h1>
                    <p id="welcome-subtitle" className={styles.welcomeSubtitle}>
                        Everything you need to manage your resort, from bookings and rooms to billing and daily operations.
                    </p>
                </div>

                {/* Feature Highlights Grid */}
                <div className={styles.welcomeFeatures}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIconCircle}>
                            <CalendarCheck size={14} />
                        </div>
                        <span>Reservations & Folios</span>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIconCircle}>
                            <BedDouble size={14} />
                        </div>
                        <span>Room Readiness</span>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIconCircle}>
                            <CreditCard size={14} />
                        </div>
                        <span>GST Billing & POS</span>
                    </div>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIconCircle}>
                            <BarChart3 size={14} />
                        </div>
                        <span>Audits & Operations</span>
                    </div>
                </div>

                <div className={styles.welcomeFooter}>
                    <div className={styles.tourMetaRow}>
                        <span className={styles.metaItem}>
                            <Layers size={13} color="var(--primary)" />
                            {totalSteps} guided modules
                        </span>
                        <span className={styles.metaItem}>
                            <Clock size={13} color="var(--primary)" />
                            2–3 minutes
                        </span>
                    </div>

                    <div className={styles.welcomeActions}>
                        <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={onSkip}
                        >
                            Skip for now
                        </button>
                        <button
                            ref={startBtnRef}
                            type="button"
                            className={styles.btnPrimary}
                            onClick={onStart}
                        >
                            <span>Let&apos;s Get Started</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
