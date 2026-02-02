'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Save, Crown, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './GuestModal.module.css';

interface Guest {

    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_vip: boolean;
    notes?: string;
}

interface GuestModalProps {
    guest?: Guest | null; // If provided, edit mode
    onClose: () => void;
    onSuccess: () => void;
}

export default function GuestModal({ guest, onClose, onSuccess }: GuestModalProps) {
    const [formData, setFormData] = useState<Guest>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        is_vip: false,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (guest) {
            setFormData({
                first_name: guest.first_name || '',
                last_name: guest.last_name || '',
                email: guest.email || '',
                phone: guest.phone || '',
                is_vip: guest.is_vip || false,
                notes: guest.notes || ''
            });
        }
    }, [guest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.first_name || !formData.last_name) {
            setError('Name is required.');
            setLoading(false);
            return;
        }

        try {
            if (guest?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('guests')
                    .update({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        is_vip: formData.is_vip,
                        notes: formData.notes
                    })
                    .eq('id', guest.id);

                if (updateError) throw updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('guests')
                    .insert([{
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        is_vip: formData.is_vip,
                        notes: formData.notes
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
                style={{ maxWidth: 500 }} // Smaller than booking modal
            >
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h2>{guest ? 'Edit Guest' : 'Add New Guest'}</h2>
                        <span className={styles.stepIndicator}>{guest ? 'Update Details' : 'Enter Details'}</span>
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
                            <label>First Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Last Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={16} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>Phone</label>
                            <div className={styles.inputWrapper}>
                                <Phone size={16} className={styles.inputIcon} />
                                <input
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>Notes</label>
                            <div className={styles.inputWrapper}>
                                <FileText size={16} className={styles.inputIcon} />
                                <textarea
                                    placeholder="Allergies, preferences, etc."
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className={styles.input}
                                    style={{ minHeight: 80, resize: 'vertical', paddingTop: 10 }}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.checkboxLabel} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_vip}
                                    onChange={(e) => setFormData({ ...formData, is_vip: e.target.checked })}
                                    style={{ width: 18, height: 18 }}
                                />
                                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>Mark as VIP Guest</span>
                                {formData.is_vip && <Crown size={18} color="#FFD700" />}
                            </label>
                        </div>
                    </form>
                </div>

                <div className={styles.footer}>
                    <button onClick={onClose} className="btn">Cancel</button>
                    <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Guest</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
