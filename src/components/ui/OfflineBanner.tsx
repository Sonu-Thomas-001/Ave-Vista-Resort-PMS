'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowRestored(true);
            const timer = setTimeout(() => setShowRestored(false), 3500);
            return () => clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowRestored(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline && !showRestored) {
        return null;
    }

    if (!isOnline) {
        return (
            <div className={`${styles.banner} ${styles.offline}`} role="alert">
                <span className={styles.pulse} />
                <WifiOff size={16} />
                <span>
                    Offline Mode: Resort internet disconnected. Transactions are safely cached and will sync automatically upon reconnection.
                </span>
            </div>
        );
    }

    return (
        <div className={`${styles.banner} ${styles.online}`} role="status">
            <CheckCircle2 size={16} />
            <span>Connection Restored: Property Management System synchronized with cloud database.</span>
        </div>
    );
}
