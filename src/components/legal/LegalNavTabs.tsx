'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Shield, RotateCcw, Cookie } from 'lucide-react';
import styles from './LegalNavTabs.module.css';

export default function LegalNavTabs() {
    const pathname = usePathname();

    const tabs = [
        { label: 'Terms of Service', href: '/terms', icon: FileText },
        { label: 'Privacy Policy', href: '/privacy', icon: Shield },
        { label: 'Cancellation & Refunds', href: '/cancellation-policy', icon: RotateCcw },
        { label: 'Cookie Policy', href: '/cookie-policy', icon: Cookie },
    ];

    return (
        <nav className={styles.tabsContainer} aria-label="Legal navigation">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`${styles.tabLink} ${isActive ? styles.tabLinkActive : ''}`}
                    >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
