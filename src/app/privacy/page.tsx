'use client';

import React from 'react';
import Header from '@/components/Header';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import {
    Shield,
    Lock,
    Calendar,
    Eye,
    Database,
    FileCheck,
    Mail,
    Server
} from 'lucide-react';
import styles from '@/components/legal/LegalPage.module.css';

export default function PrivacyPage() {
    return (
        <>
            <Header title="Privacy Policy" />
            <div className={styles.pageWrapper}>
                <LegalNavTabs />

                {/* Hero Header */}
                <div className={styles.legalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.badge}>
                            <Shield size={14} />
                            <span>Digital Personal Data Protection (DPDP) Compliant</span>
                        </div>
                        <h1 className={styles.title}>Privacy Policy & Guest Folio Protection</h1>
                        <p className={styles.subtitle}>
                            How Ave Vista Resort & Spa collects, utilizes, safeguards, and respects the confidential
                            personal and financial data of our guests and operational staff.
                        </p>
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Last Updated: February 01, 2026</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Lock size={14} />
                                <span>256-Bit SSL Encrypted Folio Database</span>
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
                            <li><a href="#data-collection" className={styles.tocLink}>1. Information We Collect</a></li>
                            <li><a href="#how-we-use" className={styles.tocLink}>2. Purpose & Processing</a></li>
                            <li><a href="#data-security" className={styles.tocLink}>3. Security & Cloud Safeguards</a></li>
                            <li><a href="#cctv-surveillance" className={styles.tocLink}>4. CCTV & Property Security</a></li>
                            <li><a href="#third-parties" className={styles.tocLink}>5. Third-Party Disclosures</a></li>
                            <li><a href="#guest-rights" className={styles.tocLink}>6. Your Rights & Erasure Requests</a></li>
                        </ul>
                    </aside>

                    {/* Main Legal Sections */}
                    <main className={styles.contentCard}>
                        <section id="data-collection" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>1</span>
                                Information We Collect
                            </h2>
                            <p className={styles.paragraph}>
                                When you make a reservation, visit the property, or interact with the Ave Vista PMS workstation, we may process the following categories of personal information:
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Guest Identification Data:</strong> Full legal name, date of birth, nationality, national identity number, and passport details.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Contact Credentials:</strong> Primary mobile phone number, institutional email address, and emergency contact details.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Financial & Billing Folio:</strong> Encrypted transaction identifiers, GSTIN invoice records, and room incidentals charges.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Stay Preferences:</strong> Dietary requirements, preferred room elevation, anniversary dates, and housekeeping requests.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="how-we-use" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>2</span>
                                Purpose of Data Processing
                            </h2>
                            <p className={styles.paragraph}>
                                Your personal information is utilized strictly for lawful hospitality operations, including:
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Executing reservation bookings, room assignments, and seamless front desk check-in procedures.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Generating statutory GST tax invoices and accounting audit ledgers.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Sending real-time booking confirmations, digital receipts, and concierge arrival updates via SMS/Email.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="data-security" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>3</span>
                                Cloud Architecture & Security Safeguards
                            </h2>
                            <div className={styles.calloutNotice}>
                                <Server size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    All guest folios are encrypted in transit and at rest using enterprise AES-256 standards with automated database backups, multi-factor staff authentication, and role-based clearance (RBAC) restrictions.
                                </div>
                            </div>
                            <p className={styles.paragraph}>
                                We maintain continuous monitoring to protect personal data against unauthorized interception, loss, or alteration.
                            </p>
                        </section>

                        <section id="cctv-surveillance" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>4</span>
                                CCTV & Property Surveillance
                            </h2>
                            <p className={styles.paragraph}>
                                For the safety of our guests, staff, and resort premises, Closed-Circuit Television (CCTV) cameras operate 24/7 across perimeter pathways, lobby reception, corridors, and dining pavilions. Cameras are strictly prohibited and never installed inside private villas, cottages, guest rooms, or restrooms.
                            </p>
                        </section>

                        <section id="third-parties" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>5</span>
                                Third-Party Disclosures
                            </h2>
                            <p className={styles.paragraph}>
                                Ave Vista Resort & Spa does not sell, lease, or monetize your personal information. Data is shared only with verified partners under strict contractual confidentiality:
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Payment Gateways:</strong> PCI-DSS compliant financial processors for secure credit card and UPI transactions.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Statutory Law Enforcement:</strong> Where strictly required under Indian law (e.g. Police Form C guest reporting regulations).</span>
                                </li>
                            </ul>
                        </section>

                        <section id="guest-rights" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>6</span>
                                Your Legal Rights & Data Officer
                            </h2>
                            <p className={styles.paragraph}>
                                In accordance with the Digital Personal Data Protection (DPDP) Act, you have the right to review, update, or request the erasure of your personal data from our active marketing lists.
                            </p>
                        </section>

                        {/* Contact Card */}
                        <div className={styles.contactCard}>
                            <div>
                                <div className={styles.contactInfoTitle}>Data Protection Officer (DPO)</div>
                                <div className={styles.contactInfoSub}>Ave Vista Resort & Spa • Calicut, Kerala, India</div>
                            </div>
                            <a href="mailto:avevistaresort@gmail.com" className={styles.contactBtn}>
                                <Mail size={15} />
                                Request Data Review
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
