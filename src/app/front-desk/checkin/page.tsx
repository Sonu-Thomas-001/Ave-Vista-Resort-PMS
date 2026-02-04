'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Search, User, CreditCard, Key, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import { EmailService } from '@/lib/email-service';

const STEPS = [
    { id: 1, label: 'Find Booking', icon: Search },
    { id: 2, label: 'Guest Details', icon: User },
    { id: 3, label: 'Room Assign', icon: Key },
    { id: 4, label: 'Complete', icon: CheckCircle },
];

export default function CheckInPage() {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundBooking, setFoundBooking] = useState<any>(null);
    const [guestDetails, setGuestDetails] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSearch = async () => {
        setLoading(true);
        // Search by guest name or just fetch all confirmed for demo if query is empty
        let query = supabase
            .from('bookings')
            .select(`
                *,
                guests (*),
                rooms (*)
            `)
            .eq('status', 'Confirmed');

        const { data, error } = await query;
        if (data) {
            // Simple client side filter for now
            const match = data.find((b: any) =>
                b.guests.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.guests.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.id.includes(searchQuery)
            );

            if (match) {
                setFoundBooking(match);
                setGuestDetails(match.guests);
            } else {
                alert('No confirmed booking found.');
                setFoundBooking(null);
            }
        }
        setLoading(false);
    };

    const handleCompleteCheckIn = async () => {
        if (!foundBooking) return;

        // 1. Update Booking -> Checked In
        const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'Checked In', check_in_date: new Date().toISOString().split('T')[0] })
            .eq('id', foundBooking.id);

        if (bookingError) {
            alert('Error updating booking');
            return;
        }

        // 2. Update Room -> Occupied
        if (foundBooking.room_id) {
            await supabase
                .from('rooms')
                .update({ status: 'Occupied' })
                .eq('id', foundBooking.room_id);
        }

        // 3. Trigger Email
        try {
            await EmailService.triggerEmail('checkin-confirmation', {
                booking_id: foundBooking.id,
                guest_name: `${foundBooking.guests.first_name} ${foundBooking.guests.last_name}`,
                email: foundBooking.guests.email,
                room_number: foundBooking.rooms?.room_number || 'Assigned',
                check_in_date: new Date().toISOString().split('T')[0], // Today
                check_out_date: foundBooking.check_out_date,
            });
        } catch (e) {
            console.error('Email failed', e);
        }

        nextStep();
    };

    return (
        <>
            <Header title="Guest Check-in" />

            <div className={styles.container}>
                {/* Progress Stepper */}
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

                {/* Wizard Content */}
                <div className={styles.content}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Find Reservation</h2>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Enter Guest Name (e.g. John)"
                                    className={styles.input}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {/* Result */}
                            {foundBooking && (
                                <div className={styles.resultCard}>
                                    <div className={styles.resultHeader}>
                                        <span className={styles.bookingId}>#{foundBooking.id.slice(0, 8)}...</span>
                                        <span className={styles.tag}>{foundBooking.status}</span>
                                    </div>
                                    <div className={styles.resultDetails}>
                                        <h3>{foundBooking.guests.first_name} {foundBooking.guests.last_name}</h3>
                                        <p>Room: {foundBooking.rooms?.room_number || 'Unassigned'}</p>
                                        <p className={styles.dates}>{foundBooking.check_in_date} - {foundBooking.check_out_date}</p>
                                    </div>
                                    <button className={styles.selectBtn} onClick={nextStep}>
                                        Select & Proceed <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Guest Verification</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label>First Name</label>
                                    <input type="text" className={styles.input} defaultValue={guestDetails.first_name} readOnly />
                                </div>
                                <div className={styles.field}>
                                    <label>Last Name</label>
                                    <input type="text" className={styles.input} defaultValue={guestDetails.last_name} readOnly />
                                </div>
                                <div className={styles.field}>
                                    <label>Email</label>
                                    <input type="text" className={styles.input} defaultValue={guestDetails.email} readOnly />
                                </div>
                                <div className={styles.field}>
                                    <label>ID Proof Type</label>
                                    <select className={styles.input}>
                                        <option>Aadhar Card</option>
                                        <option>Passport</option>
                                        <option>Driving License</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label>ID Number</label>
                                    <input type="text" className={styles.input} placeholder="XXXX-XXXX-XXXX" />
                                </div>
                            </div>
                            <div className={styles.uploadArea}>
                                <span>Click to Upload Identity Document</span>
                            </div>
                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>Back</button>
                                <button onClick={nextStep} className={styles.primaryBtn}>Next: Assign Room</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Room Assignment</h2>
                            <div className={styles.roomSelection}>
                                <div className={styles.roomOption}>
                                    <h4>Reserved Type: Deluxe Hill View</h4>
                                    <p>Available Rooms:</p>
                                    <div className={styles.roomGrid}>
                                        <button className={`${styles.roomBtn} ${styles.selected}`}>
                                            {foundBooking?.rooms?.room_number || 'N/A'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>Back</button>
                                <button onClick={handleCompleteCheckIn} className={styles.primaryBtn}>Complete Check-in</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.stepContent}>
                            <div className={styles.successState}>
                                <CheckCircle size={64} color="#4CAF50" />
                                <h2>Check-in Successful!</h2>
                                <p>Room <strong>{foundBooking?.rooms?.room_number}</strong> has been assigned to <strong>{foundBooking?.guests?.first_name}</strong>.</p>

                                <div className={styles.keyHandover}>
                                    <Key size={24} />
                                    <span>Key Handover Logged</span>
                                </div>

                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => { setStep(1); setSearchQuery(''); setFoundBooking(null); }}
                                >
                                    Check-in New Guest
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
