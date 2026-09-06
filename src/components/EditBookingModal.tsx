'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, Save, X, User, Calendar, CreditCard, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { getPricingUnit, isFullResortType } from '@/lib/constants';
import CustomSelect from './ui/CustomSelect';
import DatePicker from './ui/DatePicker';
import styles from './EditBookingModal.module.css';

const BOOKING_STATUS_OPTIONS = [
    { value: 'Confirmed', label: 'Confirmed', color: '#10B981' },
    { value: 'Checked In', label: 'Checked In', color: '#039BE5' },
    { value: 'Checked Out', label: 'Checked Out', color: '#8B5CF6' },
    { value: 'Cancelled', label: 'Cancelled', color: '#EF4444' },
];

const BOOKING_TYPE_OPTIONS = [
    { value: 'Standard', label: 'Standard' },
    { value: 'Complementary', label: 'Complementary' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'OTA', label: 'OTA' },
    { value: 'Direct', label: 'Direct' },
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
        bookingType: booking.source || 'Standard',
        status: booking.status || 'Confirmed',
        roomRate: booking.room_rate ?? booking.total_amount ?? 0,
        extraPax: booking.extra_pax ?? 0,
        extraPaxRate: booking.extra_pax_rate ?? 600,
        totalAmount: booking.total_amount ?? 0,
        advanceAmount: booking.advance_amount ?? 0,
    });

    const selectedRoom = useMemo(
        () => availableRooms.find((room) => room.id === formData.roomId) || booking.rooms,
        [availableRooms, formData.roomId, booking.rooms]
    );

    const roomOptions = useMemo(() => {
        const list = availableRooms.map((room) => ({
            value: room.id,
            label: `${room.room_number} - ${room.type}`,
        }));
        if (formData.roomId && !list.some((r) => r.value === formData.roomId) && booking.rooms) {
            list.unshift({
                value: booking.rooms.id,
                label: `${booking.rooms.room_number} - ${booking.rooms.type} (Current)`,
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
            setError(err.message || 'Failed to load available rooms');
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            if (booking.guest_id) {
                const { error: guestError } = await supabase
                    .from('guests')
                    .update({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                    })
                    .eq('id', booking.guest_id);

                if (guestError) throw guestError;
            }

            const { error: bookingError } = await supabase
                .from('bookings')
                .update({
                    room_id: formData.roomId,
                    check_in_date: formData.checkIn,
                    check_out_date: formData.checkOut,
                    source: formData.bookingType,
                    status: formData.status,
                    room_rate: formData.roomRate,
                    extra_pax: formData.extraPax,
                    extra_pax_rate: formData.extraPaxRate,
                    total_amount: formData.totalAmount,
                    advance_amount: formData.advanceAmount,
                })
                .eq('id', booking.id);

            if (bookingError) throw bookingError;

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to update booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerTitleGroup}>
                        <h2>Edit Booking</h2>
                        <span className={styles.bookingBadge}>
                            <Hash size={12} />
                            {booking.booking_number || booking.id}
                        </span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} title="Close">
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.content}>
                    {/* Section 1: Guest Information */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <User size={16} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Guest Information</h3>
                        </div>
                        <div className={styles.grid2}>
                            <Field label="First Name">
                                <input className={styles.input} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                            </Field>
                            <Field label="Last Name">
                                <input className={styles.input} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                            </Field>
                            <Field label="Phone">
                                <input className={styles.input} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </Field>
                            <Field label="Email">
                                <input className={styles.input} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </Field>
                        </div>
                    </div>

                    {/* Section 2: Stay & Room Details */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Calendar size={16} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Stay & Room Details</h3>
                        </div>
                        <div className={styles.grid2}>
                            <Field label="Check-in">
                                <DatePicker
                                    value={formData.checkIn}
                                    onChange={(val) => setFormData({ ...formData, checkIn: val })}
                                    fullWidth
                                />
                            </Field>
                            <Field label="Check-out">
                                <DatePicker
                                    value={formData.checkOut}
                                    onChange={(val) => setFormData({ ...formData, checkOut: val })}
                                    minDate={formData.checkIn}
                                    fullWidth
                                />
                            </Field>
                            <Field label="Room">
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
                                    placeholder={loadingRooms ? 'Loading rooms...' : 'Select a room'}
                                    fullWidth
                                />
                            </Field>
                            <Field label="Booking Type">
                                <CustomSelect
                                    options={BOOKING_TYPE_OPTIONS}
                                    value={formData.bookingType}
                                    onChange={(val) => setFormData({ ...formData, bookingType: val })}
                                    fullWidth
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Section 3: Pricing & Settlement */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <CreditCard size={16} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Rates & Payment Breakdown</h3>
                        </div>
                        <div className={styles.grid3}>
                            <Field label="Status">
                                <CustomSelect
                                    options={BOOKING_STATUS_OPTIONS}
                                    value={formData.status}
                                    onChange={(val) => setFormData({ ...formData, status: val })}
                                    fullWidth
                                />
                            </Field>
                            <Field label={`Room Rate ${selectedRoom?.type ? getPricingUnit(selectedRoom.type) : ''}`}>
                                <input type="number" className={styles.input} value={formData.roomRate} onChange={(e) => setFormData({ ...formData, roomRate: Number(e.target.value) })} />
                            </Field>
                            <Field label="Extra Pax">
                                <input type="number" className={styles.input} value={formData.extraPax} onChange={(e) => setFormData({ ...formData, extraPax: Number(e.target.value) })} />
                            </Field>
                            <Field label="Extra Pax Rate">
                                <input type="number" className={styles.input} value={formData.extraPaxRate} onChange={(e) => setFormData({ ...formData, extraPaxRate: Number(e.target.value) })} />
                            </Field>
                            <Field label="Advance Amount">
                                <input type="number" className={styles.input} value={formData.advanceAmount} onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })} />
                            </Field>
                            <Field label="Total Amount">
                                <input type="number" className={styles.input} value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })} />
                            </Field>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" onClick={onClose} className={styles.secondaryBtn}>Cancel</button>
                    <button type="button" onClick={handleSave} className={styles.primaryBtn} disabled={loading}>
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Changes'}
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
