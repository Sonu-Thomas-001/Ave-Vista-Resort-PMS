'use client';

import { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    AlertCircle,
    User,
    Wifi,
    Tv,
    Coffee,
    Wind,
    Pencil,
    Sparkles,
    Ban,
    Brush,
    Phone,
    Calendar,
    Users,
    Waves,
    Save,
    RotateCcw
} from 'lucide-react';
import styles from './RoomDetailsModal.module.css';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { FULL_RESORT_DEFAULT_RATE, getPricingUnit, isFullResortType } from '@/lib/constants';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomDetailsModalProps {
    room: Room;
    imageUrl: string;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function RoomDetailsModal({ room, imageUrl, onClose, onUpdate }: RoomDetailsModalProps) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [formData, setFormData] = useState({
        type: room.type,
        price_per_night: room.price_per_night,
        max_occupancy: room.max_occupancy,
        amenities: room.amenities ? room.amenities.join(', ') : ''
    });

    useEffect(() => {
        setFormData({
            type: room.type,
            price_per_night: room.price_per_night,
            max_occupancy: room.max_occupancy,
            amenities: room.amenities ? room.amenities.join(', ') : getAmenities(room.type).map(a => a.label).join(', ')
        });

        if (room.status === 'Occupied') {
            fetchCurrentBooking();
        }
    }, [room]);

    useEffect(() => {
        if (!isFullResortType(formData.type) || formData.price_per_night > 0) return;
        setFormData((current) => ({ ...current, price_per_night: FULL_RESORT_DEFAULT_RATE }));
    }, [formData.type, formData.price_per_night]);

    const fetchCurrentBooking = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    guests (first_name, last_name, email, phone)
                `)
                .eq('room_id', room.id)
                .in('status', ['Checked In', 'Confirmed'])
                .order('check_in_date', { ascending: true })
                .limit(1)
                .single();

            if (data) setBooking(data);
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching booking:', error);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({
                    type: formData.type,
                    price_per_night: Number(formData.price_per_night),
                    max_occupancy: Number(formData.max_occupancy),
                    amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
                })
                .eq('id', room.id);

            if (error) throw error;

            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating room:', error);
            alert('Failed to update room details.');
        }
    };

    const handleStatusChange = async (newStatus: 'Clean' | 'Dirty' | 'Maintenance') => {
        if (room.status === 'Occupied') {
            alert('This room is currently occupied by an in-house guest.');
            return;
        }

        setStatusUpdating(true);
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: newStatus })
                .eq('id', room.id);

            if (error) throw error;
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error changing room status:', error);
            alert('Could not update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const getAmenities = (type: string) => {
        const typeLower = type.toLowerCase();
        const common = [
            { icon: <Wifi size={14} />, label: 'High-Speed Wi-Fi' },
            { icon: <Coffee size={14} />, label: 'Coffee & Tea Maker' }
        ];

        if (typeLower.includes('single')) return [...common, { icon: <Tv size={14} />, label: 'Smart HD TV' }];
        if (typeLower.includes('family') || typeLower.includes('cottage')) {
            return [
                ...common,
                { icon: <Tv size={14} />, label: '4K Smart TV' },
                { icon: <Wind size={14} />, label: 'Dual Climate AC' },
                { icon: <Waves size={14} />, label: 'Resort Pool Access' }
            ];
        }
        if (typeLower.includes('pool') || typeLower.includes('swimming')) {
            return [
                ...common,
                { icon: <Waves size={14} />, label: 'Olympic Pool Access' },
                { icon: <Wind size={14} />, label: 'Lounge Cabana' }
            ];
        }
        if (typeLower.includes('full resort')) {
            return [
                ...common,
                { icon: <Tv size={14} />, label: 'Private Audio/Visual Systems' },
                { icon: <Wind size={14} />, label: 'Full Climate Control' },
                { icon: <Waves size={14} />, label: 'Exclusive Resort Access' }
            ];
        }
        return common;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Top Controls */}
                <div className={styles.topControls}>
                    {!isEditing && (
                        <button
                            className={styles.iconBtn}
                            onClick={() => setIsEditing(true)}
                            title="Edit Room Details"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                    <button className={styles.iconBtn} onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Hero Image & Headline */}
                <div className={styles.imageHeader}>
                    <img src={imageUrl} alt={`Room ${room.room_number}`} className={styles.roomImage} />
                    <div className={styles.imageOverlay}>
                        <div className={styles.headerInfo}>
                            <div className={styles.titleArea}>
                                <h2 className={styles.roomNumber}>Room {room.room_number}</h2>
                                <span className={styles.roomType}>{room.type}</span>
                            </div>
                            <div className={`${styles.statusBadge} ${styles[room.status.toLowerCase()]}`}>
                                {room.status === 'Clean' ? (
                                    <CheckCircle2 size={15} />
                                ) : room.status === 'Occupied' ? (
                                    <Users size={15} />
                                ) : (
                                    <AlertCircle size={15} />
                                )}
                                <span>{room.status === 'Clean' ? 'Available' : room.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.content}>
                        {/* Quick Housekeeping Actions */}
                        {room.status !== 'Occupied' && !isEditing && (
                            <div className={styles.quickActionsBar}>
                                <span className={styles.quickActionsLabel}>Status Action:</span>
                                <button
                                    className={`${styles.statusToggleBtn} ${room.status === 'Clean' ? styles.activeToggle : ''}`}
                                    onClick={() => handleStatusChange('Clean')}
                                    disabled={statusUpdating}
                                >
                                    <Sparkles size={13} /> Mark Available
                                </button>
                                <button
                                    className={`${styles.statusToggleBtn} ${room.status === 'Dirty' ? styles.activeToggle : ''}`}
                                    onClick={() => handleStatusChange('Dirty')}
                                    disabled={statusUpdating}
                                >
                                    <Brush size={13} /> Needs Cleaning
                                </button>
                                <button
                                    className={`${styles.statusToggleBtn} ${room.status === 'Maintenance' ? styles.activeToggle : ''}`}
                                    onClick={() => handleStatusChange('Maintenance')}
                                    disabled={statusUpdating}
                                >
                                    <Ban size={13} /> Out of Order
                                </button>
                            </div>
                        )}

                        {isEditing ? (
                            /* Inline Edit Mode */
                            <div>
                                <div className={styles.editGroup}>
                                    <label className={styles.editLabel}>Room Type / Category</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        placeholder="e.g. Deluxe Cottage, Family Suite"
                                    />
                                </div>

                                <div className={styles.infoGrid} style={{ marginBottom: '1rem' }}>
                                    <div>
                                        <label className={styles.editLabel}>Rate {getPricingUnit(formData.type)}</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={formData.price_per_night}
                                            onChange={e => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.editLabel}>Max Occupancy</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={formData.max_occupancy}
                                            onChange={e => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.editGroup}>
                                    <label className={styles.editLabel}>Amenities (Comma-separated)</label>
                                    <textarea
                                        className={`${styles.input} ${styles.textarea}`}
                                        value={formData.amenities}
                                        onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                                        placeholder="High-Speed Wi-Fi, 4K Smart TV, AC, Pool Access"
                                    />
                                </div>

                                <div className={styles.actionFooter}>
                                    <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                                        <RotateCcw size={15} /> Cancel
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave}>
                                        <Save size={15} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Viewing Mode */
                            <>
                                {/* Room Specs */}
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Base Pricing</span>
                                        <div className={styles.infoValue}>
                                            ₹{room.price_per_night.toLocaleString()}
                                            <span className={styles.infoUnit}>{getPricingUnit(room.type)}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Capacity</span>
                                        <div className={styles.infoValue}>
                                            {room.max_occupancy}
                                            <span className={styles.infoUnit}>Guests Max</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Guest Staying in Room */}
                                {booking && (
                                    <div className={styles.guestSection}>
                                        <div className={styles.guestHeader}>
                                            <User size={16} /> Current In-House Guest
                                        </div>
                                        <div className={styles.guestGrid}>
                                            <div className={styles.guestDetail}>
                                                <span className={styles.guestLabel}>Primary Guest</span>
                                                <span className={styles.guestVal}>
                                                    {booking.guests?.first_name} {booking.guests?.last_name}
                                                </span>
                                            </div>
                                            <div className={styles.guestDetail}>
                                                <span className={styles.guestLabel}>Contact</span>
                                                <span className={styles.guestVal}>
                                                    {booking.guests?.phone || 'On file'}
                                                </span>
                                            </div>
                                            <div className={styles.guestDetail}>
                                                <span className={styles.guestLabel}>Check-In Date</span>
                                                <span className={styles.guestVal}>{booking.check_in_date}</span>
                                            </div>
                                            <div className={styles.guestDetail}>
                                                <span className={styles.guestLabel}>Scheduled Departure</span>
                                                <span className={styles.guestVal}>{booking.check_out_date}</span>
                                            </div>
                                            <div className={styles.guestDetail}>
                                                <span className={styles.guestLabel}>Assigned Rate</span>
                                                <span className={styles.guestVal}>
                                                    ₹{(booking.room_rate || room.price_per_night).toLocaleString()}{getPricingUnit(room.type)}
                                                </span>
                                            </div>
                                            {booking.extra_pax > 0 && (
                                                <div className={styles.guestDetail}>
                                                    <span className={styles.guestLabel}>Extra Guests</span>
                                                    <span className={styles.guestVal}>
                                                        {booking.extra_pax} (+₹{booking.extra_pax_rate || 600}/pax)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Amenities Section */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>
                                        <Sparkles size={14} /> Room Amenities & Inclusions
                                    </div>
                                    <div className={styles.amenitiesList}>
                                        {room.amenities && room.amenities.length > 0 ? (
                                            room.amenities.map((item, index) => (
                                                <div key={index} className={styles.amenityTag}>
                                                    <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                                                    <span>{item}</span>
                                                </div>
                                            ))
                                        ) : (
                                            getAmenities(room.type).map((item, index) => (
                                                <div key={index} className={styles.amenityTag}>
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
