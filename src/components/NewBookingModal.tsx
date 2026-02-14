'use client';

import { useState } from 'react';
import { X, Calendar, Search, User, CreditCard, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import CalendarSelector from './CalendarSelector';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './NewBookingModal.module.css';
import { EmailService } from '@/lib/email-service';

interface NewBookingModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

type Room = Database['public']['Tables']['rooms']['Row'];

export default function NewBookingModal({ onClose, onSuccess }: NewBookingModalProps) {
    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

    // Search Guest
    const searchGuest = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const { data } = await supabase
            .from('guests')
            .select('*')
            .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone.ilike.%${term}%`)
            .limit(5);

        if (data) {
            setSearchResults(data);
            setShowResults(true);
        }
    };

    const selectGuest = (guest: any) => {
        setGuestDetails({
            firstName: guest.first_name,
            lastName: guest.last_name,
            email: guest.email || '',
            phone: guest.phone || ''
        });
        setSelectedGuestId(guest.id);
        setShowResults(false);
        setSearchTerm(`${guest.first_name} ${guest.last_name}`);
    };

    // Step 1: Check Availability
    const checkAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check overlapping bookings
            const { data: bookedRoomIds } = await supabase
                .from('bookings')
                .select('room_id')
                .or(`and(check_in_date.lte.${dates.checkOut},check_out_date.gte.${dates.checkIn})`);

            const excludeIds = bookedRoomIds?.map(b => b.room_id) || [];

            let query = supabase.from('rooms').select('*').eq('status', 'Clean');
            if (excludeIds.length > 0) {
                query = query.not('id', 'in', `(${excludeIds.join(',')})`);
            }

            query = query.order('room_number', { ascending: true });

            const { data: rooms, error: roomsError } = await query;
            if (roomsError) throw roomsError;

            if (rooms) setAvailableRooms(rooms);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error checking availability');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Create Booking
    const createBooking = async () => {
        if (!selectedRoom) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Create Guest or Use Selected
            let guestId = selectedGuestId;

            if (!guestId) {
                // Try finding by email
                if (guestDetails.email) {
                    const { data: existingGuest } = await supabase
                        .from('guests')
                        .select('id')
                        .eq('email', guestDetails.email)
                        .single();
                    if (existingGuest) guestId = existingGuest.id;
                }

                if (!guestId) {
                    const { data: newGuest, error: guestError } = await supabase
                        .from('guests')
                        .insert([{
                            first_name: guestDetails.firstName,
                            last_name: guestDetails.lastName,
                            email: guestDetails.email,
                            phone: guestDetails.phone
                        }])
                        .select()
                        .single();

                    if (guestError) throw new Error(`Guest Error: ${guestError?.message}`);
                    guestId = newGuest.id;
                }
            }

            // 2. Create Booking
            if (guestId) {
                const nights = Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
                const totalAmount = (selectedRoom.price_per_night * nights);

                // Fetch last booking ID to increment
                const { data: lastBooking } = await supabase
                    .from('bookings')
                    .select('booking_number')
                    .ilike('booking_number', 'AVBK%')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                let nextNumber = 1000;
                if (lastBooking?.booking_number) {
                    const match = lastBooking.booking_number.match(/AVBK(\d+)/i);
                    if (match && match[1]) {
                        nextNumber = parseInt(match[1], 10);
                    }
                }

                const bookingNumber = `AVBK${nextNumber + 1}`;

                const { data: bookingData, error: bookingError } = await supabase
                    .from('bookings')
                    .insert([{
                        guest_id: guestId,
                        room_id: selectedRoom.id,
                        check_in_date: dates.checkIn,
                        check_out_date: dates.checkOut,
                        status: 'Confirmed',
                        total_amount: totalAmount,
                        source: 'Direct',
                        booking_number: bookingNumber,
                        advance_amount: advanceAmount
                    }])
                    .select()
                    .single();

                if (bookingError) throw new Error(`Booking Error: ${bookingError.message}`);

                // Trigger Email
                try {
                    if (bookingData) {
                        await EmailService.triggerEmail('booking-confirmation', {
                            booking_id: bookingData.id,
                            guest_name: `${guestDetails.firstName} ${guestDetails.lastName}`,
                            email: guestDetails.email,
                            check_in_date: dates.checkIn,
                            check_out_date: dates.checkOut,
                            room_number: selectedRoom.room_number,
                            room_type: selectedRoom.type,
                            total_amount: totalAmount,
                            guests: '1',
                            advance_amount: advanceAmount.toString()
                        });
                    }
                } catch (emailErr) {
                    console.error('Failed to send email:', emailErr);
                }

                onSuccess();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create booking.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Calendar Change
    const handleCalendarChange = (start: Date | null, end: Date | null) => {
        const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setDates({
            checkIn: start ? formatDate(start) : '',
            checkOut: end ? formatDate(end) : ''
        });
    };

    const renderStepIndicator = () => (
        <div className={styles.stepContainer}>
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`${styles.stepDot} ${step === s ? styles.active : ''} ${step > s ? styles.completed : ''}`}
                />
            ))}
        </div>
    );

    return (
        <div className={styles.overlay}>
            <motion.div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h2>New Booking</h2>
                    </div>
                    {renderStepIndicator()}
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Body */}
                <div className={styles.content}>
                    <AnimatePresence mode='wait'>
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.step1Layout}
                            >
                                <div className={styles.dateCardsStack}>
                                    <div className={`${styles.dateCard} ${!dates.checkIn ? styles.activeInput : ''}`}>
                                        <div className={styles.dateLabel}>
                                            <Calendar size={18} />
                                            Check-in Date
                                        </div>
                                        <div className={styles.dateInputLarge}>
                                            {dates.checkIn || 'Select Date'}
                                        </div>
                                    </div>
                                    <div className={`${styles.dateCard} ${dates.checkIn && !dates.checkOut ? styles.activeInput : ''}`}>
                                        <div className={styles.dateLabel}>
                                            <Calendar size={18} />
                                            Check-out Date
                                        </div>
                                        <div className={styles.dateInputLarge}>
                                            {dates.checkOut || 'Select Date'}
                                        </div>
                                    </div>
                                </div>

                                <CalendarSelector
                                    startDate={dates.checkIn ? new Date(Number(dates.checkIn.split('-')[0]), Number(dates.checkIn.split('-')[1]) - 1, Number(dates.checkIn.split('-')[2])) : null}
                                    endDate={dates.checkOut ? new Date(Number(dates.checkOut.split('-')[0]), Number(dates.checkOut.split('-')[1]) - 1, Number(dates.checkOut.split('-')[2])) : null}
                                    onChange={handleCalendarChange}
                                />

                                {dates.checkIn && dates.checkOut && (
                                    <div className={styles.nightsDisplay}>
                                        <span style={{ fontSize: '1.2rem' }}>🌙</span>
                                        {Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} Nights Stay
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className={styles.roomList}>
                                    {availableRooms.length === 0 ? (
                                        <div className={styles.emptyState}>No rooms available for these dates.</div>
                                    ) : (
                                        availableRooms.map(room => (
                                            <div
                                                key={room.id}
                                                className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ''}`}
                                                onClick={() => setSelectedRoom(room)}
                                            >
                                                <div className={styles.roomHeader}>
                                                    <span className={styles.roomNumber}>{room.room_number}</span>
                                                    <span className={styles.roomTypeBadge}>{room.type}</span>
                                                </div>
                                                <div className={styles.roomPrice}>
                                                    ₹{room.price_per_night}<span>/night</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.splitLayout}
                            >
                                {/* Left Column: Guest Form */}
                                <div className={styles.leftCol}>
                                    <div className={styles.formGroup}>
                                        <label>Search Existing Guest</label>
                                        <div className={styles.searchWrapper}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                                <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', zIndex: 10 }} />
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    style={{ paddingLeft: '40px' }}
                                                    placeholder="Search by name or phone..."
                                                    value={searchTerm}
                                                    onChange={(e) => searchGuest(e.target.value)}
                                                />
                                            </div>
                                            {showResults && searchResults.length > 0 && (
                                                <div className={styles.searchResults}>
                                                    {searchResults.map(guest => (
                                                        <div
                                                            key={guest.id}
                                                            onClick={() => selectGuest(guest)}
                                                            className={styles.searchItem}
                                                        >
                                                            <div className={styles.searchItemName}>{guest.first_name} {guest.last_name}</div>
                                                            <div className={styles.searchItemMeta}>{guest.phone} • {guest.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.formGroup}>
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                required
                                                className={styles.input}
                                                value={guestDetails.firstName}
                                                onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                                                disabled={!!selectedGuestId}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                className={styles.input}
                                                value={guestDetails.lastName}
                                                onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                                                disabled={!!selectedGuestId}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            className={styles.input}
                                            value={guestDetails.phone}
                                            onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                            disabled={!!selectedGuestId}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={guestDetails.email}
                                            onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                            disabled={!!selectedGuestId}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Advance Payment (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={advanceAmount}
                                            onChange={e => setAdvanceAmount(Number(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Order Summary */}
                                <div className={styles.rightCol}>
                                    <div className={styles.bookingSummaryTitle}>Booking Summary</div>

                                    <div className={styles.summaryRow}>
                                        <span>Room</span>
                                        <strong>{selectedRoom?.room_number}</strong>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Type</span>
                                        <span>{selectedRoom?.type}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Dates</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div>{dates.checkIn}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>to</div>
                                            <div>{dates.checkOut}</div>
                                        </div>
                                    </div>

                                    <div className={styles.summaryRow} style={{ marginTop: '12px' }}>
                                        <span>Nights</span>
                                        <span>{Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)))}</span>
                                    </div>

                                    <div className={styles.summaryRow}>
                                        <span>Rate</span>
                                        <span>₹{selectedRoom?.price_per_night}/night</span>
                                    </div>

                                    <div className={styles.summaryRow + ' ' + styles.total}>
                                        <span>Total Amount</span>
                                        <span className={styles.summaryHighlight}>
                                            ₹{selectedRoom ? (selectedRoom.price_per_night * Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)))) : 0}
                                        </span>
                                    </div>

                                    {advanceAmount > 0 && (
                                        <div className={styles.summaryRow} style={{ color: '#4CAF50', fontWeight: 600 }}>
                                            <span>Advance Paid</span>
                                            <span>- ₹{advanceAmount}</span>
                                        </div>
                                    )}

                                    <div className={styles.summaryRow} style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                                        <span>Balance Due</span>
                                        <span>
                                            ₹{(selectedRoom ? (selectedRoom.price_per_night * Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)))) : 0) - advanceAmount}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className={styles.footer}>
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className={styles.secondaryBtn}>
                            Back
                        </button>
                    ) : (
                        <div /> /* Spacer */
                    )}

                    {step === 1 && (
                        <button onClick={checkAvailability} className={styles.primaryBtn}>
                            Check Availability <ArrowRight size={18} />
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedRoom}
                            className={styles.primaryBtn}
                        >
                            Continue to Guests <ArrowRight size={18} />
                        </button>
                    )}

                    {step === 3 && (
                        <button onClick={createBooking} disabled={loading} className={styles.primaryBtn}>
                            {loading ? 'Processing...' : 'Confirm Booking'} <CheckCircle2 size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
