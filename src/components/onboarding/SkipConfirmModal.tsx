'use client';

import React, { useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './onboarding.module.css';

interface SkipConfirmModalProps {
    isOpen: boolean;
    onContinue: () => void;
    onConfirmSkip: () => void;
}

export default function SkipConfirmModal({
    isOpen,
    onContinue,
    onConfirmSkip
}: SkipConfirmModalProps) {
    const continueBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            continueBtnRef.current?.focus();
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                onContinue();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onContinue]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="skip-confirm-title"
            aria-describedby="skip-confirm-desc"
            style={{ zIndex: 10005 }}
        >
            <div className={styles.confirmCard}>
                <div className={styles.confirmIconCircle}>
                    <HelpCircle size={26} />
                </div>

                <h3 id="skip-confirm-title" className={styles.confirmTitle}>
                    Skip the onboarding tour?
                </h3>

                <p id="skip-confirm-desc" className={styles.confirmText}>
                    You can always restart the tour later from <strong>Help &amp; Support</strong> or your <strong>Profile menu</strong>.
                </p>

                <div className={styles.confirmActions}>
                    <button
                        type="button"
                        className={styles.btnSkipConfirm}
                        onClick={onConfirmSkip}
                    >
                        Skip Tour
                    </button>
                    <button
                        ref={continueBtnRef}
                        type="button"
                        className={styles.btnContinueTour}
                        onClick={onContinue}
                    >
                        Continue Tour
                    </button>
                </div>
            </div>
        </div>
    );
}
