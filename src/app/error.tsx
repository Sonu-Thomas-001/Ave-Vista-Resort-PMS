'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    RotateCcw,
    LayoutDashboard,
    HelpCircle
} from 'lucide-react';
import styles from './error.module.css';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Ave Vista PMS Runtime Exception:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>
                    <AlertTriangle size={15} />
                    <span>System Exception • HTTP 500</span>
                </div>

                <div className={styles.iconEmblem}>
                    <AlertTriangle size={36} />
                </div>

                <h1 className={styles.title}>System Interruption</h1>
                <p className={styles.description}>
                    An unexpected runtime exception was encountered while executing this PMS workflow.
                    Your existing database transactions and folio states remain safely secured.
                </p>

                {error?.digest && (
                    <div className={styles.diagnosticCard}>
                        <span className={styles.diagnosticLabel}>Diagnostic Reference ID</span>
                        <div className={styles.diagnosticDigest}>{error.digest}</div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => reset()}
                    >
                        <RotateCcw size={16} />
                        Retry Operation
                    </button>
                    <Link href="/" className={styles.secondaryBtn}>
                        <LayoutDashboard size={16} />
                        Return to Dashboard
                    </Link>
                    <Link href="/help" className={styles.secondaryBtn}>
                        <HelpCircle size={16} />
                        Help Desk
                    </Link>
                </div>
            </div>
        </div>
    );
}
