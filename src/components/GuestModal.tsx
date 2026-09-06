'use client';

import { useState, useEffect } from 'react';
import {
    X,
    User,
    Phone,
    Mail,
    Save,
    Crown,
    FileText,
    Building2,
    MapPin,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './GuestModal.module.css';

interface Guest {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name?: string;
    gst_number?: string;
    address?: string;
    is_vip: boolean;
    notes?: string;
}

interface GuestModalProps {
    guest?: Guest | null; // If provided, edit mode
    onClose: () => void;
    onSuccess: () => void;
}

const getInitials = (first?: string, last?: string) => {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    return 'G';
};

export default function GuestModal({ guest, onClose, onSuccess }: GuestModalProps) {
    const [formData, setFormData] = useState<Guest>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        gst_number: '',
        address: '',
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
                company_name: guest.company_name || '',
                gst_number: guest.gst_number || '',
                address: guest.address || '',
                is_vip: guest.is_vip || false,
                notes: guest.notes || ''
            });
        }
    }, [guest]);

    const initials = getInitials(formData.first_name, formData.last_name);
    const isEditMode = Boolean(guest?.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            setError('Both First and Last Name are required.');
            setLoading(false);
            return;
        }

        try {
            if (guest?.id) {
                // Update
                const { error: updateError } = await (supabase
                    .from('guests') as any)
                    .update({
                        first_name: formData.first_name.trim(),
                        last_name: formData.last_name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        company_name: formData.company_name?.trim() || null,
                        gst_number: formData.gst_number?.trim() || null,
                        address: formData.address?.trim() || null,
                        is_vip: formData.is_vip,
                        notes: formData.notes?.trim() || null
                    })
                    .eq('id', guest.id);

                if (updateError) throw updateError;
            } else {
                // Create
                const { error: insertError } = await (supabase
                    .from('guests') as any)
                    .insert([{
                        first_name: formData.first_name.trim(),
                        last_name: formData.last_name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        company_name: formData.company_name?.trim() || null,
                        gst_number: formData.gst_number?.trim() || null,
                        address: formData.address?.trim() || null,
                        is_vip: formData.is_vip,
                        notes: formData.notes?.trim() || null
                    }]);

                if (insertError) throw insertError;
            }
            onSuccess();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 1. Header Banner */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />

                    <div className={styles.headerTopBar}>
                        <div className={styles.folioTag}>
                            <User size={12} />
                            <span>
                                {isEditMode
                                    ? `CRM FOLIO • #${guest?.id?.slice(0, 8).toUpperCase()}`
                                    : 'NEW GUEST REGISTRATION'}
                            </span>
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

                    <div className={styles.headerHero}>
                        <div className={styles.avatarCircle}>
                            {initials}
                        </div>
                        <div className={styles.headerMeta}>
                            <h2 className={styles.headerTitle}>
                                {isEditMode ? 'Edit Guest Profile' : 'Register New Guest'}
                            </h2>
                            <span className={styles.headerSubtitle}>
                                {isEditMode
                                    ? `Updating records for ${formData.first_name || 'Guest'} ${formData.last_name || ''}`
                                    : 'Add personal contact, company, and VIP details to Ave Vista PMS'}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* 2. Scrollable Content Body */}
                <form onSubmit={handleSubmit} className={styles.content}>
                    {/* Section 1: Primary Identity & Contact */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <User size={15} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Primary Identity & Contact</h3>
                        </div>

                        <div className={styles.grid2}>
                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>First Name *</label>
                                <div className={styles.inputWrapper}>
                                    <User size={15} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Amit"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>Last Name *</label>
                                <div className={styles.inputWrapper}>
                                    <User size={15} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Patel"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>Phone Number</label>
                                <div className={styles.inputWrapper}>
                                    <Phone size={15} className={styles.inputIcon} />
                                    <input
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>Email Address</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={15} className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        placeholder="guest@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Corporate & Address */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Building2 size={15} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Corporate & Billing Address (Optional)</h3>
                        </div>

                        <div className={styles.grid2}>
                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>Company Name</label>
                                <div className={styles.inputWrapper}>
                                    <Building2 size={15} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Tata Consultancy Services"
                                        value={formData.company_name || ''}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>GSTIN / Tax ID</label>
                                <div className={styles.inputWrapper}>
                                    <FileText size={15} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="15-digit GST Number"
                                        value={formData.gst_number || ''}
                                        onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel}>Residential / Billing Address</label>
                            <textarea
                                placeholder="Street address, city, state, postal code..."
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className={styles.textarea}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Section 3: Preferences & VIP Designation */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Sparkles size={15} className={styles.sectionIcon} />
                            <h3 className={styles.sectionTitle}>Special Preferences & VIP Designation</h3>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel}>Guest Preferences & Staff Notes</label>
                            <textarea
                                placeholder="Allergies, high-floor room request, celebration notes, dietary preferences..."
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className={styles.textarea}
                                rows={2}
                            />
                        </div>

                        {/* Interactive Luxury VIP Toggle Card */}
                        <div
                            className={styles.vipCard}
                            onClick={() => setFormData({ ...formData, is_vip: !formData.is_vip })}
                        >
                            <div className={styles.vipCardLeft}>
                                <div className={styles.vipIconBox}>
                                    <Crown size={20} />
                                </div>
                                <div className={styles.vipTextGroup}>
                                    <h4 className={styles.vipTitle}>Designate as VIP Clientele</h4>
                                    <p className={styles.vipDesc}>
                                        Grants priority front-desk treatment, personalized greetings, and VIP reporting tags.
                                    </p>
                                </div>
                            </div>

                            <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_vip}
                                    onChange={(e) => setFormData({ ...formData, is_vip: e.target.checked })}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
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
                            type="submit"
                            className={styles.saveBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} />
                                    <span>Saving Profile...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
                                    <span>{isEditMode ? 'Save Guest Profile' : 'Register Guest'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
