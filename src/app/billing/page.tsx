'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Download, Eye, Plus, FileText, X, Check, CreditCard, DollarSign } from 'lucide-react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    // New Invoice Form State
    const [newInv, setNewInv] = useState({
        guest: '',
        room: '',
        amount: '',
        gstRate: '12', // 12 or 18
        paymentMode: 'Card',
        isPartial: false,
        paidAmount: ''
    });

    const handleCreateInvoice = async () => {
        const baseAmount = parseFloat(newInv.amount) || 0;
        const gstPercent = parseInt(newInv.gstRate) || 0;
        const taxAmount = (baseAmount * gstPercent) / 100;
        const totalAmount = baseAmount + taxAmount;

        const paid = newInv.isPartial ? (parseFloat(newInv.paidAmount) || 0) : totalAmount;
        const status = paid >= totalAmount ? 'Paid' : 'Partial';

        // Gen random invoice number for now (should be sequential in production)
        const invNum = `INV-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

        const newInvoice = {
            invoice_number: invNum,
            guest_name: newInv.guest,
            room_number: newInv.room,
            invoice_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            paid_amount: paid,
            status: status as 'Paid' | 'Partial',
            payment_mode: newInv.paymentMode as 'Card' | 'Cash' | 'UPI',
            gst_rate: gstPercent,
            is_partial: newInv.isPartial
        };

        const { data, error } = await supabase
            .from('invoices')
            .insert([newInvoice])
            .select();

        if (data) {
            setInvoices([data[0], ...invoices]);
            setIsModalOpen(false);
            // Reset form
            setNewInv({ guest: '', room: '', amount: '', gstRate: '12', paymentMode: 'Card', isPartial: false, paidAmount: '' });
        } else if (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice');
        }
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
                    <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Create Invoice
                    </button>
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

            {/* Create Invoice Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Generate Invoice</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Guest Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={newInv.guest}
                                    onChange={e => setNewInv({ ...newInv, guest: e.target.value })}
                                    placeholder="Enter guest name"
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Room No.</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={newInv.room}
                                        onChange={e => setNewInv({ ...newInv, room: e.target.value })}
                                        placeholder="101"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Base Amount (Excl. Tax) (₹)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={newInv.amount}
                                        onChange={e => setNewInv({ ...newInv, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className={styles.gstBox}>
                                <label>GST Applicable</label>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="gst"
                                            checked={newInv.gstRate === '12'}
                                            onChange={() => setNewInv({ ...newInv, gstRate: '12' })}
                                        /> 12% (<span className={styles.gstVal}>CGST 6% + SGST 6%</span>)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="gst"
                                            checked={newInv.gstRate === '18'}
                                            onChange={() => setNewInv({ ...newInv, gstRate: '18' })}
                                        /> 18% (<span className={styles.gstVal}>CGST 9% + SGST 9%</span>)
                                    </label>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Payment Mode</label>
                                <div className={styles.modeGrid}>
                                    {['Cash', 'Card', 'UPI'].map(mode => (
                                        <button
                                            key={mode}
                                            className={`${styles.modeBtn} ${newInv.paymentMode === mode ? styles.modeActive : ''}`}
                                            onClick={() => setNewInv({ ...newInv, paymentMode: mode })}
                                        >
                                            {mode === 'Card' ? <CreditCard size={16} /> : <DollarSign size={16} />}
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={newInv.isPartial}
                                        onChange={e => setNewInv({ ...newInv, isPartial: e.target.checked })}
                                    />
                                    Partial Payment?
                                </label>
                            </div>

                            {newInv.isPartial && (
                                <div className={styles.formGroup}>
                                    <label>Amount Paid Now (₹)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={newInv.paidAmount}
                                        onChange={e => setNewInv({ ...newInv, paidAmount: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.submitBtn} onClick={handleCreateInvoice}>
                                <Check size={18} /> Rate Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
