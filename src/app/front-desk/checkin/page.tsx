'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
    Search,
    User,
    Key,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Sparkles,
    Calendar,
    Users,
    Mail,
    Phone,
    BedDouble,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { EmailService } from '@/lib/email-service';

const STEPS = [
    { id: 1, label: 'Find Reservation', icon: Search },
    { id: 2, label: 'Guest Verification', icon: ShieldCheck },
    { id: 3, label: 'Room Assignment', icon: Key },
    { id: 4, label: 'Check-In Done', icon: CheckCircle },
];

export default function CheckInPage() {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundBooking, setFoundBooking] = useState<any>(null);
    const [guestDetails, setGuestDetails] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // List of today's pending arrivals to easily pick
    const [pendingArrivals, setPendingArrivals] = useState<any[]>([]);
    // List of clean/available rooms if staff wants to switch room
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    // Fetch confirmed bookings arriving today or pending
    const fetchPendingArrivals = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from('bookings')
                .select(`
                    *,
                    guests (*),
                    rooms (*)
                `)
                .eq('status', 'Confirmed')
                .lte('check_in_date', today)
                .order('check_in_date', { ascending: true });

            if (data) setPendingArrivals(data);
        } catch (e) {
            console.error('Error fetching pending arrivals:', e);
        }
    };

    // Fetch clean rooms for room assignment step
    const fetchAvailableRooms = async () => {
        try {
            const { data } = await supabase
                .from('rooms')
                .select('*')
                .eq('status', 'Clean')
                .order('room_number', { ascending: true });

            if (data) setAvailableRooms(data);
        } catch (e) {
            console.error('Error fetching available rooms:', e);
        }
    };

    const performSearch = async (term: string) => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('bookings')
                .select(`
                    *,
                    guests (*),
                    rooms (*)
                `)
                .eq('status', 'Confirmed');

            if (data) {
                const match = data.find((b: any) =>
                    b.guests?.first_name?.toLowerCase().includes(term.toLowerCase()) ||
                    b.guests?.last_name?.toLowerCase().includes(term.toLowerCase()) ||
                    b.booking_number?.toLowerCase().includes(term.toLowerCase()) ||
                    b.id?.includes(term) ||
                    (b.guests?.phone && b.guests.phone.includes(term))
                );

                if (match) {
                    selectBooking(match);
                } else {
                    setFoundBooking(null);
                }
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectBooking = (booking: any) => {
        setFoundBooking(booking);
        setGuestDetails(booking.guests || {});
        setSelectedRoomId(booking.room_id || '');
    };

    useEffect(() => {
        fetchPendingArrivals();
        fetchAvailableRooms();

        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const initialSearch = params.get('search');
            if (initialSearch) {
                setSearchQuery(initialSearch);
                performSearch(initialSearch);
            }
        }
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        await performSearch(searchQuery);
    };

    const handleCompleteCheckIn = async () => {
        if (!foundBooking) return;

        setLoading(true);
        try {
            // 1. Update Guest ID Proof Details
            if (foundBooking.guests) {
                await supabase
                    .from('guests')
                    .update({
                        id_proof_type: guestDetails.id_proof_type || 'Aadhar Card',
                        id_proof_number: guestDetails.id_proof_number || ''
                    })
                    .eq('id', foundBooking.guests.id);
            }

            // 2. Determine target room ID
            const targetRoomId = selectedRoomId || foundBooking.room_id;

            // 3. Update Booking -> Checked In
            const { error: bookingError } = await supabase
                .from('bookings')
                .update({
                    status: 'Checked In',
                    room_id: targetRoomId,
                    check_in_date: new Date().toISOString().split('T')[0]
                })
                .eq('id', foundBooking.id);

            if (bookingError) throw bookingError;

            // 4. Update Room Status -> Occupied
            if (targetRoomId) {
                await supabase
                    .from('rooms')
                    .update({ status: 'Occupied' })
                    .eq('id', targetRoomId);
            }

            // 5. Trigger automated welcome email
            try {
                await EmailService.triggerEmail('checkin-confirmation', {
                    booking_id: foundBooking.id,
                    guest_name: `${foundBooking.guests?.first_name || ''} ${foundBooking.guests?.last_name || ''}`,
                    email: foundBooking.guests?.email,
                    room_number: foundBooking.rooms?.room_number || 'Assigned',
                    check_in_date: new Date().toISOString().split('T')[0],
                    check_out_date: foundBooking.check_out_date,
                });
            } catch (e) {
                console.error('Email trigger error:', e);
            }

            nextStep();
        } catch (error) {
            console.error('Check-in error:', error);
            alert('Failed to complete check-in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="Guest Check-In Wizard" />

            <div className={styles.container}>
                {/* Navigation & Header */}
                <div className={styles.topNav}>
                    <Link href="/front-desk" className={styles.backLink}>
                        <ArrowLeft size={16} /> Return to Front Desk
                    </Link>
                    <span className={styles.pageBadge}>
                        <Sparkles size={13} /> Express Arrival Flow
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
                    {/* STEP 1: Find Booking */}
                    {step === 1 && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Locate Reservation</h2>
                                    <p className={styles.stepSubtitle}>
                                        Search confirmed bookings by guest name, phone, or booking number.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 1 of 4</span>
                            </div>

                            {/* Search Box */}
                            <div className={styles.searchBox}>
                                <div className={styles.inputWrapper}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Enter guest name (e.g. John), phone, or booking #..."
                                        className={styles.input}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {/* Today's Pending Arrivals Quick Picker */}
                            {pendingArrivals.length > 0 && (
                                <div className={styles.quickPickSection}>
                                    <div className={styles.quickPickLabel}>
                                        <Calendar size={13} />
                                        <span>Today's Expected Arrivals ({pendingArrivals.length})</span>
                                    </div>
                                    <div className={styles.arrivalsList}>
                                        {pendingArrivals.map(b => (
                                            <div
                                                key={b.id}
                                                className={`${styles.arrivalItem} ${
                                                    foundBooking?.id === b.id ? styles.arrivalItemActive : ''
                                                }`}
                                                onClick={() => selectBooking(b)}
                                            >
                                                <div className={styles.arrivalGuest}>
                                                    <span className={styles.arrivalGuestName}>
                                                        {b.guests?.first_name} {b.guests?.last_name}
                                                    </span>
                                                    <span className={styles.arrivalRoomMeta}>
                                                        Room {b.rooms?.room_number || 'Unassigned'} • {b.rooms?.type} •{' '}
                                                        {b.check_in_date} to {b.check_out_date}
                                                    </span>
                                                </div>
                                                <div className={styles.arrivalAction}>
                                                    <span>Select</span>
                                                    <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Result Card */}
                            {foundBooking && (
                                <div className={styles.resultCard}>
                                    <div className={styles.resultHeader}>
                                        <span className={styles.bookingId}>
                                            #{foundBooking.booking_number || foundBooking.id.slice(0, 8)}
                                        </span>
                                        <span className={styles.tag}>{foundBooking.status}</span>
                                    </div>

                                    <div className={styles.resultGrid}>
                                        <div className={styles.resultCell}>
                                            <span className={styles.resultLabel}>Guest Name</span>
                                            <span className={styles.resultVal}>
                                                {foundBooking.guests?.first_name} {foundBooking.guests?.last_name}
                                            </span>
                                        </div>
                                        <div className={styles.resultCell}>
                                            <span className={styles.resultLabel}>Assigned Room</span>
                                            <span className={styles.resultVal}>
                                                Room {foundBooking.rooms?.room_number || 'Pending'} ({foundBooking.rooms?.type})
                                            </span>
                                        </div>
                                        <div className={styles.resultCell}>
                                            <span className={styles.resultLabel}>Stay Period</span>
                                            <span className={styles.resultVal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                {foundBooking.check_in_date}
                                                <ArrowRight size={12} style={{ color: '#94a3b8' }} />
                                                {foundBooking.check_out_date}
                                            </span>
                                        </div>
                                        <div className={styles.resultCell}>
                                            <span className={styles.resultLabel}>Total Amount</span>
                                            <span className={styles.resultVal}>
                                                ₹{Number(foundBooking.total_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button className={styles.selectBtn} onClick={nextStep}>
                                        <span>Proceed to Guest ID Verification</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Guest ID Verification */}
                    {step === 2 && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Guest ID Verification</h2>
                                    <p className={styles.stepSubtitle}>
                                        Verify guest contact information and record mandatory government ID proof.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 2 of 4</span>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        className={`${styles.formInput} ${styles.formInputReadOnly}`}
                                        value={guestDetails.first_name || ''}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        className={`${styles.formInput} ${styles.formInputReadOnly}`}
                                        value={guestDetails.last_name || ''}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        className={`${styles.formInput} ${styles.formInputReadOnly}`}
                                        value={guestDetails.email || 'No email provided'}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        className={`${styles.formInput} ${styles.formInputReadOnly}`}
                                        value={guestDetails.phone || 'No phone on file'}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Government ID Proof Type</label>
                                    <select
                                        className={styles.formInput}
                                        value={guestDetails.id_proof_type || 'Aadhar Card'}
                                        onChange={e =>
                                            setGuestDetails({ ...guestDetails, id_proof_type: e.target.value })
                                        }
                                    >
                                        <option value="Aadhar Card">Aadhaar Card</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Driving License">Driving License</option>
                                        <option value="Voter ID">Voter ID</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label>ID Document Number</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="e.g. 5432-8765-9876"
                                        value={guestDetails.id_proof_number || ''}
                                        onChange={e =>
                                            setGuestDetails({ ...guestDetails, id_proof_number: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button onClick={nextStep} className={styles.primaryBtn}>
                                    <span>Next: Room Allocation</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Room Allocation */}
                    {step === 3 && (
                        <div>
                            <div className={styles.stepHeader}>
                                <div>
                                    <h2 className={styles.stepTitle}>Room Assignment & Keys</h2>
                                    <p className={styles.stepSubtitle}>
                                        Confirm designated room or assign an alternate sanitized room.
                                    </p>
                                </div>
                                <span className={styles.stepCounter}>Step 3 of 4</span>
                            </div>

                            <div className={styles.roomSummaryBox}>
                                <div className={styles.roomTitleRow}>
                                    <span className={styles.roomReservedType}>
                                        Reserved Category: {foundBooking?.rooms?.type || 'Standard Room'}
                                    </span>
                                    <span className={styles.assignedBadge}>
                                        <CheckCircle2 size={13} /> Sanitized & Ready
                                    </span>
                                </div>
                                <div className={styles.roomSpecs}>
                                    <span>
                                        <BedDouble size={14} /> Room {foundBooking?.rooms?.room_number || 'Unassigned'}
                                    </span>
                                    <span>
                                        <Users size={14} /> Max {foundBooking?.rooms?.max_occupancy || 2} Guests
                                    </span>
                                </div>
                            </div>

                            {/* Available Clean Rooms Picker */}
                            {availableRooms.length > 0 && (
                                <div>
                                    <label
                                        style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            color: '#475569',
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            marginBottom: 8
                                        }}
                                    >
                                        Ready & Vacant Rooms
                                    </label>
                                    <div className={styles.roomGrid}>
                                        {availableRooms.map(r => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                className={`${styles.roomBtn} ${
                                                    selectedRoomId === r.id ||
                                                    (!selectedRoomId && foundBooking?.room_id === r.id)
                                                        ? styles.roomBtnSelected
                                                        : ''
                                                }`}
                                                onClick={() => setSelectedRoomId(r.id)}
                                            >
                                                <span className={styles.roomBtnNum}>Room {r.room_number}</span>
                                                <span className={styles.roomBtnType}>{r.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button onClick={prevStep} className={styles.backBtn}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={handleCompleteCheckIn}
                                    className={styles.primaryBtn}
                                    disabled={loading}
                                >
                                    <span>{loading ? 'Completing Check-In...' : 'Confirm & Complete Check-In'}</span>
                                    <Key size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Check-In Complete */}
                    {step === 4 && (
                        <div className={styles.successState}>
                            <div className={styles.successIconWrapper}>
                                <CheckCircle size={44} />
                            </div>

                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                                Check-In Successfully Completed!
                            </h2>
                            <p style={{ color: '#64748b', maxWidth: 460 }}>
                                Guest arrival is finalized. The room status is now active as In-House Occupied.
                            </p>

                            <div className={styles.successCard}>
                                <div className={styles.successRoomBanner}>
                                    <Key size={20} />
                                    <span>Room {foundBooking?.rooms?.room_number} Assigned</span>
                                </div>
                                <div style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                                    Primary Guest: {foundBooking?.guests?.first_name} {foundBooking?.guests?.last_name}
                                </div>
                                <div className={styles.keyHandover}>
                                    <ShieldCheck size={16} />
                                    <span>Room Keycard Issued & Welcome Email Sent</span>
                                </div>
                            </div>

                            <div className={styles.successBtnRow}>
                                <button
                                    className={styles.primaryBtn}
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        setStep(1);
                                        setSearchQuery('');
                                        setFoundBooking(null);
                                        fetchPendingArrivals();
                                    }}
                                >
                                    <RotateCcw size={16} /> Check-In Next Guest
                                </button>
                                <Link href="/front-desk" className={styles.secondaryActionBtn}>
                                    Back to Front Desk
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
