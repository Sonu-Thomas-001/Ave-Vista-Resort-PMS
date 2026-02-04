'use client';

import { useState, useEffect } from 'react';
import { X, Save, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './RoomModal.module.css';

interface Room {
    id?: string;
    room_number: string;
    type: string;
    price_per_night: number;
    max_occupancy: number;
    status: string;
}

interface RoomModalProps {
    room?: Room | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoomModal({ room, onClose, onSuccess }: RoomModalProps) {
    const [formData, setFormData] = useState<Room>({
        room_number: '',
        type: '',
        price_per_night: 0,
        max_occupancy: 1,
        status: 'Clean'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (room) {
            setFormData({
                room_number: room.room_number || '',
                type: room.type || '',
                price_per_night: room.price_per_night || 0,
                max_occupancy: room.max_occupancy || 1,
                status: room.status || 'Clean'
            });
        }
    }, [room]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.room_number || !formData.type) {
            setError('Room number and type are required.');
            setLoading(false);
            return;
        }

        try {
            if (room?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('rooms')
                    .update({
                        room_number: formData.room_number,
                        type: formData.type,
                        price_per_night: formData.price_per_night,
                        max_occupancy: formData.max_occupancy,
                        status: formData.status
                    })
                    .eq('id', room.id);

                if (updateError) throw updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('rooms')
                    .insert([{
                        room_number: formData.room_number,
                        type: formData.type,
                        price_per_night: formData.price_per_night,
                        max_occupancy: formData.max_occupancy,
                        status: formData.status
                    }]);

                if (insertError) throw insertError;
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message);
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
                    <div className={styles.headerTitle}>
                        <h2>{room ? 'Edit Room' : 'Add New Room'}</h2>
                        <span className={styles.stepIndicator}>{room ? 'Update Details' : 'Enter Details'}</span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <div className={styles.content}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Room Number</label>
                            <div className={styles.inputWrapper}>
                                <Home size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="A1"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Room Type</label>
                            <div className={styles.inputWrapper}>
                                <Home size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Single Cottage"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Price per Night (₹)</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>₹</span>
                                <input
                                    type="number"
                                    placeholder="3000"
                                    value={formData.price_per_night}
                                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Max Occupancy</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>#</span>
                                <input
                                    type="number"
                                    placeholder="2"
                                    value={formData.max_occupancy}
                                    onChange={(e) => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className={styles.input}
                            >
                                <option value="Clean">Clean</option>
                                <option value="Dirty">Dirty</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Occupied">Occupied</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className={styles.footer}>
                    <button onClick={onClose} className="btn">Cancel</button>
                    <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Room</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
