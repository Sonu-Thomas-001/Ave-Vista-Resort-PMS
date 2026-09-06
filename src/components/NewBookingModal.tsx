'use client';

import { useState } from 'react';
import { X, Calendar, Search, CheckCircle2, AlertCircle, ArrowRight, Moon } from 'lucide-react';
import CalendarSelector from './CalendarSelector';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './NewBookingModal.module.css';
import { EmailService } from '@/lib/email-service';
import { getPricingUnit, getQuantityLabel, isFullResortType, isSpecialRoomType } from '@/lib/constants';
import CustomSelect from './ui/CustomSelect';

const BOOKING_TYPE_OPTIONS = [
    { value: 'Standard', label: 'Standard' },
    { value: 'Complementary', label: 'Complementary' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'OTA', label: 'OTA (Online Travel Agent)' },
    { value: 'Direct', label: 'Direct' },
];

interface NewBookingModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

type Room = Database['public']['Tables']['rooms']['Row'];

export default function NewBookingModal({ onClose, onSuccess }: NewBookingModalProps) {
    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [bookingType, setBookingType] = useState('Standard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [specialQuantities, setSpecialQuantities] = useState<Record<string, number>>({});
    const [roomRates, setRoomRates] = useState<Record<string, number>>({});
    const [extraPax, setExtraPax] = useState<number>(0); // number of extra members
    const [extraPaxRate, setExtraPaxRate] = useState<number>(600); // rate per extra person, default ₹600
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
    const [selectedGuestHasPhone, setSelectedGuestHasPhone] = useState(false);

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
        setSelectedGuestHasPhone(!!guest.phone);
        setShowResults(false);
        setSearchTerm(`${guest.first_name} ${guest.last_name}`);
    };

    const getNights = () => {
        if (!dates.checkIn || !dates.checkOut) return 1;
        return Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    };

    const toggleRoomSelection = (room: Room) => {
        const roomIsFullResort = isFullResortType(room.type);
        setSelectedRooms((current) => {
            const exists = current.some((selectedRoom) => selectedRoom.id === room.id);
            if (exists) {
                return current.filter((selectedRoom) => selectedRoom.id !== room.id);
            }
            if (roomIsFullResort) {
                return [room];
            }
            return [...current.filter((selectedRoom) => !isFullResortType(selectedRoom.type)), room];
        });

        setRoomRates((current) => (
            current[room.id] !== undefined
                ? current
                : { ...current, [room.id]: room.price_per_night }
        ));

        if (isSpecialRoomType(room.type)) {
            setSpecialQuantities((current) => (
                current[room.id] !== undefined
                    ? current
                    : { ...current, [room.id]: 1 }
            ));
        }
    };

    const getRoomRate = (room: Room) => roomRates[room.id] ?? room.price_per_night;
    const getRoomQuantity = (room: Room) => (
        isSpecialRoomType(room.type)
            ? (specialQuantities[room.id] ?? 1)
            : getNights()
    );
    const getRoomSubtotal = (room: Room) => getRoomRate(room) * getRoomQuantity(room);
    const roomSubtotal = selectedRooms.reduce((sum, room) => sum + getRoomSubtotal(room), 0);
    const extraPaxTotal = extraPax * extraPaxRate * getNights();
    const grandTotal = roomSubtotal + extraPaxTotal;

    // Step 1: Check Availability
    const checkAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check overlapping bookings
            const { data: overlappingBookings } = await supabase
                .from('bookings')
                .select('room_id, rooms(type)')
                .or(`and(check_in_date.lte.${dates.checkOut},check_out_date.gte.${dates.checkIn})`);

            const excludeIds = overlappingBookings?.map((booking: any) => booking.room_id) || [];
            const hasAnyBooking = (overlappingBookings?.length || 0) > 0;
            const hasFullResortBooking = overlappingBookings?.some((booking: any) => isFullResortType(booking.rooms?.type || '')) || false;

            let query = supabase.from('rooms').select('*').eq('status', 'Clean');
            if (excludeIds.length > 0) {
                query = query.not('id', 'in', `(${excludeIds.join(',')})`);
            }

            query = query.order('room_number', { ascending: true });

            const { data: rooms, error: roomsError } = await query;
            if (roomsError) throw roomsError;

            if (rooms) {
                const filteredRooms = rooms.filter((room) => {
                    if (hasFullResortBooking) return false;
                    if (isFullResortType(room.type)) return !hasAnyBooking;
                    return true;
                });
                setAvailableRooms(filteredRooms);
                setSelectedRooms([]);
                setRoomRates({});
                setSpecialQuantities({});
            }
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
        if (selectedRooms.length === 0) return;
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
                // Update existing guest phone if it was missing and added now
                if (selectedGuestId && !selectedGuestHasPhone && guestDetails.phone) {
                    const { error: updateError } = await supabase
                        .from('guests')
                        .update({ phone: guestDetails.phone })
                        .eq('id', selectedGuestId);

                    if (updateError) console.error('Error updating guest phone', updateError);
                }

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

                const bookingPayload = selectedRooms.map((room, index) => ({
                    guest_id: guestId,
                    room_id: room.id,
                    check_in_date: dates.checkIn,
                    check_out_date: dates.checkOut,
                    status: 'Confirmed' as const,
                    total_amount: getRoomSubtotal(room) + (index === 0 ? extraPaxTotal : 0),
                    source: bookingType,
                    booking_number: bookingNumber,
                    advance_amount: index === 0 ? advanceAmount : 0,
                    room_rate: getRoomRate(room),
                    extra_pax: index === 0 ? extraPax : 0,
                    extra_pax_rate: index === 0 ? extraPaxRate : 0
                }));

                const { data: bookingData, error: bookingError } = await supabase
                    .from('bookings')
                    .insert(bookingPayload)
                    .select();

                if (bookingError) throw new Error(`Booking Error: ${bookingError.message}`);
                const primaryBooking = bookingData?.[0];
                const roomNumbers = selectedRooms.map((room) => room.room_number).join(', ');
                const roomTypes = Array.from(new Set(selectedRooms.map((room) => room.type))).join(', ');

                // Create Invoice for Advance Payment
                if (primaryBooking && advanceAmount > 0) {
                    const invNum = `AVE-ADV-${String(1000 + Math.floor(Math.random() * 9000))}`;
                    const { error: invError } = await supabase
                        .from('invoices')
                        .insert([{
                            invoice_number: invNum,
                            booking_id: primaryBooking.id,
                            guest_name: `${guestDetails.firstName} ${guestDetails.lastName}`,
                            room_number: roomNumbers,
                            total_amount: grandTotal,
                            paid_amount: advanceAmount,
                            status: advanceAmount >= grandTotal ? 'Paid' : 'Partial',
                            is_partial: advanceAmount < grandTotal,
                            payment_mode: 'Cash', // Defaulting to Cash for now
                            gst_rate: 12
                        }]);

                    if (invError) {
                        console.error('Error creating advance invoice:', invError);
                        // Non-blocking error, just log it
                    }
                }

                // Trigger Email
                try {
                    if (primaryBooking) {
                        await EmailService.triggerEmail('booking-confirmation', {
                            booking_id: bookingNumber,
                            guest_name: `${guestDetails.firstName} ${guestDetails.lastName}`,
                            email: guestDetails.email,
                            booking_type: bookingType,
                            check_in_date: dates.checkIn,
                            check_out_date: dates.checkOut,
                            room_number: roomNumbers,
                            room_type: roomTypes,
                            total_amount: grandTotal,
                            guests: selectedRooms.length.toString(),
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

    const STEPS = [
        { num: 1, label: 'Dates' },
        { num: 2, label: 'Rooms' },
        { num: 3, label: 'Guest & Pay' },
    ];

    const renderStepIndicator = () => (
        <div className={styles.stepContainer}>
            {STEPS.map((s, idx) => (
                <div key={s.num} className={styles.stepItemWrapper}>
                    {idx > 0 && (
                        <div className={`${styles.stepConnector} ${step >= s.num ? styles.stepConnectorActive : ''}`} />
                    )}
                    <div className={`${styles.stepItem} ${step === s.num ? styles.stepItemActive : ''} ${step > s.num ? styles.stepItemCompleted : ''}`}>
                        <div className={styles.stepBadge}>
                            {step > s.num ? <CheckCircle2 size={13} /> : s.num}
                        </div>
                        <span className={styles.stepLabel}>{s.label}</span>
                    </div>
                </div>
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
                                        <Moon size={18} color="#D97706" />
                                        <span>{getNights()} Nights Stay</span>
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
                                <div style={{ marginBottom: '16px', color: '#64748B', fontWeight: 600 }}>
                                    Select one or more rooms. Selected: {selectedRooms.length}
                                </div>
                                <div className={styles.roomList}>
                                    {availableRooms.length === 0 ? (
                                        <div className={styles.emptyState}>No rooms available for these dates.</div>
                                    ) : (
                                        availableRooms.map(room => (
                                            <div
                                                key={room.id}
                                                className={`${styles.roomCard} ${selectedRooms.some((selectedRoom) => selectedRoom.id === room.id) ? styles.selected : ''}`}
                                                onClick={() => toggleRoomSelection(room)}
                                            >
                                                <div className={styles.roomHeader}>
                                                    <span className={styles.roomNumber}>{room.room_number}</span>
                                                    <span className={styles.roomTypeBadge}>{room.type}</span>
                                                </div>
                                                <div className={styles.roomPrice}>
                                                    Rs.{room.price_per_night}<span>{getPricingUnit(room.type)}</span>
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
                                            disabled={!!selectedGuestId && selectedGuestHasPhone}
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.formGroup}>
                                            <label>Extra Pax (Members)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className={styles.input}
                                                value={extraPax}
                                                onChange={e => setExtraPax(Math.max(0, Number(e.target.value)))}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Extra Pax Rate (₹/person)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className={styles.input}
                                                value={extraPaxRate}
                                                onChange={e => setExtraPaxRate(Math.max(0, Number(e.target.value)))}
                                                placeholder="600"
                                            />
                                        </div>
                                    </div>

                                    {selectedRooms.map((room) => (
                                        <div key={room.id} style={{ display: 'grid', gridTemplateColumns: isSpecialRoomType(room.type) ? '1fr 1fr' : '1fr', gap: '16px' }}>
                                            <div className={styles.formGroup}>
                                                <label>{room.room_number} Rate (Rs.{getPricingUnit(room.type)})</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className={styles.input}
                                                    value={getRoomRate(room)}
                                                    onChange={e => setRoomRates({ ...roomRates, [room.id]: Math.max(0, Number(e.target.value)) })}
                                                />
                                            </div>

                                            {isSpecialRoomType(room.type) && (
                                                <div className={styles.formGroup}>
                                                    <label>{room.room_number} {getQuantityLabel(room.type)}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className={styles.input}
                                                        value={specialQuantities[room.id] ?? 1}
                                                        onChange={e => setSpecialQuantities({ ...specialQuantities, [room.id]: Math.max(1, Number(e.target.value)) })}
                                                        placeholder="1"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className={styles.formGroup}>
                                        <label>Booking Type</label>
                                        <CustomSelect
                                            options={BOOKING_TYPE_OPTIONS}
                                            value={bookingType}
                                            onChange={(val) => setBookingType(val)}
                                            fullWidth
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Advance Payment (Rs.)</label>
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
                                        <span>Rooms</span>
                                        <strong>{selectedRooms.length}</strong>
                                    </div>
                                    <div className={styles.selectedRoomsList}>
                                        {selectedRooms.map((room) => (
                                            <span key={room.id} className={styles.selectedRoomChip}>
                                                {room.room_number}
                                            </span>
                                        ))}
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
                                        <span>{getNights()}</span>
                                    </div>

                                    {selectedRooms.map((room) => (
                                        <div key={room.id} className={styles.summaryLineItem}>
                                            <div className={styles.summaryLineMeta}>
                                                <strong>{room.room_number}</strong>
                                                <span>
                                                    Rs.{getRoomRate(room)}{getPricingUnit(room.type)}{isSpecialRoomType(room.type) ? ` x ${getRoomQuantity(room)} ${getQuantityLabel(room.type).toLowerCase()}` : ` x ${getNights()}N`}
                                                </span>
                                            </div>
                                            <span className={styles.summaryLineAmount}>Rs.{getRoomSubtotal(room)}</span>
                                        </div>
                                    ))}

                                    {extraPax > 0 && (
                                        <div className={styles.summaryRow} style={{ fontSize: '0.9rem' }}>
                                            <span>Extra Pax ({extraPax} x Rs.{extraPaxRate} x {getNights()}N)</span>
                                            <span>Rs.{extraPaxTotal}</span>
                                        </div>
                                    )}

                                    <div className={styles.summaryRow + ' ' + styles.total}>
                                        <span>Total Amount</span>
                                        <span className={styles.summaryHighlight}>Rs.{grandTotal}</span>
                                    </div>

                                    {advanceAmount > 0 && (
                                        <div className={styles.summaryRow} style={{ color: '#4CAF50', fontWeight: 600 }}>
                                            <span>Advance Paid</span>
                                            <span>- Rs.{advanceAmount}</span>
                                        </div>
                                    )}

                                    <div className={styles.summaryRow} style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                                        <span>Balance Due</span>
                                        <span>Rs.{grandTotal - advanceAmount}</span>
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
                        <button
                            onClick={checkAvailability}
                            disabled={!dates.checkIn || !dates.checkOut}
                            className={styles.primaryBtn}
                        >
                            Check Availability <ArrowRight size={18} />
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={() => setStep(3)}
                            disabled={selectedRooms.length === 0}
                            className={styles.primaryBtn}
                        >
                            Continue to Guests ({selectedRooms.length}) <ArrowRight size={18} />
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
