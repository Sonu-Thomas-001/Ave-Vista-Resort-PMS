'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Download, Eye, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface InvoiceWithDetails extends Invoice {
    booking?: any;
    guest?: any;
}

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState('Invoices'); // Invoices | DailyReport
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithDetails | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('invoice_date', { ascending: false });

        console.log('Invoices fetch result:', { data, error, count: data?.length });
        if (error) {
            console.error('Invoice fetch error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        }
        if (data) setInvoices(data);
        setLoading(false);
    };



    const handleViewInvoice = async (invoice: Invoice) => {
        // Fetch related booking and guest data
        const { data: booking } = await supabase
            .from('bookings')
            .select('*, guest:guests(*), room:rooms(*)')
            .eq('id', invoice.booking_id || '')
            .single();

        if (booking) {
            setViewingInvoice({ ...invoice, booking, guest: booking.guest });
        }
    };

    const handleDownloadInvoice = async (invoice: Invoice) => {
        // Fetch related data first
        const { data: booking } = await supabase
            .from('bookings')
            .select('*, guest:guests(*), room:rooms(*)')
            .eq('id', invoice.booking_id || '')
            .single();

        if (booking) {
            // Create a temporary container for printing
            const printContainer = document.createElement('div');
            printContainer.style.position = 'fixed';
            printContainer.style.top = '0';
            printContainer.style.left = '-9999px'; // Hide off-screen
            printContainer.style.width = '210mm'; // A4 width
            printContainer.style.zIndex = '9999';
            printContainer.style.background = 'white';
            printContainer.className = 'print-only-container';
            document.body.appendChild(printContainer);

            // Render invoice into the container
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(printContainer);

            const { InvoiceTemplate } = await import('@/components/InvoiceTemplate');
            root.render(
                <InvoiceTemplate
                    invoice={invoice}
                    booking={booking}
                    guest={booking.guest}
                />
            );

            // Wait for rendering and trigger print
            setTimeout(() => {
                window.print();
                // Clean up after print
                setTimeout(() => {
                    root.unmount();
                    document.body.removeChild(printContainer);
                }, 100);
            }, 500);
        }
    };

    const calculateGST = (baseAmount: number, rate: number) => {
        return (baseAmount * rate) / 100;
    };

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
    const pendingDues = invoices.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0);

    return (
        <>
            <Header title="Billing & Invoices" />

            <div className={styles.container}>
                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Revenue (Feb)</span>
                        <span className={styles.statValue}>₹{totalRevenue.toLocaleString()}</span>
                        <span className={styles.statSub}>Includes CGST + SGST</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Pending Dues</span>
                        <span className={styles.statValue} style={{ color: 'var(--status-warning)' }}>
                            ₹{pendingDues.toLocaleString()}
                        </span>
                        <span className={styles.statSub}>{invoices.filter(i => i.status !== 'Paid').length} invoices pending</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Today's Collection</span>
                        <span className={styles.statValue}>₹12,400</span>
                        <span className={styles.statSub}>4 Transactions</span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'Invoices' ? styles.active : ''}`}
                            onClick={() => setActiveTab('Invoices')}
                        >
                            All Invoices
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'DailyReport' ? styles.active : ''}`}
                            onClick={() => setActiveTab('DailyReport')}
                        >
                            Daily Reports
                        </button>
                    </div>

                </div>

                {activeTab === 'Invoices' ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Paid</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className={styles.idCell}>
                                            <FileText size={16} />
                                            {inv.invoice_number}
                                        </td>
                                        <td>{inv.guest_name}</td>
                                        <td><span className={styles.roomBadge}>{inv.room_number}</span></td>
                                        <td>{inv.invoice_date}</td>
                                        <td className={styles.amount}>₹{inv.total_amount.toLocaleString()}</td>
                                        <td className={styles.amount}>₹{inv.paid_amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[inv.status.toLowerCase()]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="View"
                                                    aria-label={`View Invoice ${inv.invoice_number}`}
                                                    onClick={() => handleViewInvoice(inv)}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Download"
                                                    aria-label={`Download Invoice ${inv.invoice_number}`}
                                                    onClick={() => handleDownloadInvoice(inv)}
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FileText size={48} />
                        <p>Detailed Daily Report Mockup</p>
                    </div>
                )}
            </div>

            {/* Invoice Viewer Modal */}
            {viewingInvoice && viewingInvoice.booking && (
                <div className={styles.modalOverlay} onClick={() => setViewingInvoice(null)}>
                    <div className={styles.invoiceViewerModal} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setViewingInvoice(null)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                        <div ref={invoiceRef}>
                            <InvoiceTemplate
                                invoice={viewingInvoice}
                                booking={viewingInvoice.booking}
                                guest={viewingInvoice.guest}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
