'use client';

import React, { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import styles from './LogoutConfirmModal.module.css';

interface LogoutConfirmModalProps {
    isOpen: boolean;
    userName?: string;
    userRole?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function LogoutConfirmModal({
    isOpen,
    userName,
    userRole,
    onConfirm,
    onCancel
}: LogoutConfirmModalProps) {
    const cancelBtnRef = useRef<HTMLButtonElement>(null);

    // Auto-focus the cancel button when opened to prevent accidental confirmations
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                cancelBtnRef.current?.focus();
            }, 80);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.backdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className={styles.modalCard}>
                <div className={styles.iconWrapper} aria-hidden="true">
                    <LogOut size={26} strokeWidth={2.2} />
                </div>

                <h2 id="logout-modal-title" className={styles.title}>
                    Sign Out of Ave Vista PMS?
                </h2>

                <p id="logout-modal-desc" className={styles.description}>
                    Are you sure you want to end your current session? Any unsaved operational changes will be lost.
                </p>

                {(userName || userRole) && (
                    <div className={styles.userCapsule}>
                        <span className={styles.userDot} aria-hidden="true" />
                        <span>
                            {userName || 'User'} {userRole ? `(${userRole})` : ''}
                        </span>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        ref={cancelBtnRef}
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                    >
                        Stay Signed In
                    </button>
                    <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={onConfirm}
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
