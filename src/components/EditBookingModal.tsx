'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AlertCircle, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { getPricingUnit, isFullResortType } from '@/lib/constants';
import CustomSelect from './ui/CustomSelect';

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
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#1E293B' }}>Edit Booking</h2>
                        <div style={{ marginTop: 4, color: '#64748B', fontSize: '0.9rem' }}>
                            {booking.booking_number || booking.id}
                        </div>
                    </div>
                    <button onClick={onClose} style={closeStyle}>
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={errorStyle}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={contentStyle}>
                    <div style={gridStyle}>
                        <Field label="First Name">
                            <input style={inputStyle} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                        </Field>
                        <Field label="Last Name">
                            <input style={inputStyle} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                        </Field>
                        <Field label="Phone">
                            <input style={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </Field>
                        <Field label="Email">
                            <input style={inputStyle} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Field>
                        <Field label="Check-in">
                            <input type="date" style={inputStyle} value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} />
                        </Field>
                        <Field label="Check-out">
                            <input type="date" style={inputStyle} value={formData.checkOut} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} />
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
                        <Field label="Status">
                            <CustomSelect
                                options={BOOKING_STATUS_OPTIONS}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                fullWidth
                            />
                        </Field>
                        <Field label={`Room Rate ${selectedRoom?.type ? getPricingUnit(selectedRoom.type) : ''}`}>
                            <input type="number" style={inputStyle} value={formData.roomRate} onChange={(e) => setFormData({ ...formData, roomRate: Number(e.target.value) })} />
                        </Field>
                        <Field label="Extra Pax">
                            <input type="number" style={inputStyle} value={formData.extraPax} onChange={(e) => setFormData({ ...formData, extraPax: Number(e.target.value) })} />
                        </Field>
                        <Field label="Extra Pax Rate">
                            <input type="number" style={inputStyle} value={formData.extraPaxRate} onChange={(e) => setFormData({ ...formData, extraPaxRate: Number(e.target.value) })} />
                        </Field>
                        <Field label="Advance Amount">
                            <input type="number" style={inputStyle} value={formData.advanceAmount} onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })} />
                        </Field>
                        <Field label="Total Amount">
                            <input type="number" style={inputStyle} value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })} />
                        </Field>
                    </div>
                </div>

                <div style={footerStyle}>
                    <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
                    <button onClick={handleSave} style={primaryBtnStyle} disabled={loading}>
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
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            {children}
        </label>
    );
}

const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: 24,
};

const modalStyle: CSSProperties = {
    width: '100%',
    maxWidth: 920,
    maxHeight: '88vh',
    overflow: 'auto',
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 16px',
    borderBottom: '1px solid #E2E8F0',
};

const contentStyle: CSSProperties = {
    padding: 24,
};

const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
};

const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    fontSize: '0.95rem',
    color: '#1E293B',
    background: '#fff',
};

const footerStyle: CSSProperties = {
    padding: 24,
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
};

const primaryBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 18px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #039BE5 0%, #0277BD 100%)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
};

const secondaryBtnStyle: CSSProperties = {
    padding: '12px 18px',
    borderRadius: 12,
    border: '1px solid #CBD5E1',
    background: '#fff',
    color: '#475569',
    fontWeight: 700,
    cursor: 'pointer',
};

const closeStyle: CSSProperties = {
    border: 'none',
    background: '#F8FAFC',
    color: '#64748B',
    width: 38,
    height: 38,
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const errorStyle: CSSProperties = {
    margin: '16px 24px 0',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #FECACA',
    background: '#FEF2F2',
    color: '#991B1B',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.9rem',
};
