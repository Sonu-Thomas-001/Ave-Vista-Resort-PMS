'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    AlertCircle,
    Save,
    X,
    User,
    Calendar,
    CreditCard,
    Bookmark,
    Phone,
    Mail,
    Moon,
    Key,
    Sparkles,
    CheckCircle2,
    Calculator,
    Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { getPricingUnit, isFullResortType } from '@/lib/constants';
import CustomSelect from './ui/CustomSelect';
import DatePicker from './ui/DatePicker';
import styles from './EditBookingModal.module.css';

const BOOKING_STATUS_OPTIONS = [
    { value: 'Confirmed', label: 'Confirmed', color: '#0284c7' },
    { value: 'Checked In', label: 'Checked In', color: '#10b981' },
    { value: 'Checked Out', label: 'Checked Out', color: '#64748b' },
    { value: 'Cancelled', label: 'Cancelled', color: '#ef4444' },
];

const BOOKING_TYPE_OPTIONS = [
    { value: 'Direct', label: 'Direct Reservation' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Corporate', label: 'Corporate / Business' },
    { value: 'OTA', label: 'Online Travel Agency (OTA)' },
    { value: 'Complementary', label: 'Complementary / VIP' },
];

type Room = Database['public']['Tables']['rooms']['Row'];

interface EditBookingModalProps {
    booking: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditBookingModal({ booking, onClose, onSuccess }: EditBookingModalProps) {
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: booking.guests?.first_name || '',
        lastName: booking.guests?.last_name || '',
        email: booking.guests?.email || '',
        phone: booking.guests?.phone || '',
        roomId: booking.room_id || '',
        checkIn: booking.check_in_date || '',
        checkOut: booking.check_out_date || '',
        bookingType: booking.source || 'Direct',
        status: booking.status || 'Confirmed',
        roomRate: booking.room_rate ?? booking.total_amount ?? 0,
        extraPax: booking.extra_pax ?? 0,
        extraPaxRate: booking.extra_pax_rate ?? 600,
        totalAmount: booking.total_amount ?? 0,
        advanceAmount: booking.advance_amount ?? 0,
    });

    // Calculate nights
    const nights = useMemo(() => {
        if (!formData.checkIn || !formData.checkOut) return 1;
        try {
            const inDate = new Date(formData.checkIn);
            const outDate = new Date(formData.checkOut);
            const diff = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
            return diff > 0 ? diff : 1;
        } catch {
            return 1;
        }
    }, [formData.checkIn, formData.checkOut]);

    // Live calculations
    const calculatedRoomCharges = (Number(formData.roomRate) || 0) * nights;
    const calculatedExtraCharges = (Number(formData.extraPax) || 0) * (Number(formData.extraPaxRate) || 0) * nights;
    const calculatedTotal = calculatedRoomCharges + calculatedExtraCharges;
    const balanceDue = Math.max(0, (Number(formData.totalAmount) || 0) - (Number(formData.advanceAmount) || 0));

    const selectedRoom = useMemo(
        () => availableRooms.find((room) => room.id === formData.roomId) || booking.rooms,
        [availableRooms, formData.roomId, booking.rooms]
    );

    const roomOptions = useMemo(() => {
        const list = availableRooms.map((room) => ({
            value: room.id,
            label: `Room ${room.room_number} — ${room.type}`,
            sublabel: `₹${room.price_per_night?.toLocaleString('en-IN')}/night`,
        }));
        if (formData.roomId && !list.some((r) => r.value === formData.roomId) && booking.rooms) {
            list.unshift({
                value: booking.rooms.id || formData.roomId,
                label: `Room ${booking.rooms.room_number} — ${booking.rooms.type} (Currently Assigned)`,
                sublabel: `Current Room`,
            });
        }
        return list;
    }, [availableRooms, formData.roomId, booking.rooms]);

    useEffect(() => {
        if (!formData.checkIn || !formData.checkOut) return;
        fetchAvailableRooms();
    }, [formData.checkIn, formData.checkOut]);

    const fetchAvailableRooms = async () => {
        setLoadingRooms(true);
        setError(null);

        try {
            const { data: overlappingBookings, error: overlapError } = await supabase
                .from('bookings')
                .select('id, room_id, rooms(type)')
                .neq('id', booking.id)
                .or(`and(check_in_date.lte.${formData.checkOut},check_out_date.gte.${formData.checkIn})`);

            if (overlapError) throw overlapError;

            const excludeIds = overlappingBookings?.map((item: any) => item.room_id) || [];
            const hasAnyBooking = (overlappingBookings?.length || 0) > 0;
            const hasFullResortBooking = overlappingBookings?.some((item: any) => isFullResortType(item.rooms?.type || '')) || false;

            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .order('room_number', { ascending: true });

            if (roomsError) throw roomsError;

            const filteredRooms = (rooms || []).filter((room) => {
                if (room.id === booking.room_id) return true;
                if (room.status !== 'Clean') return false;
                if (excludeIds.includes(room.id)) return false;
                if (hasFullResortBooking) return false;
                if (isFullResortType(room.type)) return !hasAnyBooking;
                return true;
            });

            setAvailableRooms(filteredRooms);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load available rooms for the selected dates');
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleApplyCalculatedTotal = () => {
        setFormData(prev => ({
            ...prev,
            totalAmount: calculatedTotal
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            if (booking.guest_id) {
                const { error: guestError } = await (supabase
                    .from('guests') as any)
                    .update({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                    })
                    .eq('id', booking.guest_id);

                if (guestError) throw guestError;
            }

            const { error: bookingError } = await (supabase
                .from('bookings') as any)
                .update({
                    room_id: formData.roomId,
                    check_in_date: formData.checkIn,
                    check_out_date: formData.checkOut,
                    source: formData.bookingType,
                    status: formData.status,
                    room_rate: Number(formData.roomRate) || 0,
                    extra_pax: Number(formData.extraPax) || 0,
                    extra_pax_rate: Number(formData.extraPaxRate) || 0,
                    total_amount: Number(formData.totalAmount) || 0,
                    advance_amount: Number(formData.advanceAmount) || 0,
                })
                .eq('id', booking.id);

            if (bookingError) throw bookingError;

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to update reservation');
        } finally {
            setLoading(false);
        }
    };

    const roomNumber = selectedRoom?.room_number || booking.rooms?.room_number || 'TBD';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 1. Header Banner */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />

                    <div className={styles.headerTopBar}>
                        <div className={styles.headerBadgeRow}>
                            <div className={styles.folioTag}>
                                <Bookmark size={12} />
                                <span>#{booking.booking_number || booking.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className={styles.roomPill}>
                                <Key size={12} />
                                <span>Room {roomNumber}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.closeBtn}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.headerTitleRow}>
                        <div>
                            <h2 className={styles.titleMain}>Edit Reservation</h2>
                            <div className={styles.titleSubtitle}>
                                Update reservation dates, room assignment, guest info, and pricing breakdown.
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* 2. Scrollable Form Body */}
                <div className={styles.content}>
                    {/* Section 1: Guest Information */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitleGroup}>
                                <User size={15} className={styles.sectionIcon} />
                                <h3 className={styles.sectionTitle}>Primary Guest Information</h3>
                            </div>
                        </div>

                        <div className={styles.grid2}>
                            <Field label="First Name">
                                <div className={styles.inputWrapper}>
                                    <User size={15} className={styles.inputIcon} />
                                    <input
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="First name"
                                    />
                                </div>
                            </Field>

                            <Field label="Last Name">
                                <div className={styles.inputWrapper}>
                                    <User size={15} className={styles.inputIcon} />
                                    <input
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Last name"
                                    />
                                </div>
                            </Field>

                            <Field label="Phone Number">
                                <div className={styles.inputWrapper}>
                                    <Phone size={15} className={styles.inputIcon} />
                                    <input
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 Phone number"
                                    />
                                </div>
                            </Field>

                            <Field label="Email Address">
                                <div className={styles.inputWrapper}>
                                    <Mail size={15} className={styles.inputIcon} />
                                    <input
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="guest@example.com"
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* Section 2: Stay & Room Details */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitleGroup}>
                                <Calendar size={15} className={styles.sectionIcon} />
                                <h3 className={styles.sectionTitle}>Stay Schedule & Allocation</h3>
                            </div>
                            <div className={styles.durationBadge}>
                                <Moon size={12} />
                                <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                            </div>
                        </div>

                        <div className={styles.grid2}>
                            <Field label="Check-in Date">
                                <DatePicker
                                    value={formData.checkIn}
                                    onChange={(val) => setFormData({ ...formData, checkIn: val })}
                                    fullWidth
                                />
                            </Field>

                            <Field label="Check-out Date">
                                <DatePicker
                                    value={formData.checkOut}
                                    onChange={(val) => setFormData({ ...formData, checkOut: val })}
                                    minDate={formData.checkIn}
                                    fullWidth
                                />
                            </Field>

                            <Field label="Assigned Room">
                                <CustomSelect
                                    options={roomOptions}
                                    value={formData.roomId}
                                    onChange={(val) => {
                                        const nextRoom = availableRooms.find((room) => room.id === val);
                                        setFormData({
                                            ...formData,
                                            roomId: val,
                                            roomRate: nextRoom ? nextRoom.price_per_night : formData.roomRate,
                                        });
                                    }}
                                    disabled={loadingRooms}
                                    placeholder={loadingRooms ? 'Verifying available rooms...' : 'Select a room'}
                                    fullWidth
                                />
                            </Field>

                            <Field label="Booking Source / Channel">
                                <CustomSelect
                                    options={BOOKING_TYPE_OPTIONS}
                                    value={formData.bookingType}
                                    onChange={(val) => setFormData({ ...formData, bookingType: val })}
                                    fullWidth
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Section 3: Tariff & Settlement */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitleGroup}>
                                <CreditCard size={15} className={styles.sectionIcon} />
                                <h3 className={styles.sectionTitle}>Tariff, Rates & Payment Breakdown</h3>
                            </div>
                        </div>

                        <div className={styles.grid3}>
                            <Field label="Reservation Status">
                                <CustomSelect
                                    options={BOOKING_STATUS_OPTIONS}
                                    value={formData.status}
                                    onChange={(val) => setFormData({ ...formData, status: val })}
                                    fullWidth
                                />
                            </Field>

                            <Field label={`Room Rate / Night ${selectedRoom?.type ? getPricingUnit(selectedRoom.type) : ''}`}>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.roomRate}
                                    onChange={(e) => setFormData({ ...formData, roomRate: Number(e.target.value) })}
                                />
                            </Field>

                            <Field label="Extra Pax (Guests)">
                                <input
                                    type="number"
                                    min="0"
                                    className={styles.input}
                                    value={formData.extraPax}
                                    onChange={(e) => setFormData({ ...formData, extraPax: Number(e.target.value) })}
                                />
                            </Field>

                            <Field label="Extra Pax Rate / Night">
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.extraPaxRate}
                                    onChange={(e) => setFormData({ ...formData, extraPaxRate: Number(e.target.value) })}
                                />
                            </Field>

                            <Field label="Advance Amount Received">
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.advanceAmount}
                                    onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
                                />
                            </Field>

                            <Field label="Total Billed Amount (₹)">
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.totalAmount}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                />
                            </Field>
                        </div>

                        {/* Live Smart Calculator Card */}
                        <div className={styles.calculatorCard}>
                            <div className={styles.calculatorHeader}>
                                <div className={styles.calculatorTitle}>
                                    <Calculator size={14} />
                                    <span>Live Tariff Calculator & Balance Analysis</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.applyCalculatedBtn}
                                    onClick={handleApplyCalculatedTotal}
                                    title="Update Total Amount to match calculated room & extra pax rates"
                                >
                                    <Sparkles size={12} />
                                    Sync Total (₹{calculatedTotal.toLocaleString('en-IN')})
                                </button>
                            </div>

                            <div className={styles.calculatorStats}>
                                <div className={styles.calcStatBox}>
                                    <span className={styles.calcStatLabel}>Base Room Tariff</span>
                                    <span className={styles.calcStatValue}>
                                        ₹{calculatedRoomCharges.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className={styles.calcStatBox}>
                                    <span className={styles.calcStatLabel}>Extra Pax Charges</span>
                                    <span className={styles.calcStatValue}>
                                        ₹{calculatedExtraCharges.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className={styles.calcStatBox}>
                                    <span className={styles.calcStatLabel}>Advance Paid</span>
                                    <span className={styles.calcStatValue} style={{ color: '#16a34a' }}>
                                        ₹{Number(formData.advanceAmount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className={styles.calcStatBox}>
                                    <span className={styles.calcStatLabel}>Pending Balance</span>
                                    <span
                                        className={styles.calcStatValue}
                                        style={{ color: balanceDue > 0 ? '#b91c1c' : '#16a34a' }}
                                    >
                                        {balanceDue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : 'Settled'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Modal Footer */}
                <div className={styles.footer}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelBtn}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className={styles.saveBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner} />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <Save size={15} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            {children}
        </div>
    );
}
