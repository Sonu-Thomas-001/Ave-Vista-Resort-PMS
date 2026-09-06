'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { OnboardingStep } from '@/contexts/OnboardingContext';
import styles from './onboarding.module.css';

interface CompletionModalProps {
    isOpen: boolean;
    steps: OnboardingStep[];
    onFinish: () => void;
}

export default function CompletionModal({
    isOpen,
    steps,
    onFinish
}: CompletionModalProps) {
    const primaryBtnRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                primaryBtnRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                onFinish();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onFinish]);

    if (!isOpen) return null;

    const handleGoDashboard = () => {
        onFinish();
        router.push('/');
    };

    const handleExplore = () => {
        onFinish();
    };

    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
            aria-describedby="completion-desc"
        >
            <div className={styles.completionCard}>
                <div className={styles.successAnimationCircle}>
                    <CheckCircle2 size={34} strokeWidth={2.4} />
                </div>

                <h2 id="completion-title" className={styles.completionTitle}>
                    You&apos;re all set!
                </h2>

                <p id="completion-desc" className={styles.completionSubtitle}>
                    Ave Vista PMS is ready to help you manage your resort more efficiently.
                </p>

                {/* Grid of unlocked modules */}
                <div className={styles.modulesGrid}>
                    {steps.slice(0, 8).map(step => (
                        <div key={step.id} className={styles.moduleReadyTag}>
                            <CheckCircle2 size={15} className={styles.moduleReadyIcon} />
                            <span>{step.badgeLabel || step.title}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.completionActions}>
                    <button
                        ref={primaryBtnRef}
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleGoDashboard}
                    >
                        <LayoutDashboard size={16} />
                        <span>Go to Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={handleExplore}
                    >
                        <span>Explore PMS</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
