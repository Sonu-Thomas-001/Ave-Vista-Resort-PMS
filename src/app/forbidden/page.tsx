'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    ShieldAlert,
    ArrowLeft,
    LayoutDashboard,
    Lock,
    UserCheck,
    HelpCircle
} from 'lucide-react';
import styles from './page.module.css';

export default function ForbiddenPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>
                    <ShieldAlert size={15} />
                    <span>Security Clearance • HTTP 403</span>
                </div>

                <div className={styles.iconEmblem}>
                    <Lock size={34} />
                </div>

                <h1 className={styles.title}>Access Restricted</h1>
                <p className={styles.description}>
                    You do not have the designated property management role or administrative permissions
                    required to view or execute operations in this workstation section.
                </p>

                <div className={styles.clearanceCard}>
                    <div className={styles.clearanceRow}>
                        <span className={styles.clearanceLabel}>Your Current Active Role</span>
                        <span className={styles.roleBadgeActive}>
                            <UserCheck size={14} />
                            {user?.role || 'Staff Member'}
                        </span>
                    </div>

                    <div className={styles.clearanceRow}>
                        <span className={styles.clearanceLabel}>Clearance Level Required</span>
                        <span className={styles.roleBadgeRequired}>
                            <Lock size={13} />
                            Manager / Administrator
                        </span>
                    </div>

                    <div className={styles.helpNotice}>
                        If your operational duties require access to this section, please contact your Resort General Manager or IT System Administrator to upgrade your profile permissions.
                    </div>
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
