'use client';

import React from 'react';
import Header from '@/components/Header';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import {
    RotateCcw,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    CloudRain,
    Mail,
    Percent
} from 'lucide-react';
import styles from '@/components/legal/LegalPage.module.css';

export default function CancellationPolicyPage() {
    return (
        <>
            <Header title="Cancellation & Refund Policy" />
            <div className={styles.pageWrapper}>
                <LegalNavTabs />

                {/* Hero Header */}
                <div className={styles.legalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.badge}>
                            <RotateCcw size={14} />
                            <span>Transparent Guest Guarantee</span>
                        </div>
                        <h1 className={styles.title}>Cancellation & Refund Policy</h1>
                        <p className={styles.subtitle}>
                            Clear, fair, and flexible guidelines regarding reservation modifications, advance deposit
                            returns, and emergency stay rescheduling at Ave Vista Resort & Spa.
                        </p>
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Policy Effective: 2026 Hospitality Season</span>
                            </div>
                            <div className={styles.metaItem}>
                                <CreditCard size={14} />
                                <span>5–7 Business Days Gateway Disbursal</span>
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
                            <li><a href="#standard-timeline" className={styles.tocLink}>1. Standard Cancellation Windows</a></li>
                            <li><a href="#peak-season" className={styles.tocLink}>2. Peak Season & Holidays</a></li>
                            <li><a href="#no-shows-early-checkouts" className={styles.tocLink}>3. No-Shows & Early Departures</a></li>
                            <li><a href="#force-majeure" className={styles.tocLink}>4. Weather & Force Majeure</a></li>
                            <li><a href="#processing-timelines" className={styles.tocLink}>5. Refund Disbursal Methods</a></li>
                            <li><a href="#group-bookings" className={styles.tocLink}>6. Group & Wedding Events</a></li>
                        </ul>
                    </aside>

                    {/* Main Legal Sections */}
                    <main className={styles.contentCard}>
                        <section id="standard-timeline" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>1</span>
                                Standard Individual Cancellation Windows
                            </h2>
                            <p className={styles.paragraph}>
                                For standard reservations during regular non-peak periods, cancellation fees are determined by the time elapsed between notice of cancellation and official check-in time (02:00 PM on arrival date):
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>7 or More Days Prior:</strong> Full refund minus a 5% administrative bank processing fee.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>3 to 6 Days Prior:</strong> 50% refund of total booking value, or 100% credited as a future stay voucher valid for 6 months.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Less Than 72 Hours:</strong> Advance deposit equivalent to 1 night room tariff is retained.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="peak-season" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>2</span>
                                Peak Season & Festival Holiday Bookings
                            </h2>
                            <div className={styles.calloutWarning}>
                                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    Reservations falling within high-demand seasonal dates (December 20 – January 05, Diwali Holiday week, and Onam Festival) require a 100% advance deposit. Cancellations made within 21 days of arrival are strictly non-refundable due to blocked villa inventory.
                                </div>
                            </div>
                        </section>

                        <section id="no-shows-early-checkouts" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>3</span>
                                No-Shows & Early Checkouts
                            </h2>
                            <p className={styles.paragraph}>
                                In the event of a guest non-arrival (No-Show) without written notice, the entire booking deposit is forfeited and remaining nights will be automatically released back to public inventory.
                            </p>
                            <p className={styles.paragraph}>
                                Early departures or premature checkout before the reserved departure date are non-refundable for the remaining booked nights.
                            </p>
                        </section>

                        <section id="force-majeure" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>4</span>
                                Weather Alerts & Force Majeure
                            </h2>
                            <div className={styles.calloutNotice}>
                                <CloudRain size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    In the event of certified natural disasters, severe monsoon red alerts, government flight groundings, or road blockages, Ave Vista Resort will issue a 100% Resort Credit Voucher valid for 12 months with zero rescheduling fees.
                                </div>
                            </div>
                        </section>

                        <section id="processing-timelines" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>5</span>
                                Refund Processing & Gateways
                            </h2>
                            <p className={styles.paragraph}>
                                Approved refunds are processed directly by our accounts desk and remitted back through the original payment mode (UPI, Credit/Debit Card, or NEFT Bank Transfer).
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Credit/Debit Cards: 5 to 7 banking business days (subject to issuing bank clearance).</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>UPI / Net Banking: 2 to 4 business days.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="group-bookings" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>6</span>
                                Group Reservations & Destination Weddings
                            </h2>
                            <p className={styles.paragraph}>
                                Bookings involving 4 or more rooms, corporate retreats, or private wedding banquets are governed by a tailored Event Contract outlining phased milestone deposit schedules and individual cancellation thresholds.
                            </p>
                        </section>

                        {/* Contact Card */}
                        <div className={styles.contactCard}>
                            <div>
                                <div className={styles.contactInfoTitle}>Request a Cancellation or Reschedule?</div>
                                <div className={styles.contactInfoSub}>Our Front Desk Reservations Team is ready to assist your request.</div>
                            </div>
                            <a href="mailto:avevistaresort@gmail.com" className={styles.contactBtn}>
                                <Mail size={15} />
                                Email Reservations
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
