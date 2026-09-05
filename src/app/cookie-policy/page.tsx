'use client';

import React from 'react';
import Header from '@/components/Header';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import {
    Cookie,
    Calendar,
    Shield,
    CheckCircle2,
    Sliders,
    Database,
    Mail
} from 'lucide-react';
import styles from '@/components/legal/LegalPage.module.css';

export default function CookiePolicyPage() {
    return (
        <>
            <Header title="Cookie Policy" />
            <div className={styles.pageWrapper}>
                <LegalNavTabs />

                {/* Hero Header */}
                <div className={styles.legalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.badge}>
                            <Cookie size={14} />
                            <span>Transparent Digital Privacy</span>
                        </div>
                        <h1 className={styles.title}>Cookie & Device Tracking Policy</h1>
                        <p className={styles.subtitle}>
                            How Ave Vista Resort & Spa utilizes essential session cookies, operational tokens, and security
                            identifiers across our Property Management System and digital guest portals.
                        </p>
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Published: 2026</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Shield size={14} />
                                <span>Zero Non-Consensual Third-Party Ad Trackers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className={styles.layoutGrid}>
                    {/* Sticky TOC Sidebar */}
                    <aside className={styles.sidebarTOC}>
                        <div className={styles.tocTitle}>Table of Contents</div>
                        <ul className={styles.tocList}>
                            <li><a href="#what-are-cookies" className={styles.tocLink}>1. What are Cookies?</a></li>
                            <li><a href="#categories" className={styles.tocLink}>2. Categories We Employ</a></li>
                            <li><a href="#essential-cookies" className={styles.tocLink}>3. Strictly Necessary Tokens</a></li>
                            <li><a href="#preferences-performance" className={styles.tocLink}>4. Performance & Language</a></li>
                            <li><a href="#managing-cookies" className={styles.tocLink}>5. Managing Your Preferences</a></li>
                        </ul>
                    </aside>

                    {/* Main Legal Sections */}
                    <main className={styles.contentCard}>
                        <section id="what-are-cookies" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>1</span>
                                What are Cookies and Local Identifiers?
                            </h2>
                            <p className={styles.paragraph}>
                                Cookies and browser storage (such as `localStorage` and `sessionStorage`) are small data files stored on your computer or mobile device when you access our PMS workstation or resort portal. They allow our systems to recognize your authenticated staff login and maintain your UI preferences securely.
                            </p>
                        </section>

                        <section id="categories" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>2</span>
                                Cookie Classifications We Employ
                            </h2>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Strictly Necessary Cookies:</strong> Essential for PMS authentication, session validity, CSRF protection, and role-based permissions.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Preferences & Settings:</strong> Retain your sidebar collapse states, calendar filter configurations, and theme preferences across app sessions.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Operational Analytics:</strong> Aggregate latency metrics to ensure high-availability server performance during peak check-in rushes.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="essential-cookies" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>3</span>
                                Strictly Necessary Session Tokens
                            </h2>
                            <div className={styles.calloutNotice}>
                                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    Essential tokens cannot be disabled within the PMS environment because they are strictly required for security validation, staff role permissions, and guest payment verification.
                                </div>
                            </div>
                        </section>

                        <section id="preferences-performance" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>4</span>
                                Performance & Preference Storage
                            </h2>
                            <p className={styles.paragraph}>
                                We store non-sensitive local keys (e.g. `sidebarCollapsed`) directly in your browser's local sandbox to ensure smooth transitions between front desk views and booking calendar timelines without unnecessary server fetches.
                            </p>
                        </section>

                        <section id="managing-cookies" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>5</span>
                                Controlling Your Browser Storage
                            </h2>
                            <p className={styles.paragraph}>
                                You can configure your web browser (Chrome, Safari, Edge, or Firefox) to decline or delete cookies at any time via browser security preferences. Note that clearing session tokens will require you to re-authenticate with your staff credentials.
                            </p>
                        </section>

                        {/* Contact Card */}
                        <div className={styles.contactCard}>
                            <div>
                                <div className={styles.contactInfoTitle}>Have Questions on Tracking & Data?</div>
                                <div className={styles.contactInfoSub}>Our Hospitality IT Desk will promptly address your security inquiry.</div>
                            </div>
                            <a href="mailto:avevistaresort@gmail.com" className={styles.contactBtn}>
                                <Mail size={15} />
                                Contact IT Support
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
