'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Download, Eye, FileText, X, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';

type EditableInvoice = Invoice & {
    booking?: any;
    booking_source?: string;
};

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface InvoiceWithDetails extends Invoice {
    booking?: any;
    guest?: any;
}

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState('Invoices'); // Invoices | DailyReport
    const [invoices, setInvoices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithDetails | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<EditableInvoice | null>(null);
    const [pendingUpdate, setPendingUpdate] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchInvoices();
        fetchBookings();

        // Set up polling for real-time updates every 15 seconds
        const interval = setInterval(() => {
            fetchInvoices();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const getReadableFetchError = (error: any) => {
        const message = error?.message || '';
        if (message.includes('Failed to fetch')) {
            return 'Unable to connect to Supabase right now. Please check your internet connection or Supabase settings.';
        }
        return message || 'Failed to load data.';
    };

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*, booking:bookings(booking_number, source)')
                .order('invoice_date', { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
            setFetchError(null);
        } catch (error: any) {
            console.warn('Invoice fetch failed:', error?.message || error);
            setFetchError(getReadableFetchError(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    guest_id,
                    room_id,
                    booking_number,
                    source,
                    check_in_date,
                    check_out_date,
                    room_rate,
                    extra_pax,
                    extra_pax_rate,
                    guests(first_name, last_name, email, phone, company_name, gst_number, address),
                    rooms(room_number, type)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            console.warn('Bookings fetch failed:', error?.message || error);
            setFetchError((current) => current || getReadableFetchError(error));
        }
    };

    const autoInvoiceStatus = (paidAmount: number, totalAmount: number) => {
        if (paidAmount >= totalAmount && totalAmount > 0) return 'Paid';
        if (paidAmount > 0) return 'Partial';
        return 'Pending';
    };

    const calculateInvoiceGstAmount = (totalAmount: number, gstRate: number) => {
        return (Number(totalAmount || 0) * Number(gstRate || 0)) / 100;
    };

    const openEditInvoice = (invoice: any) => {
        const linkedBooking = bookings.find((item) => item.id === invoice.booking_id);
        setEditingInvoice({
            ...invoice,
            booking: linkedBooking || invoice.booking,
            booking_source: linkedBooking?.source || invoice.booking?.source || 'Direct',
            guest_email: linkedBooking?.guests?.email || '',
            guest_phone: linkedBooking?.guests?.phone || '',
            guest_company_name: linkedBooking?.guests?.company_name || '',
            guest_gst_number: linkedBooking?.guests?.gst_number || '',
            guest_address: linkedBooking?.guests?.address || '',
            check_in_date: linkedBooking?.check_in_date || '',
            check_out_date: linkedBooking?.check_out_date || '',
            room_type: linkedBooking?.rooms?.type || '',
            room_rate: linkedBooking?.room_rate ?? 0,
            extra_pax: linkedBooking?.extra_pax ?? 0,
            extra_pax_rate: linkedBooking?.extra_pax_rate ?? 600,
        });
    };

    const handleUpdateInvoice = async () => {
        if (!editingInvoice) return;
        setPendingUpdate(true);

        const nextStatus = autoInvoiceStatus(Number(editingInvoice.paid_amount || 0), Number(editingInvoice.total_amount || 0));
        const resolvedStatus = editingInvoice.status || nextStatus;
        const resolvedIsPartial = editingInvoice.is_partial ?? (resolvedStatus === 'Partial');

        const { error } = await supabase
            .from('invoices')
            .update({
                invoice_number: editingInvoice.invoice_number,
                booking_id: editingInvoice.booking_id || null,
                guest_name: editingInvoice.guest_name,
                room_number: editingInvoice.room_number,
                invoice_date: editingInvoice.invoice_date,
                total_amount: editingInvoice.total_amount,
                paid_amount: editingInvoice.paid_amount,
                status: resolvedStatus,
                payment_mode: editingInvoice.payment_mode,
                gst_rate: editingInvoice.gst_rate,
                is_partial: resolvedIsPartial
            })
            .eq('id', editingInvoice.id);

        if (error) {
            console.error('Error updating invoice:', error);
            alert('Failed to update invoice');
        } else {
            if (editingInvoice.booking_id) {
                const { error: bookingUpdateError } = await supabase
                    .from('bookings')
                    .update({
                        source: editingInvoice.booking_source || 'Direct',
                        check_in_date: editingInvoice.check_in_date || null,
                        check_out_date: editingInvoice.check_out_date || null,
                        room_rate: editingInvoice.room_rate ?? null,
                        extra_pax: editingInvoice.extra_pax ?? 0,
                        extra_pax_rate: editingInvoice.extra_pax_rate ?? 600,
                    })
                    .eq('id', editingInvoice.booking_id);

                if (bookingUpdateError) {
                    console.error('Error updating booking type:', bookingUpdateError);
                    alert('Invoice updated, but failed to sync booking type.');
                }

                const linkedBooking = bookings.find((item) => item.id === editingInvoice.booking_id);
                if (linkedBooking?.guest_id) {
                    const { error: guestUpdateError } = await supabase
                        .from('guests')
                        .update({
                            email: editingInvoice.guest_email || null,
                            phone: editingInvoice.guest_phone || null,
                            company_name: editingInvoice.guest_company_name || null,
                            gst_number: editingInvoice.guest_gst_number || null,
                            address: editingInvoice.guest_address || null,
                        })
                        .eq('id', linkedBooking.guest_id);

                    if (guestUpdateError) {
                        console.error('Error updating guest invoice details:', guestUpdateError);
                        alert('Invoice updated, but failed to sync guest details.');
                    }
                }
            }
            setEditingInvoice(null);
            fetchInvoices();
            fetchBookings();
        }
        setPendingUpdate(false);
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
                        {fetchError && (
                            <div className={styles.fetchErrorBanner}>
                                {fetchError}
                            </div>
                        )}
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Invoice No</th>
                                    <th>Date</th>
                                    <th>Booking ID</th>
                                    <th>Booking Type</th>
                                    <th>Payment Mode</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className={styles.idCell}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={16} />
                                                <span className={styles.mono}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td>{inv.invoice_date}</td>
                                        <td className={styles.mono}>{inv.booking?.booking_number || 'N/A'}</td>
                                        <td>
                                            <span className={styles.badge}>{inv.booking?.source || 'Direct'}</span>
                                        </td>
                                        <td>{inv.payment_mode || 'N/A'}</td>
                                        <td className={styles.amount}>₹{inv.paid_amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[inv.status.toLowerCase()]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions} style={{ justifyContent: 'flex-end', width: '100%' }}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    aria-label={`Edit Invoice ${inv.invoice_number}`}
                                                    onClick={() => openEditInvoice(inv)}
                                                >
                                                    <Pencil size={18} />
                                                </button>
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

            {/* Edit Invoice Modal */}
            {editingInvoice && (
                <div className={styles.modalOverlay} onClick={() => setEditingInvoice(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Invoice #{editingInvoice.invoice_number}</h3>
                            <button onClick={() => setEditingInvoice(null)} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Created At</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.created_at ? new Date(editingInvoice.created_at).toLocaleString() : ''}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Invoice Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={editingInvoice.invoice_date || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, invoice_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Invoice Number</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.invoice_number}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, invoice_number: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Invoice ID</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.id}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Booking</label>
                                    <select
                                        className={styles.input}
                                        value={editingInvoice.booking_id || ''}
                                        onChange={(e) => {
                                            const bookingId = e.target.value || null;
                                            const linkedBooking = bookings.find((item) => item.id === bookingId);
                                            setEditingInvoice({
                                                ...editingInvoice,
                                                booking_id: bookingId,
                                                booking: linkedBooking
                                                    ? { booking_number: linkedBooking.booking_number, source: linkedBooking.source }
                                                    : undefined,
                                                booking_source: linkedBooking?.source || editingInvoice.booking_source || 'Direct',
                                                guest_name: linkedBooking?.guests ? `${linkedBooking.guests.first_name} ${linkedBooking.guests.last_name}` : editingInvoice.guest_name,
                                                guest_email: linkedBooking?.guests?.email || '',
                                                guest_phone: linkedBooking?.guests?.phone || '',
                                                guest_company_name: linkedBooking?.guests?.company_name || '',
                                                guest_gst_number: linkedBooking?.guests?.gst_number || '',
                                                guest_address: linkedBooking?.guests?.address || '',
                                                check_in_date: linkedBooking?.check_in_date || '',
                                                check_out_date: linkedBooking?.check_out_date || '',
                                                room_type: linkedBooking?.rooms?.type || '',
                                                room_rate: linkedBooking?.room_rate ?? 0,
                                                extra_pax: linkedBooking?.extra_pax ?? 0,
                                                extra_pax_rate: linkedBooking?.extra_pax_rate ?? 600,
                                                room_number: linkedBooking?.rooms?.room_number || editingInvoice.room_number,
                                            });
                                        }}
                                    >
                                        <option value="">No Linked Booking</option>
                                        {bookings.map((booking) => (
                                            <option key={booking.id} value={booking.id}>
                                                {booking.booking_number || booking.id} - {booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Guest'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Booking Type</label>
                                    <select
                                        className={styles.input}
                                        value={editingInvoice.booking_source || editingInvoice.booking?.source || 'Direct'}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, booking_source: e.target.value })}
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Complementary">Complementary</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="OTA">OTA</option>
                                        <option value="Direct">Direct</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Guest Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.guest_name || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.room_number || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, room_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Guest Email</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={editingInvoice.guest_email || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Guest Phone</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.guest_phone || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.guest_company_name || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_company_name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Guest GST Number</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.guest_gst_number || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_gst_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Guest Address</label>
                                <textarea
                                    className={styles.input}
                                    value={editingInvoice.guest_address || ''}
                                    onChange={(e) => setEditingInvoice({ ...editingInvoice, guest_address: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Check-in Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={editingInvoice.check_in_date || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, check_in_date: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Check-out Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={editingInvoice.check_out_date || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, check_out_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Room Type</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editingInvoice.room_type || ''}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Room Rate</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.room_rate || 0}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, room_rate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Extra Pax</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.extra_pax || 0}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, extra_pax: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Extra Pax Rate</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.extra_pax_rate || 600}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, extra_pax_rate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Total Amount</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.total_amount || 0}
                                        onChange={(e) => {
                                            const total = Number(e.target.value);
                                            const paid = Number(editingInvoice.paid_amount || 0);
                                            setEditingInvoice({
                                                ...editingInvoice,
                                                total_amount: total,
                                                status: autoInvoiceStatus(paid, total)
                                            });
                                        }}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Paid Amount</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.paid_amount || 0}
                                        onChange={(e) => {
                                            const paid = Number(e.target.value);
                                            const total = Number(editingInvoice.total_amount || 0);
                                            setEditingInvoice({
                                                ...editingInvoice,
                                                paid_amount: paid,
                                                status: autoInvoiceStatus(paid, total)
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>GST Rate (%)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={editingInvoice.gst_rate || 0}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, gst_rate: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>GST Amount</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={calculateInvoiceGstAmount(Number(editingInvoice.total_amount || 0), Number(editingInvoice.gst_rate || 0))}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Status</label>
                                    <select
                                        className={styles.input}
                                        value={editingInvoice.status}
                                        onChange={(e) => {
                                            const status = e.target.value as any;
                                            setEditingInvoice({
                                                ...editingInvoice,
                                                status,
                                                is_partial: status === 'Partial'
                                            });
                                        }}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Payment Mode</label>
                                    <select
                                        className={styles.input}
                                        value={editingInvoice.payment_mode || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, payment_mode: e.target.value as any })}
                                    >
                                        <option value="">Select Mode</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={!!editingInvoice.is_partial}
                                            onChange={(e) => setEditingInvoice({ ...editingInvoice, is_partial: e.target.checked })}
                                        />
                                        Mark as Partial Invoice
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Balance Due</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={Math.max(0, Number(editingInvoice.total_amount || 0) - Number(editingInvoice.paid_amount || 0))}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setEditingInvoice(null)}>Cancel</button>
                            <button className={styles.submitBtn} onClick={handleUpdateInvoice} disabled={pendingUpdate}>
                                {pendingUpdate ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
