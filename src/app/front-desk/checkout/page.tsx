'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
    Search,
    CreditCard,
    LogOut,
    CheckCircle,
    FileText,
    ArrowRight,
    ArrowLeft,
    Banknote,
    QrCode,
    Landmark,
    Printer,
    Sparkles,
    Calendar,
    Users,
    Key,
    CheckCircle2,
    Brush,
    Mail,
    RotateCcw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import { InvoicePreviewModal } from '@/components/ui/InvoicePreviewModal';
import styles from './page.module.css';
import { EmailService } from '@/lib/email-service';

const STEPS = [
    { id: 1, label: 'Select Room', icon: Search },
    { id: 2, label: 'Review Folio', icon: FileText },
    { id: 3, label: 'Payment', icon: CreditCard },
    { id: 4, label: 'Done & Invoice', icon: LogOut },
];

export default function CheckOutPage() {
    const [step, setStep] = useState(1);
    const [roomNum, setRoomNum] = useState('');
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [billDetails, setBillDetails] = useState({ total: 0, advance: 0, due: 0 });
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [loading, setLoading] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    // Read initial room query param from URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const initialRoom = params.get('room');
            if (initialRoom) {
                setRoomNum(initialRoom);
            }
        }
    }, []);

    // Fetch active bookings on load or search
    useEffect(() => {
        fetchActiveBookings();
    }, [roomNum]);

    const fetchActiveBookings = async () => {
        setLoading(true);
        try {
            const query = supabase
                .from('bookings')
                .select(`
                    *,
                    rooms (id, room_number, type, price_per_night),
                    guests (id, first_name, last_name, email, phone, company_name, gst_number, address, is_vip)
                `)
                .eq('status', 'Checked In');

            const { data, error } = await query;
            if (error) throw error;
            if (data) {
                const filtered = roomNum
                    ? data.filter(
                          (b: any) =>
                              b.rooms?.room_number?.toLowerCase().includes(roomNum.toLowerCase()) ||
                              b.guests?.first_name?.toLowerCase().includes(roomNum.toLowerCase()) ||
                              b.guests?.last_name?.toLowerCase().includes(roomNum.toLowerCase())
                      )
                    : data;
                setActiveBookings(filtered);
            }
        } catch (e) {
            console.error('Error fetching checked-in bookings:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBooking = async (booking: any) => {
        setSelectedBooking(booking);

        const total = booking.total_amount || 0;

        // Fetch previous advance payments (Invoices with this booking_id)
        const { data: invoices } = await supabase
            .from('invoices')
            .select('paid_amount')
            .eq('booking_id', booking.id);

        const invoiceAdvance = invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0;
        const totalAdvance = (booking.advance_amount || 0) + invoiceAdvance;
        const due = Math.max(0, total - totalAdvance);

        setBillDetails({ total, advance: totalAdvance, due });
        nextStep();
    };

    const handleConfirmPayment = async () => {
        if (!selectedBooking) return;

        setLoading(true);
        try {
            // 1. Create Final Invoice in Supabase
            const invNum = `AVE-INV-${String(1000 + Math.floor(Math.random() * 9000))}`;
            const newInvoice = {
                invoice_number: invNum,
                booking_id: selectedBooking.id,
                amount: billDetails.due,
                tax_amount: 0,
                payment_status: 'Paid',
                payment_method: paymentMode,
            };

            const { data: invoiceData, error: invError } = await supabase
                .from('invoices')
                .insert([newInvoice])
                .select()
                .single();

            if (invError) {
                console.error('Invoice creation error:', invError);
                alert(`Error creating invoice: ${invError.message || JSON.stringify(invError)}`);
                return;
            }

            const formattedInvoice = {
                ...invoiceData,
                total_amount: invoiceData.amount,
                paid_amount: invoiceData.amount,
                invoice_number: invoiceData.invoice_number,
                created_at: invoiceData.generated_at || new Date().toISOString(),
                payment_mode: invoiceData.payment_method
            };

            setGeneratedInvoice(formattedInvoice);

            // 2. Update Booking Status -> Checked Out
            await supabase
                .from('bookings')
                .update({ status: 'Checked Out' })
                .eq('id', selectedBooking.id);

            // 3. Update Room Status -> Dirty (Needs Turnover Cleaning)
            if (selectedBooking.room_id) {
                await supabase
                    .from('rooms')
                    .update({ status: 'Dirty' })
                    .eq('id', selectedBooking.room_id);
            }

            // 4. Trigger automated Invoice Email to Guest
            if (selectedBooking.guests?.email) {
                try {
                    await EmailService.triggerEmail('invoice-email', {
                        invoice_number: formattedInvoice.invoice_number,
                        invoice_date: new Date().toISOString().split('T')[0],
                        guest_name: selectedBooking.guests
                            ? `${selectedBooking.guests.first_name || ''} ${selectedBooking.guests.last_name || ''}`.trim()
                            : 'Guest',
                        email: selectedBooking.guests.email,
                        booking_type: selectedBooking.source || 'Direct',
                        room_number: selectedBooking.rooms?.room_number || 'N/A',
                        room_type: selectedBooking.rooms?.type || 'Standard',
                        amount: formattedInvoice.amount,
                        total_amount: formattedInvoice.amount,
                        payment_status: 'Paid',
                        payment_method: paymentMode,
                        payment_mode: paymentMode,
                        check_in_date: selectedBooking.check_in_date,
                        check_out_date: selectedBooking.check_out_date,
                        nights: Math.max(
                            1,
                            Math.ceil(
                                (new Date(selectedBooking.check_out_date).getTime() -
                                    new Date(selectedBooking.check_in_date).getTime()) /
                                    (1000 * 60 * 60 * 24)
                            )
                        ),
                        guests_count: (selectedBooking.adults || 1) + (selectedBooking.children || 0),
                        room_rate: selectedBooking.room_rate || selectedBooking.total_amount,
                        extra_pax: selectedBooking.extra_pax || 0,
                        extra_pax_rate: selectedBooking.extra_pax_rate || 600,
                        company_name: selectedBooking.guests?.company_name || '',
                        gst_number: selectedBooking.guests?.gst_number || '',
                        address: selectedBooking.guests?.address || '',
                        gst_rate: 12,
                        paid_amount: formattedInvoice.amount,
                        balance_due: 0,
                        status: 'Paid',
                        booking_id: selectedBooking.id
                    });
                } catch (e) {
                    console.error('Invoice email failed:', e);
                }
            }

            nextStep();
        } catch (error) {
            console.error('Check-out error:', error);
            alert('Failed to process check-out.');
        } finally {
            setLoading(false);
        }
    };

    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    };

    return (
        <>
            <Header title="Guest Check-Out & Settlement" />

            {/* Hidden Print Template */}
            <div className="print-only">
                <div className="print-area">
                    {generatedInvoice && selectedBooking && (
                        <InvoiceTemplate
                            invoice={generatedInvoice}
                            booking={selectedBooking}
                            guest={selectedBooking?.guests}
                            printRef={printRef}
                        />
                    )}
                </div>
            </div>

            <style jsx global>{`
                .print-only {
                    display: none;
                }
                @media print {
                    .print-only {
                        display: block !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .print-area,
                    .print-area * {
                        visibility: visible !important;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <div className={styles.container}>
                {/* Navigation & Header */}
                <div className={styles.topNav}>
                    <Link href="/front-desk" className={styles.backLink}>
                        <ArrowLeft size={16} /> Return to Front Desk
                    </Link>
                    <span className={styles.pageBadge}>
                        <Sparkles size={13} /> Folio Settlement Flow
                    </span>
                </div>

                {/* Stepper Header */}
                <div className={styles.stepper}>
                    {STEPS.map((s, idx) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        const StepIcon = isCompleted ? CheckCircle2 : s.icon;

                        return (
                            <div
                                key={s.id}
                                className={`${styles.step} ${isActive ? styles.activeStep : ''} ${
                                    isCompleted ? styles.completedStep : ''
                                }`}
                            >
                                <div className={styles.stepIcon}>
                                    <StepIcon size={18} />
                                </div>
                                <span className={styles.stepLabel}>{s.label}</span>
                                {idx < STEPS.length - 1 && (
                                    <div
                                        className={`${styles.connector} ${
                                            step > s.id ? styles.connectorActive : ''
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Card */}
                <div className={styles.contentCard}>
                    {/* STEP 1: Select Room / Active Folio */}
                    {step === 1 && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Select Room for Check-Out</h2>
                                    <p className={styles.stepSubtitle}>
                                        Pick an in-house guest reservation to review billing and process departure.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 1 of 4</span>
                            </div>

                            {/* Search Filter Box */}
                            <div className={styles.searchBox}>
                                <div className={styles.inputWrapper}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Filter by room number (e.g. A1) or guest name..."
                                        className={styles.input}
                                        value={roomNum}
                                        onChange={e => setRoomNum(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Active In-House Guest Cards List */}
                            <div className={styles.guestList}>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        Loading active in-house folios...
                                    </div>
                                ) : activeBookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                                        No active in-house guests found matching your criteria.
                                    </div>
                                ) : (
                                    activeBookings.map(b => (
                                        <div
                                            key={b.id}
                                            className={styles.guestCard}
                                            onClick={() => handleSelectBooking(b)}
                                        >
                                            <div className={styles.cardInfo}>
                                                <div className={styles.roomBig}>
                                                    <span>{b.rooms?.room_number || 'N/A'}</span>
                                                    <span className={styles.roomBigSub}>Room</span>
                                                </div>
                                                <div className={styles.guestMeta}>
                                                    <span className={styles.guestName}>
                                                        {b.guests?.first_name} {b.guests?.last_name}
                                                    </span>
                                                    <span className={styles.detail}>
                                                        {b.rooms?.type} • Arrived: {b.check_in_date} • Departs:{' '}
                                                        {b.check_out_date}
                                                    </span>
                                                    <span
                                                        className={styles.detail}
                                                        style={{ fontWeight: 600, color: '#0f172a' }}
                                                    >
                                                        Folio Total: ₹{Number(b.total_amount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <button className={styles.selectFolioBtn}>
                                                <span>Review Bill</span>
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Review Folio & Charges */}
                    {step === 2 && selectedBooking && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Review Folio & Billing</h2>
                                    <p className={styles.stepSubtitle}>
                                        Verify room charges, taxes, and advance payments before final settlement.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 2 of 4</span>
                            </div>

                            <div className={styles.billSummary}>
                                <div className={styles.folioHeader}>
                                    <div className={styles.folioGuest}>
                                        <span className={styles.folioGuestName}>
                                            {selectedBooking.guests?.first_name} {selectedBooking.guests?.last_name}
                                        </span>
                                        <span className={styles.folioRoom}>
                                            Room {selectedBooking.rooms?.room_number} ({selectedBooking.rooms?.type})
                                        </span>
                                    </div>
                                    <div className={styles.folioDates}>
                                        <div>
                                            Stay:{' '}
                                            {calculateNights(
                                                selectedBooking.check_in_date,
                                                selectedBooking.check_out_date
                                            )}{' '}
                                            Nights
                                        </div>
                                        <div>
                                            {selectedBooking.check_in_date} to {selectedBooking.check_out_date}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.billRow}>
                                    <span>Accommodation Base Charges</span>
                                    <span>₹{Number(billDetails.total).toLocaleString()}</span>
                                </div>

                                {selectedBooking.extra_pax > 0 && (
                                    <div className={styles.billRow}>
                                        <span>
                                            Extra Pax Charges ({selectedBooking.extra_pax} × ₹
                                            {selectedBooking.extra_pax_rate || 600})
                                        </span>
                                        <span>Included in Total</span>
                                    </div>
                                )}

                                <div className={styles.billRow}>
                                    <span>Goods & Services Tax (GST)</span>
                                    <span>Included in Rate</span>
                                </div>

                                <div className={`${styles.billRow} ${styles.totalRow}`}>
                                    <span>Total Folio Amount</span>
                                    <span>₹{Number(billDetails.total).toLocaleString()}</span>
                                </div>

                                {billDetails.advance > 0 && (
                                    <div className={styles.paidRow}>
                                        <span>Less: Advance Payment Received</span>
                                        <span>-₹{Number(billDetails.advance).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className={styles.dueRow}>
                                    <span>Net Outstanding Balance Due</span>
                                    <span>₹{Number(billDetails.due).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button onClick={nextStep} className={styles.primaryBtn}>
                                    <span>Proceed to Payment</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Multi-Mode Payment Settlement */}
                    {step === 3 && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Collect Settlement Payment</h2>
                                    <p className={styles.stepSubtitle}>
                                        Choose payment method and record collection to finalize departure.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 3 of 4</span>
                            </div>

                            <div className={styles.amountDisplay}>
                                <span className={styles.label}>Amount to Collect</span>
                                <div className={styles.amount}>₹{Number(billDetails.due).toLocaleString()}</div>
                                {billDetails.due === 0 && (
                                    <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Folio fully prepaid via advance!
                                    </span>
                                )}
                            </div>

                            <div className={styles.paymentMethods}>
                                {[
                                    { id: 'Cash', label: 'Cash', icon: Banknote },
                                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                                    { id: 'Card', label: 'Credit/Debit', icon: CreditCard },
                                    { id: 'Bank Transfer', label: 'Bank / Net', icon: Landmark }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`${styles.methodBtn} ${
                                            paymentMode === m.id ? styles.methodBtnSelected : ''
                                        }`}
                                        onClick={() => setPaymentMode(m.id)}
                                    >
                                        <div className={styles.methodIconBox}>
                                            <m.icon size={20} />
                                        </div>
                                        <span>{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    className={styles.primaryBtn}
                                    disabled={loading}
                                >
                                    <span>
                                        {loading
                                            ? 'Processing Settlement...'
                                            : `Confirm Settlement & Check Out (₹${Number(
                                                  billDetails.due
                                              ).toLocaleString()})`}
                                    </span>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Settlement Complete & Tax Invoice */}
                    {step === 4 && (
                        <div className={styles.successState}>
                            <div className={styles.successIconWrapper}>
                                <CheckCircle size={44} />
                            </div>

                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                                Check-Out & Folio Settled!
                            </h2>
                            <p style={{ color: '#64748b', maxWidth: 460 }}>
                                Guest departure has been successfully finalized. Tax invoice generated and room released
                                to Housekeeping.
                            </p>

                            <div className={styles.successCard}>
                                <div className={styles.invoiceNumBadge}>
                                    {generatedInvoice?.invoice_number || 'AVE-INV-SETTLED'}
                                </div>

                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                    Amount Settled: ₹{Number(billDetails.due).toLocaleString()} ({paymentMode})
                                </div>

                                <div className={styles.successChipsRow}>
                                    <div className={styles.turnoverChip}>
                                        <Brush size={15} />
                                        <span>
                                            Room {selectedBooking?.rooms?.room_number} Status → Marked Dirty for Turnover
                                        </span>
                                    </div>
                                    <div className={styles.emailChip}>
                                        <Mail size={15} />
                                        <span>Tax Invoice Dispatched to Guest Email</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.successActions}>
                                <button
                                    className={styles.printBtn}
                                    onClick={() => setShowInvoicePreview(true)}
                                    title="Preview and Download PDF or Print"
                                >
                                    <FileText size={16} /> View & Download PDF
                                </button>
                                <button className={styles.secondaryActionBtn} onClick={handlePrint}>
                                    <Printer size={16} /> Print Tax Invoice
                                </button>
                                <button
                                    className={styles.secondaryActionBtn}
                                    onClick={() => {
                                        setStep(1);
                                        setSelectedBooking(null);
                                        setGeneratedInvoice(null);
                                        fetchActiveBookings();
                                    }}
                                >
                                    <RotateCcw size={15} /> Next Check-Out
                                </button>
                                <Link href="/front-desk" className={styles.secondaryActionBtn}>
                                    Front Desk
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* High-Fidelity Invoice Preview & PDF Download Modal */}
            {showInvoicePreview && generatedInvoice && selectedBooking && (
                <InvoicePreviewModal
                    isOpen={showInvoicePreview}
                    onClose={() => setShowInvoicePreview(false)}
                    title={`Tax Invoice #${generatedInvoice.invoice_number}`}
                    subtitle={`Booking Ref: ${selectedBooking.booking_number || selectedBooking.id?.slice(0, 8).toUpperCase()} • ${selectedBooking.guests?.name || 'Guest Folio'}`}
                    filename={`AveVista_Invoice_${generatedInvoice.invoice_number}`}
                    format="a4"
                >
                    <InvoiceTemplate
                        invoice={generatedInvoice}
                        booking={selectedBooking}
                        guest={selectedBooking.guests}
                    />
                </InvoicePreviewModal>
            )}
        </>
    );
}
