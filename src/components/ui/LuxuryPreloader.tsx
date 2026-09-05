'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './LuxuryPreloader.module.css';

interface LuxuryPreloaderProps {
    statusText?: string;
}

export default function LuxuryPreloader({
    statusText = 'Synchronizing Workspace...'
}: LuxuryPreloaderProps) {
    return (
        <motion.div
            className={styles.preloaderOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className={styles.ambientGlow} />

            <div className={styles.contentWrapper}>
                {/* Logo & Orbiting Rings */}
                <div className={styles.logoContainer}>
                    <div className={styles.orbitRing} />
                    <div className={styles.orbitRingInner} />
                    <div className={styles.logoBox}>
                        <Image
                            src="/logo.png"
                            alt="Ave Vista Resort & Spa"
                            width={90}
                            height={44}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>

                {/* Typography */}
                <motion.h2
                    className={styles.brandTitle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    Ave Vista Resort & Spa
                </motion.h2>

                <motion.p
                    className={styles.brandTagline}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.4 }}
                >
                    Hospitality Operations & Management System
                </motion.p>

                {/* Fluid Glowing Progress Track */}
                <div className={styles.progressTrack}>
                    <div className={styles.progressBar} />
                </div>

                <motion.span
                    className={styles.statusLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                >
                    {statusText}
                </motion.span>
            </div>
        </motion.div>
    );
}
