'use client';

import { useState } from 'react';
import { X, Calendar, Search, User, CreditCard, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
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
            // 1. Create Guest
            // 1. Find or Create Guest
            let guestId = null;

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

                if (guestError) throw new Error(`Guest Error: ${guestError.message}`);
                guestId = newGuest.id;
            }

            // 2. Create Booking
            if (guestId) {
                const nights = Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
                const totalAmount = (selectedRoom.price_per_night * nights);

                const { data: bookingData, error: bookingError } = await supabase
                    .from('bookings')
                    .insert([{
                        guest_id: guestId,
                        room_id: selectedRoom.id,
                        check_in_date: dates.checkIn,
                        check_out_date: dates.checkOut,
                        status: 'Confirmed',
                        total_amount: totalAmount,
                        source: 'Direct'
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
                            total_amount: totalAmount
                        });
                    }
                } catch (emailErr) {
                    console.error('Failed to send email:', emailErr);
                    // Don't block success message
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

    return (
        <div className={styles.overlay}>
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                <div className={styles.header}>
                    <div>
                        <h2>New Booking</h2>
                        <span className={styles.stepIndicator}>Step {step} of 3</span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.content}>
                    <AnimatePresence mode='wait'>
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={checkAvailability}
                                className={styles.form}
                            >
                                <div className={styles.formGroup}>
                                    <label>Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        className={styles.input}
                                        value={dates.checkIn}
                                        onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Check-out Date</label>
                                    <input
                                        type="date"
                                        required
                                        className={styles.input}
                                        value={dates.checkOut}
                                        onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                                        min={dates.checkIn}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                    {loading ? 'Checking...' : 'Check Availability'}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.roomList}
                            >
                                {availableRooms.length === 0 ? (
                                    <div className={styles.emptyState}>No rooms available for these dates.</div>
                                ) : (
                                    availableRooms.map(room => (
                                        <div
                                            key={room.id}
                                            className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ''}`}
                                            onClick={() => setSelectedRoom(room)}
                                        >
                                            <div className={styles.roomInfo}>
                                                <strong>{room.room_number}</strong>
                                                <span className={styles.roomType}>{room.type}</span>
                                            </div>
                                            <div className={styles.roomPrice}>₹{room.price_per_night}</div>
                                            {selectedRoom?.id === room.id && <CheckCircle2 className={styles.checkIcon} size={18} />}
                                        </div>
                                    ))
                                )}
                                <div className={styles.actions}>
                                    <button onClick={() => setStep(1)} className={styles.secondaryBtn}>Back</button>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!selectedRoom}
                                        className={styles.primaryBtn}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.form}
                            >
                                <div className={styles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.input}
                                        value={guestDetails.firstName}
                                        onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
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
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={guestDetails.email}
                                        onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.summary}>
                                    <p><strong>Booking Summary:</strong></p>
                                    <p>Room {selectedRoom?.room_number} ({selectedRoom?.type})</p>
                                    <p>{dates.checkIn} to {dates.checkOut}</p>
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => setStep(2)} className={styles.secondaryBtn}>Back</button>
                                    <button onClick={createBooking} disabled={loading} className={styles.primaryBtn}>
                                        {loading ? 'Processing...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
