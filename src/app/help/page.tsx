'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import {
    Search,
    BookOpen,
    ConciergeBell,
    UtensilsCrossed,
    Calculator,
    BedDouble,
    ChevronDown,
    ChevronUp,
    Phone,
    Mail,
    MessageSquare,
    CheckCircle2,
    LifeBuoy,
    Compass,
    ArrowRight
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import styles from './page.module.css';

export default function HelpPage() {
    const { restartTour } = useOnboarding();
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const categories = [
        {
            title: 'Front Desk & Guest Check-Ins',
            desc: 'Guest arrival workflows, room assignments, ID collection, and key distribution.',
            icon: ConciergeBell,
            items: [
                'Expedited Aadhaar/Passport photo scan registration',
                'Early check-in & late check-out rate overrides',
                'Splitting and merging multi-room family folios',
                'Instant digital keycard assignment'
            ]
        },
        {
            title: 'Restaurant POS & Room Dining',
            desc: 'Table billing, Kitchen Order Tickets (KOT), tax invoices, and room transfers.',
            icon: UtensilsCrossed,
            items: [
                'Direct-to-room dining charge transfers',
                'Custom discount codes & promotional vouchers',
                'Split billing between cash, card, and UPI',
                'Kitchen order ticket voiding and reprinting'
            ]
        },
        {
            title: 'Billing & Night Audits',
            desc: 'Day-end closing, GST statutory invoices, payment reconciliation, and audit ledgers.',
            icon: Calculator,
            items: [
                'Automated 02:00 AM night audit roll cycle',
                'Generating B2B and B2C GST compliance invoices',
                'Resolving credit card gateway payment discrepancies',
                'End-of-shift cashier cash drawer settlement'
            ]
        },
        {
            title: 'Housekeeping & Room Inventory',
            desc: 'Live room cleanliness states, maintenance blocks, and minibar inventory.',
            icon: BedDouble,
            items: [
                'Toggling Clean / Dirty / Inspected room statuses',
                'Logging plumbing or AC maintenance work orders',
                'Minibar replenishments & laundry charges',
                'Extra bed (cots) and baby crib requests'
            ]
        }
    ];

    const faqs = [
        {
            q: 'How do I transfer a restaurant dining bill to a guest room folio?',
            a: 'In the Restaurant Billing workstation, choose "Transfer to Room" upon checkout. Type the guest room number or guest surname. The PMS will verify if the room status is currently "Checked In" and automatically post the dining bill to their folio ledger.'
        },
        {
            q: 'What should I do if a credit card transaction fails during check-in?',
            a: 'If a payment gateway drops or fails, do not re-swipe immediately. Check the Payment Audit tab for pending webhook confirmations. If unconfirmed after 60 seconds, you can switch to alternate payment (UPI QR scan or corporate bank transfer) while keeping the booking on soft hold.'
        },
        {
            q: 'How does the PMS handle Night Audit and day-close?',
            a: 'The system runs an automated Night Audit at 02:00 AM to post daily room charges, calculate room tax liabilities, and update occupancy statistics. Front desk staff can review the Daily Closing Report under the Reports section.'
        },
        {
            q: 'How do I issue a partial cancellation refund for an advance deposit?',
            a: 'Open the booking from the Reservations screen, select "Cancel Booking", and review the automated refund calculation based on our Cancellation Policy. Enter manager authorization credentials to disburse the approved refund back to the guest.'
        },
        {
            q: 'What is the procedure during an internet outage?',
            a: 'Ave Vista PMS features local offline caching. The top status bar will alert you that you are working offline. You can continue creating check-in records; all pending entries will automatically sync to Supabase once connectivity is restored.'
        }
    ];

    // Filter categories & FAQs based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.desc.toLowerCase().includes(q) ||
            c.items.some(item => item.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;
        const q = searchQuery.toLowerCase();
        return faqs.filter(f =>
            f.q.toLowerCase().includes(q) ||
            f.a.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <>
            <Header title="Help Center & Knowledge Base" />
            <div className={styles.pageWrapper}>
                {/* Hero Search Section */}
                <div className={styles.heroHeader}>
                    <div className={styles.heroContent}>
                        <div className={styles.badge}>
                            <LifeBuoy size={14} />
                            <span>Hospitality Operations Knowledge Base</span>
                        </div>
                        <h1 className={styles.heroTitle}>How can we assist you today?</h1>
                        <p className={styles.heroSubtitle}>
                            Explore comprehensive operational procedures, front desk troubleshooting,
                            restaurant billing guides, and resort executive night audit workflows.
                        </p>

                        <div className={styles.searchContainer}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search guides, folios, KOT billing, or procedures..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Interactive Tour Re-launch Banner */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #CFD8DC',
                        padding: '1.25rem 1.75rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.25rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px', flex: 1 }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#E1F5FE',
                                color: '#039BE5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <Compass size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#263238', margin: '0 0 2px 0' }}>
                                Interactive PMS Guided Tour
                            </h3>
                            <p style={{ fontSize: '0.86rem', color: '#546E7A', margin: 0 }}>
                                Need a refresher? Re-launch the role-tailored guided walkthrough across all Ave Vista modules.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={restartTour}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            background: '#039BE5',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 8px rgba(3, 155, 229, 0.28)'
                        }}
                    >
                        <span>Launch Tour</span>
                        <ArrowRight size={15} />
                    </button>
                </div>

                {/* Operations Pillars */}
                <div className={styles.sectionHeadingRow}>
                    <h2 className={styles.sectionTitle}>Operational Knowledge Pillars</h2>
                    <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                        Showing {filteredCategories.length} core operational domains
                    </span>
                </div>

                <div className={styles.categoryGrid}>
                    {filteredCategories.map((cat, idx) => {
                        const Icon = cat.icon;
                        return (
                            <div key={idx} className={styles.categoryCard}>
                                <div>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.iconBox}>
                                            <Icon size={22} />
                                        </div>
                                        <h3 className={styles.categoryTitle}>{cat.title}</h3>
                                    </div>
                                    <p className={styles.categoryDesc}>{cat.desc}</p>
                                    <ul className={styles.checklist}>
                                        {cat.items.map((item, i) => (
                                            <li key={i} className={styles.checkItem}>
                                                <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Frequently Answered Questions Accordion */}
                <div className={styles.faqSection}>
                    <div className={styles.sectionHeadingRow}>
                        <h2 className={styles.sectionTitle}>Frequently Asked Operating Questions</h2>
                    </div>

                    <div className={styles.faqList}>
                        {filteredFaqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div key={idx} className={styles.faqItem}>
                                    <button
                                        type="button"
                                        className={styles.faqTrigger}
                                        onClick={() => toggleFaq(idx)}
                                        aria-expanded={isOpen}
                                    >
                                        <span>{faq.q}</span>
                                        {isOpen ? <ChevronUp size={18} color="#0284c7" /> : <ChevronDown size={18} color="#64748b" />}
                                    </button>
                                    {isOpen && (
                                        <div className={styles.faqAnswer}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Emergency Contact & Escalation */}
                <div className={styles.supportCard}>
                    <div className={styles.supportLeft}>
                        <div className={styles.supportTitle}>Need Immediate Operational Escalation?</div>
                        <p className={styles.supportDesc}>
                            Our on-property Operations Director and Hospitality IT Systems Engineers are on call 24/7 to resolve guest folio disputes or system incidents.
                        </p>
                    </div>
                    <div className={styles.supportActions}>
                        <a href="tel:+919061554545" className={styles.hotlineBtn}>
                            <Phone size={16} />
                            Duty Manager: +91 90615 54545
                        </a>
                        <a href="https://wa.me/919446595722" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                            <MessageSquare size={16} color="#16a34a" />
                            WhatsApp Desk
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
