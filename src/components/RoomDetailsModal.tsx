'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, User, Wifi, Tv, Coffee, Wind, Pencil } from 'lucide-react';
import styles from './RoomDetailsModal.module.css';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

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
    const [formData, setFormData] = useState({
        type: room.type,
        price_per_night: room.price_per_night,
        max_occupancy: room.max_occupancy,
        amenities: room.amenities ? room.amenities.join(', ') : ''
    });

    useEffect(() => {
        // Reset form data when room changes
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
                .order('check_in_date', { ascending: true }) // Get the earliest/active one
                .limit(1)
                .single();

            if (data) setBooking(data);
            if (error && error.code !== 'PGRST116') { // Ignore no rows found
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
                    price_per_night: formData.price_per_night,
                    max_occupancy: formData.max_occupancy,
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

    // Mock amenities based on room type
    const getAmenities = (type: string) => {
        const typeLower = type.toLowerCase();
        const common = [
            { icon: <Wifi size={14} />, label: 'Free Wifi' },
            { icon: <Coffee size={14} />, label: 'Coffee Maker' }
        ];

        if (typeLower.includes('single')) return [...common, { icon: <Tv size={14} />, label: 'Smart TV' }];
        if (typeLower.includes('family')) return [...common, { icon: <Tv size={14} />, label: 'Smart TV' }, { icon: <Wind size={14} />, label: 'AC' }];
        return common;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                {!isEditing && (
                    <button className={styles.editButton} onClick={() => setIsEditing(true)} title="Edit Room Details">
                        <Pencil size={18} />
                    </button>
                )}

                <div className={styles.imageHeader}>
                    <img src={imageUrl} alt={`Room ${room.room_number}`} className={styles.roomImage} />
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.roomTitle}>
                            <span className={styles.number}>Room {room.room_number}</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                />
                            ) : (
                                <span className={styles.type}>{room.type}</span>
                            )}
                        </div>
                        <div className={`${styles.statusBadge} ${styles[room.status.toLowerCase()]}`}>
                            {room.status === 'Clean' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            <span>{room.status}</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Price per Night</span>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={formData.price_per_night}
                                        onChange={e => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                                    />
                                ) : (
                                    <span className={styles.infoValue}>₹{room.price_per_night.toLocaleString()}</span>
                                )}
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Max Occupancy</span>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={formData.max_occupancy}
                                        onChange={e => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
                                    />
                                ) : (
                                    <span className={styles.infoValue}>{room.max_occupancy} Guests</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <>
                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>Amenities (Comma separated)</div>
                                <textarea
                                    className={`${styles.input} ${styles.textarea}`}
                                    value={formData.amenities}
                                    style={{ height: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                                    onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                                />
                            </div>
                            <div className={styles.actionFooter}>
                                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                            </div>
                        </>
                    ) : (
                        <>
                            {booking && (
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Current Guest</div>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Name</span>
                                            <span className={styles.infoValue}>
                                                {booking.guests?.first_name} {booking.guests?.last_name}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Check-out</span>
                                            <span className={styles.infoValue}>{booking.check_out_date}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>Amenities</div>
                                <div className={styles.amenitiesList}>
                                    {room.amenities ? (
                                        room.amenities.map((item, index) => (
                                            <div key={index} className={styles.amenityTag}>
                                                <CheckCircle size={12} style={{ marginRight: 4, opacity: 0.7 }} /> {item}
                                            </div>
                                        ))
                                    ) : (
                                        getAmenities(room.type).map((item, index) => (
                                            <div key={index} className={styles.amenityTag}>
                                                {item.icon} {item.label}
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
    );
}
