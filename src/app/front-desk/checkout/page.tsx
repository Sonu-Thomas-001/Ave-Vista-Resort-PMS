'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Search, CreditCard, LogOut, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import styles from './page.module.css';
import { EmailService } from '@/lib/email-service';

const STEPS = [
    { id: 1, label: 'Select Room', icon: Search },
    { id: 2, label: 'Review Bill', icon: FileText },
    { id: 3, label: 'Payment', icon: CreditCard },
    { id: 4, label: 'Done', icon: LogOut },
];

export default function CheckOutPage() {
    const [step, setStep] = useState(1);
    const [roomNum, setRoomNum] = useState('');
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [billDetails, setBillDetails] = useState({ total: 0, advance: 0, due: 0 });
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState('Cash');

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    // Fetch active bookings on load or search
    useEffect(() => {
        fetchActiveBookings();
        // DEBUG: Check what columns exist in invoices
        const checkSchema = async () => {
            const { data } = await supabase.from('invoices').select('*').limit(1);
            if (data && data.length > 0) {
                alert('Existing Invoice Columns: ' + Object.keys(data[0]).join(', '));
            } else {
                alert('No invoices found to check schema. Trying to insert minimal.');
            }
        };
        // checkSchema(); // Commented out to not annoy user immediately, but useful if enabling
    }, [roomNum]);

    const fetchActiveBookings = async () => {
        let query = supabase
            .from('bookings')
            .select(`
                *,
                rooms (room_number),
                guests (first_name, last_name, email)
            `)
            .eq('status', 'Checked In');

        if (roomNum) {
            // This is a bit tricky with joins, easiest is to filter client side or use a better query
            // but for now let's just fetch all checked in and filter
        }

        const { data } = await query;
        if (data) {
            const filtered = roomNum
                ? data.filter((b: any) => b.rooms?.room_number.includes(roomNum))
                : data;
            setActiveBookings(filtered);
        }
    };

    const handleSelectBooking = async (booking: any) => {
        setSelectedBooking(booking);

        // Calculate Bill
        // 1. Total Amount from Booking
        const total = booking.total_amount;

        // 2. Fetch previous payments (Invoices with this booking_id)
        const { data: invoices } = await supabase
            .from('invoices')
            .select('paid_amount')
            .eq('booking_id', booking.id);

        const advance = invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0;
        const due = total - advance;

        setBillDetails({ total, advance, due });
        nextStep();
    };

    const handleConfirmPayment = async () => {
        if (!selectedBooking) return;

        // 1. Create Final Invoice
        const invNum = `INV-2026-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        const newInvoice = {
            invoice_number: invNum,
            booking_id: selectedBooking.id,
            // guest_name: `${selectedBooking.guests.first_name} ${selectedBooking.guests.last_name}`, // Schema mismatch
            // room_number: selectedBooking.rooms.room_number, // Schema mismatch
            amount: billDetails.due,
            tax_amount: 0, // Assuming handled in total or calculated
            payment_status: 'Paid',
            // generated_at: new Date().toISOString(), // DB likely handles default
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
            total_amount: invoiceData.amount, // Map back for template
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

        // 3. Update Room Status -> Dirty
        await supabase
            .from('rooms')
            .update({ status: 'Dirty' })
            .eq('id', selectedBooking.room_id);

        // 4. Trigger Auto-Invoice Email
        if (selectedBooking.guests?.email) {
            try {
                await EmailService.triggerEmail('invoice-email', {
                    invoice_number: formattedInvoice.invoice_number,
                    guest_name: selectedBooking.guests ? `${selectedBooking.guests.first_name} ${selectedBooking.guests.last_name}` : 'Guest',
                    email: selectedBooking.guests.email,
                    room_number: selectedBooking.rooms?.room_number || 'N/A',
                    amount: formattedInvoice.amount,
                    payment_status: 'Paid',
                    payment_method: paymentMode
                });
            } catch (e) {
                console.error('Invoice email failed', e);
            }
        } else {
            console.warn('Skipping email invoice: No guest email found.');
            // Optional: alert('Invoice generated, but no email sent (Guest email missing).');
        }

        nextStep();
    };

    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Simple window print which will use the media query in InvoiceTemplate to hide other content
        window.print();
    };

    return (
        <>
            <Header title="Guest Check-out" />

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
                        display: block;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
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
                <div className={styles.stepper}>
                    {STEPS.map((s, i) => (
                        <div key={s.id} className={`${styles.step} ${step >= s.id ? styles.activeStep : ''}`}>
                            <div className={styles.stepIcon}>
                                <s.icon size={20} />
                            </div>
                            <span className={styles.stepLabel}>{s.label}</span>
                            {i < STEPS.length - 1 && <div className={styles.connector}></div>}
                        </div>
                    ))}
                </div>

                <div className={styles.content}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Select Room for Checkout</h2>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Room Number (e.g. 101)"
                                    className={styles.input}
                                    value={roomNum}
                                    onChange={(e) => setRoomNum(e.target.value)}
                                // ... existing props
                                />
                                <button className={styles.searchBtn} onClick={() => fetchActiveBookings()}>Find</button>
                            </div>

                            <div className={styles.guestsList}>
                                {activeBookings.map((booking) => (
                                    <div key={booking.id} className={styles.guestCard} onClick={() => handleSelectBooking(booking)}>
                                        <div className={styles.cardInfo}>
                                            <span className={styles.roomBig}>{booking.rooms.room_number}</span>
                                            <div>
                                                <span className={styles.guestName}>{booking.guests.first_name} {booking.guests.last_name}</span>
                                                <span className={styles.detail}>Checked In: {booking.check_in_date}</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className={styles.arrow} />
                                    </div>
                                ))}
                                {activeBookings.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No active check-ins found.</p>}
                            </div>
                        </div>
                    )}

                    {/* ... Step 2 & 3 ... */}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            {/* ... Bill Review content ... */}
                            <h2 className={styles.stepTitle}>Bill Review</h2>
                            <div className={styles.billSummary}>
                                <div className={styles.billRow}>
                                    <span>Room Charges ({selectedBooking?.rooms?.room_number})</span>
                                    <span>₹{billDetails.total.toLocaleString()}</span>
                                </div>
                                <div className={styles.billRow}>
                                    <span>Taxes & Fees</span>
                                    <span>₹0</span>
                                </div>
                                <div className={`${styles.billRow} ${styles.totalRow}`}>
                                    <span>Total Booking Value</span>
                                    <span>₹{billDetails.total.toLocaleString()}</span>
                                </div>
                                <div className={styles.paidRow}>
                                    <span>Less: Advance Paid</span>
                                    <span>- ₹{billDetails.advance.toLocaleString()}</span>
                                </div>
                                <div className={styles.dueRow}>
                                    <span>Balance Due</span>
                                    <span>₹{billDetails.due.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>Back</button>
                                <button onClick={nextStep} className={styles.primaryBtn}>Proceed to Payment</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Settle Payment</h2>
                            <div className={styles.amountDisplay}>
                                <span className={styles.label}>To Collect</span>
                                <span className={styles.amount}>₹{billDetails.due.toLocaleString()}</span>
                            </div>

                            <div className={styles.paymentMethods}>
                                <button
                                    className={`${styles.methodBtn} ${paymentMode === 'Card' ? styles.selected : ''}`}
                                    onClick={() => setPaymentMode('Card')}
                                >
                                    Credit Card
                                </button>
                                <button
                                    className={`${styles.methodBtn} ${paymentMode === 'UPI' ? styles.selected : ''}`}
                                    onClick={() => setPaymentMode('UPI')}
                                >
                                    UPI / QR
                                </button>
                                <button
                                    className={`${styles.methodBtn} ${paymentMode === 'Cash' ? styles.selected : ''}`}
                                    onClick={() => setPaymentMode('Cash')}
                                >
                                    Cash
                                </button>
                            </div>

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>Back</button>
                                <button onClick={handleConfirmPayment} className={styles.primaryBtn}>Confirm Payment</button>
                            </div>
                        </div>
                    )}


                    {step === 4 && (
                        <div className={styles.stepContent}>
                            <div className={styles.successState}>
                                <CheckCircle size={64} color="#4CAF50" />
                                <h2>Check-out Complete</h2>
                                <p>Invoice #{generatedInvoice?.invoice_number} generated successfully.</p>

                                <div className={styles.shareOptions}>
                                    <button className={styles.shareBtn} onClick={async () => {
                                        let targetEmail = selectedBooking?.guests?.email;

                                        if (!targetEmail) {
                                            const manualEmail = window.prompt('Guest email not found. Please enter an email address to send the invoice to:');
                                            if (!manualEmail) return; // User cancelled or entered empty
                                            targetEmail = manualEmail;
                                        }

                                        try {
                                            await EmailService.triggerEmail('invoice-email', {
                                                invoice_number: generatedInvoice?.invoice_number,
                                                guest_name: selectedBooking.guests ? `${selectedBooking.guests.first_name} ${selectedBooking.guests.last_name}` : 'Guest',
                                                email: targetEmail,
                                                room_number: selectedBooking.rooms?.room_number || 'N/A',
                                                amount: generatedInvoice?.amount,
                                                payment_status: 'Paid'
                                            });
                                            alert(`Invoice sent to ${targetEmail}!`);
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to send email');
                                        }
                                    }}>Email Invoice</button>
                                    <button className={styles.shareBtn}>WhatsApp</button>
                                    <button className={styles.shareBtn} onClick={handlePrint}>Print Invoice</button>
                                </div>

                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => { setStep(1); setRoomNum(''); }}
                                    style={{ marginTop: 20 }}
                                >
                                    Back to Front Desk
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
