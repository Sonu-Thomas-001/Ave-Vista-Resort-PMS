'use client';

import React from 'react';
import Header from '@/components/Header';
import LegalNavTabs from '@/components/legal/LegalNavTabs';
import {
    FileText,
    Calendar,
    Building2,
    ShieldCheck,
    AlertCircle,
    Mail,
    CheckCircle2
} from 'lucide-react';
import styles from '@/components/legal/LegalPage.module.css';

export default function TermsPage() {
    return (
        <>
            <Header title="Terms of Service" />
            <div className={styles.pageWrapper}>
                <LegalNavTabs />

                {/* Hero Header */}
                <div className={styles.legalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.badge}>
                            <Building2 size={14} />
                            <span>Hospitality Contract & Operational Rules</span>
                        </div>
                        <h1 className={styles.title}>Terms of Service</h1>
                        <p className={styles.subtitle}>
                            Official guest accommodations contract, reservation agreements, and property
                            guidelines governing your stay at Ave Vista Resort & Spa.
                        </p>
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Last Revised: January 15, 2026</span>
                            </div>
                            <div className={styles.metaItem}>
                                <ShieldCheck size={14} />
                                <span>Legally Binding Hospitality Agreement</span>
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
                            <li><a href="#booking-confirmation" className={styles.tocLink}>1. Booking & Folio Confirmation</a></li>
                            <li><a href="#checkin-checkout" className={styles.tocLink}>2. Check-In & Check-Out Timings</a></li>
                            <li><a href="#tariffs-payment" className={styles.tocLink}>3. Tariffs, Taxes & Payment</a></li>
                            <li><a href="#property-usage" className={styles.tocLink}>4. Resort Amenities & Safety</a></li>
                            <li><a href="#damages-liability" className={styles.tocLink}>5. Property Damages & Indemnity</a></li>
                            <li><a href="#governing-law" className={styles.tocLink}>6. Dispute Resolution & Jurisdiction</a></li>
                        </ul>
                    </aside>

                    {/* Main Legal Sections */}
                    <main className={styles.contentCard}>
                        <section id="booking-confirmation" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>1</span>
                                Booking & Folio Confirmation
                            </h2>
                            <p className={styles.paragraph}>
                                Reservations made via the Ave Vista PMS workstation, online direct booking engine, or authorized travel partners are confirmed only upon receipt of the designated advance deposit or official reservation voucher with a valid Guest Folio Number.
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>All guests must register legal government-issued photo identification (Aadhaar, Passport, or Driving License) upon check-in.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Foreign nationals must present a valid passport and visa, and submit Form C documentation in compliance with Indian regulatory authorities.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="checkin-checkout" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>2</span>
                                Check-In & Check-Out Timings
                            </h2>
                            <p className={styles.paragraph}>
                                To ensure meticulous room sanitization and premium resort housekeeping standards, standard operational schedules are strictly observed:
                            </p>
                            <div className={styles.calloutNotice}>
                                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong>Standard Check-In:</strong> 02:00 PM (14:00 hrs) | <strong>Standard Check-Out:</strong> 11:00 AM (11:00 hrs). Early arrivals or late departures are subject to prior management approval and inventory availability.
                                </div>
                            </div>
                        </section>

                        <section id="tariffs-payment" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>3</span>
                                Tariffs, Taxes & Payment Policy
                            </h2>
                            <p className={styles.paragraph}>
                                Room rates and package prices quoted are subject to applicable statutory Goods and Services Tax (GST) as mandated by the Government of India. Full room charges and anticipated incidental expenses must be settled upon check-in.
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Accepted payment methods include major credit/debit cards, UPI, net banking, and approved institutional bank wires.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Restaurant dining, spa sessions, and experiential tours will be charged to the room folio and must be cleared prior to final departure checkout.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="property-usage" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>4</span>
                                Resort Amenities & Safety Conduct
                            </h2>
                            <p className={styles.paragraph}>
                                Guests are required to respect resort guidelines, peaceful surroundings, and natural environment at all times:
                            </p>
                            <ul className={styles.list}>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Infinity Swimming Pool:</strong> Proper synthetic swimwear is compulsory. Pool operational hours are 07:00 AM to 07:00 PM. Unaccompanied minors are not permitted.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span><strong>Non-Smoking Policy:</strong> All luxury cottages, villas, and suites are strictly non-smoking. Designated outdoor smoking pavilions are provided.</span>
                                </li>
                                <li className={styles.listItem}>
                                    <span className={styles.bulletDot} />
                                    <span>Outside food and alcoholic beverages are restricted in public common areas and the main dining pavilion.</span>
                                </li>
                            </ul>
                        </section>

                        <section id="damages-liability" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>5</span>
                                Property Damages & Guest Indemnity
                            </h2>
                            <div className={styles.calloutWarning}>
                                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    Guests assume full responsibility for any physical damage, loss, or breakage caused to resort property, electronic equipment, or linen. Appropriate restoration charges will be debited to the registered guest folio.
                                </div>
                            </div>
                            <p className={styles.paragraph}>
                                Ave Vista Resort & Spa is not liable for loss or damage to cash, jewelry, or valuables not secured inside the complimentary in-room digital electronic safe.
                            </p>
                        </section>

                        <section id="governing-law" className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>6</span>
                                Dispute Resolution & Governing Law
                            </h2>
                            <p className={styles.paragraph}>
                                These terms and any legal actions arising from your stay or reservations shall be governed exclusively by the laws of India, under the sole jurisdiction of courts located in Kozhikode (Calicut), Kerala.
                            </p>
                        </section>

                        {/* Contact Card */}
                        <div className={styles.contactCard}>
                            <div>
                                <div className={styles.contactInfoTitle}>Questions regarding our Terms?</div>
                                <div className={styles.contactInfoSub}>Our Front Office and Guest Relations team is available 24/7.</div>
                            </div>
                            <a href="mailto:avevistaresort@gmail.com" className={styles.contactBtn}>
                                <Mail size={15} />
                                Contact Legal Desk
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
