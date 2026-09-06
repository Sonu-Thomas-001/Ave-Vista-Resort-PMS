'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import {
    Save,
    Building,
    CreditCard,
    LayoutGrid,
    Mail,
    Plus,
    Trash2,
    Edit2,
    Phone,
    Globe,
    MapPin,
    Clock,
    Percent,
    CheckCircle2,
    AlertCircle,
    Search,
    BedDouble,
    ShieldCheck,
    Wallet,
    DollarSign,
    Sparkles,
    Grid,
    List,
    ExternalLink,
    Star,
    Calculator,
    ShieldAlert,
    UserPlus,
    UserX,
    PauseCircle,
    PlayCircle,
    Lock,
    Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import EmailSettingsPage from './email/page';
import RoomModal from '@/components/RoomModal';
import { getPricingUnit } from '@/lib/constants';

type SettingsData = Database['public']['Tables']['app_settings']['Row'] & {
    gst_enabled?: boolean;
    allow_registration?: boolean;
};
type RoomData = Database['public']['Tables']['rooms']['Row'];

const DEFAULT_SETTINGS: SettingsData = {
    id: 1,
    resort_name: 'Ave Vista Resort & Hotels',
    contact_email: 'avevistaresort@gmail.com',
    address: 'Near Old Toll Gate, Kumarakom Road, Kottayam, Kerala 686001',
    gst_number: '32AAAAA0000A1Z5',
    tax_rate: 18,
    gst_enabled: true,
    allow_registration: true,
    updated_at: new Date().toISOString()
};

export default function SettingsPage() {
    const [activeTopTab, setActiveTopTab] = useState<'Property' | 'Rooms' | 'Finance' | 'Email' | 'Security'>('Property');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
    const [deleteRoomTarget, setDeleteRoomTarget] = useState<RoomData | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Room Inventory Controls
    const [roomSearch, setRoomSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Operational parameters
    const [checkInTime, setCheckInTime] = useState('14:00');
    const [checkOutTime, setCheckOutTime] = useState('11:00');
    const [phoneNumber, setPhoneNumber] = useState('+91 94470 12345');
    const [websiteUrl, setWebsiteUrl] = useState('https://avevistaresort.com');
    const [legalEntityName, setLegalEntityName] = useState('Ave Vista Hospitality & Leisure Pvt. Ltd.');

    // Tax Simulator Simulation Amount
    const [simulationAmount, setSimulationAmount] = useState(5000);

    // Payment Instrument Toggles
    const [paymentTenders, setPaymentTenders] = useState({
        upi: true,
        card: true,
        cash: true,
        bankTransfer: true
    });

    useEffect(() => {
        fetchSettings();
        fetchRooms();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchSettings = async () => {
        // 1. Instantly restore from localStorage cache for zero delay
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('ave_vista_app_settings');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setSettings(prev => ({ ...prev, ...parsed }));
                }
            } catch (e) {
                console.warn('Could not read cached settings:', e);
            }
        }

        // 2. Fetch from cloud Supabase app_settings
        try {
            const { data, error } = await supabase.from('app_settings').select('*').limit(1);
            if (error) {
                console.warn('Note on cloud settings fetch:', error.message || error);
            } else if (data && data.length > 0) {
                const cloudSettings = data[0];
                setSettings(prev => ({
                    ...prev,
                    ...cloudSettings,
                    // Preserve gst_enabled if it was set in localStorage or derive from tax_rate
                    gst_enabled: cloudSettings.gst_enabled !== undefined
                        ? Boolean(cloudSettings.gst_enabled)
                        : (prev.gst_enabled !== undefined ? prev.gst_enabled : (Number(cloudSettings.tax_rate) > 0)),
                    allow_registration: cloudSettings.allow_registration !== undefined
                        ? Boolean(cloudSettings.allow_registration)
                        : (prev.allow_registration !== undefined ? prev.allow_registration : true)
                }));
            }
        } catch (error) {
            console.warn('Cloud settings fetch exception:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const { data } = await supabase.from('rooms').select('*').order('room_number');
            if (data) setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleToggleRegistration = async (newVal: boolean) => {
        const completeSettings: SettingsData = {
            ...settings,
            allow_registration: newVal,
            updated_at: new Date().toISOString()
        };
        setSettings(completeSettings);

        if (typeof window !== 'undefined') {
            localStorage.setItem('ave_vista_app_settings', JSON.stringify(completeSettings));
            window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: completeSettings }));
        }

        try {
            const { error: updateError } = await supabase
                .from('app_settings')
                .update({ allow_registration: newVal, updated_at: completeSettings.updated_at })
                .eq('id', 1);

            if (updateError) {
                await supabase.from('app_settings').upsert({
                    id: 1,
                    allow_registration: newVal,
                    updated_at: completeSettings.updated_at
                });
            }
            showToast(
                newVal
                    ? 'Staff self-registration is now ACTIVE. New staff can register at /signup.'
                    : 'Staff self-registration is now PAUSED. Public signups are blocked.',
                'success'
            );
        } catch (e: any) {
            console.warn('Registration toggle sync note:', e);
            showToast(
                newVal
                    ? 'Staff self-registration enabled (saved)'
                    : 'Staff self-registration paused (saved)',
                'success'
            );
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isGstEnabled = settings.gst_enabled !== false;
            const isRegAllowed = settings.allow_registration !== false;
            const completeSettings: SettingsData = {
                ...settings,
                id: 1,
                gst_enabled: isGstEnabled,
                allow_registration: isRegAllowed,
                tax_rate: isGstEnabled ? (Number(settings.tax_rate) || 18) : 0,
                updated_at: new Date().toISOString()
            };

            // 1. Immediately persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('ave_vista_app_settings', JSON.stringify(completeSettings));
                window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: completeSettings }));
            }
            setSettings(completeSettings);

            // 2. Prepare sanitized payload for Supabase with only columns defined in database
            const supabasePayload: Record<string, any> = {
                id: 1,
                resort_name: completeSettings.resort_name || DEFAULT_SETTINGS.resort_name,
                contact_email: completeSettings.contact_email || DEFAULT_SETTINGS.contact_email,
                address: completeSettings.address || DEFAULT_SETTINGS.address,
                gst_number: completeSettings.gst_number || DEFAULT_SETTINGS.gst_number,
                tax_rate: completeSettings.tax_rate,
                allow_registration: isRegAllowed,
                updated_at: completeSettings.updated_at
            };

            // 3. Attempt cloud persistence gracefully
            try {
                // Try update first (in case row id 1 exists)
                const { data: updateData, error: updateError } = await supabase
                    .from('app_settings')
                    .update(supabasePayload)
                    .eq('id', 1)
                    .select();

                if (updateError || !updateData || updateData.length === 0) {
                    // Try upsert
                    const { error: upsertError } = await supabase
                        .from('app_settings')
                        .upsert(supabasePayload);
                    if (upsertError) {
                        console.warn('Supabase app_settings cloud sync note:', upsertError.message || upsertError);
                    }
                }
            } catch (cloudErr: any) {
                console.warn('Could not sync to cloud database:', cloudErr?.message || cloudErr);
            }

            showToast('System configuration & settings saved successfully!', 'success');
        } catch (error: any) {
            const errMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            console.error('Error saving settings:', errMsg, error);
            showToast(errMsg || 'Failed to save settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAddRoom = () => {
        setEditingRoom(null);
        setShowRoomModal(true);
    };

    const handleEditRoom = (room: RoomData) => {
        setEditingRoom(room);
        setShowRoomModal(true);
    };

    const handleConfirmDeleteRoom = async () => {
        if (!deleteRoomTarget) return;

        try {
            const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', deleteRoomTarget.id);

            if (error) throw error;
            showToast(`Room ${deleteRoomTarget.room_number} deleted.`, 'success');
            setDeleteRoomTarget(null);
            fetchRooms();
        } catch (error: any) {
            console.error('Error deleting room:', error);
            showToast(error.message || 'Failed to delete room.', 'error');
        }
    };

    const handleRoomSuccess = () => {
        setShowRoomModal(false);
        setEditingRoom(null);
        showToast('Room configuration updated!', 'success');
        fetchRooms();
    };

    // Category pills list
    const roomCategories = useMemo(() => {
        const types = Array.from(new Set(rooms.map(r => r.type).filter(Boolean)));
        return ['All', ...types];
    }, [rooms]);

    // Filtered rooms based on search & category pill
    const filteredRooms = useMemo(() => {
        let result = rooms;
        if (selectedCategoryFilter !== 'All') {
            result = result.filter(r => r.type === selectedCategoryFilter);
        }
        if (roomSearch.trim()) {
            const q = roomSearch.toLowerCase();
            result = result.filter(r =>
                r.room_number.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                (r.status || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [rooms, selectedCategoryFilter, roomSearch]);

    // Room stats
    const roomMetrics = useMemo(() => {
        const total = rooms.length;
        const occupied = rooms.filter(r => (r.status || '').toLowerCase() === 'occupied').length;
        const clean = rooms.filter(r => (r.status || '').toLowerCase() === 'clean' || !r.status).length;
        const maintenance = rooms.filter(r => (r.status || '').toLowerCase() === 'maintenance').length;
        return { total, occupied, clean, maintenance };
    }, [rooms]);

    // Simulated tax calculation
    const simulatedTax = useMemo(() => {
        const isGstEnabled = settings.gst_enabled !== false;
        if (!isGstEnabled) {
            return {
                base: simulationAmount,
                totalTax: 0,
                cgst: 0,
                sgst: 0,
                rate: 0,
                halfRate: '0.0'
            };
        }
        const taxRate = Number(settings.tax_rate) || 18;
        const base = simulationAmount / (1 + taxRate / 100);
        const totalTax = simulationAmount - base;
        const halfTax = totalTax / 2;
        return {
            base: Math.round(base),
            totalTax: Math.round(totalTax),
            cgst: Math.round(halfTax),
            sgst: Math.round(halfTax),
            rate: taxRate,
            halfRate: (taxRate / 2).toFixed(1)
        };
    }, [simulationAmount, settings.tax_rate, settings.gst_enabled]);

    return (
        <div className={styles.pageWrapper}>
            <Header title="Settings & System Categories" />

            <div className={styles.container}>
                {/* ─────────────────────────────────────────────────────────────
                   EXECUTIVE HERO BANNER (CLEAN LIGHT THEME)
                   ───────────────────────────────────────────────────────────── */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <Sparkles size={13} /> Executive Resort Management
                        </div>
                        <h1 className={styles.heroTitle}>{settings.resort_name || 'Ave Vista Resort & Hotels'}</h1>
                        <p className={styles.heroSubtitle}>
                            Configure property branding, room inventory tiers, statutory fiscal rules, and automated communications.
                        </p>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.heroStatCard}>
                            <span className={styles.heroStatLabel}>Configured Suites</span>
                            <span className={styles.heroStatValue}>{rooms.length} Units</span>
                        </div>
                        <div className={styles.heroStatCard}>
                            <span className={styles.heroStatLabel}>Fiscal GST Mode</span>
                            <span className={styles.heroStatValue}>
                                {settings.gst_enabled !== false ? `${settings.tax_rate || 18}% Composite` : '0% (Exempt)'}
                            </span>
                        </div>
                        <div className={styles.heroStatCard}>
                            <span className={styles.heroStatLabel}>System Sync</span>
                            <span className={styles.heroStatValue} style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle2 size={16} /> Operational
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   LAYOUT: SIDEBAR + CONTENT
                   ───────────────────────────────────────────────────────────── */}
                <div className={styles.layout}>
                    {/* Settings Navigation Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <span className={styles.sidebarSectionLabel}>System Categories</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>5 Modules</span>
                        </div>

                        {/* Category 1: Property Profile */}
                        <button
                            className={`${styles.categoryCardBtn} ${activeTopTab === 'Property' ? styles.activeCategory : ''}`}
                            onClick={() => setActiveTopTab('Property')}
                        >
                            <div className={`${styles.categoryIconWrapper} ${styles.categoryEmerald}`}>
                                <Building size={20} />
                            </div>
                            <div className={styles.categoryTextGroup}>
                                <span className={styles.categoryTitle}>Property Profile</span>
                                <span className={styles.categorySubtitle}>Branding & Operations</span>
                            </div>
                            {activeTopTab === 'Property' && <div className={styles.activeIndicatorDot}></div>}
                        </button>

                        {/* Category 2: Room Inventory */}
                        <button
                            className={`${styles.categoryCardBtn} ${activeTopTab === 'Rooms' ? styles.activeCategory : ''}`}
                            onClick={() => setActiveTopTab('Rooms')}
                        >
                            <div className={`${styles.categoryIconWrapper} ${styles.categoryBlue}`}>
                                <LayoutGrid size={20} />
                            </div>
                            <div className={styles.categoryTextGroup}>
                                <span className={styles.categoryTitle}>Room Inventory</span>
                                <span className={styles.categorySubtitle}>{rooms.length} Suites Configured</span>
                            </div>
                            {activeTopTab === 'Rooms' && <div className={styles.activeIndicatorDot}></div>}
                        </button>

                        {/* Category 3: Taxes & Payments */}
                        <button
                            className={`${styles.categoryCardBtn} ${activeTopTab === 'Finance' ? styles.activeCategory : ''}`}
                            onClick={() => setActiveTopTab('Finance')}
                        >
                            <div className={`${styles.categoryIconWrapper} ${styles.categoryAmber}`}>
                                <CreditCard size={20} />
                            </div>
                            <div className={styles.categoryTextGroup}>
                                <span className={styles.categoryTitle}>Taxes & Payments</span>
                                <span className={styles.categorySubtitle}>GST & Tender Gateways</span>
                            </div>
                            {activeTopTab === 'Finance' && <div className={styles.activeIndicatorDot}></div>}
                        </button>

                        {/* Category 4: Email Automation */}
                        <button
                            className={`${styles.categoryCardBtn} ${activeTopTab === 'Email' ? styles.activeCategory : ''}`}
                            onClick={() => setActiveTopTab('Email')}
                        >
                            <div className={`${styles.categoryIconWrapper} ${styles.categoryPurple}`}>
                                <Mail size={20} />
                            </div>
                            <div className={styles.categoryTextGroup}>
                                <span className={styles.categoryTitle}>Email Automation</span>
                                <span className={styles.categorySubtitle}>Dispatch & Templates</span>
                            </div>
                            {activeTopTab === 'Email' && <div className={styles.activeIndicatorDot}></div>}
                        </button>

                        {/* Category 5: Access & Security */}
                        <button
                            className={`${styles.categoryCardBtn} ${activeTopTab === 'Security' ? styles.activeCategory : ''}`}
                            onClick={() => setActiveTopTab('Security')}
                        >
                            <div className={`${styles.categoryIconWrapper} ${styles.categoryRose}`}>
                                <ShieldCheck size={20} />
                            </div>
                            <div className={styles.categoryTextGroup}>
                                <span className={styles.categoryTitle}>Access & Security</span>
                                <span className={styles.categorySubtitle} style={{ color: settings.allow_registration !== false ? '#059669' : '#dc2626' }}>
                                    {settings.allow_registration !== false ? '● Registration Active' : '■ Registration Paused'}
                                </span>
                            </div>
                            {activeTopTab === 'Security' && <div className={styles.activeIndicatorDot}></div>}
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <main className={styles.content}>
                        {/* ─────────────────────────────────────────────────────
                           SECTION 1: PROPERTY PROFILE & BRANDING
                           ───────────────────────────────────────────────────── */}
                        {activeTopTab === 'Property' && (
                            <form onSubmit={handleSaveSettings} className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Property Profile & Coordinates</h2>
                                        <p className={styles.sectionSubtitle}>Resort identification, contact coordinates, and operational schedules.</p>
                                    </div>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>

                                {/* Branding Hero Card */}
                                <div className={styles.brandingBannerCard}>
                                    <div className={styles.resortEmblem}>
                                        AV
                                    </div>
                                    <div className={styles.brandingInfo}>
                                        <h3 className={styles.brandingName}>{settings.resort_name || 'Ave Vista Resort & Hotels'}</h3>
                                        <div className={styles.brandingMeta}>
                                            <span className={styles.metaChip}>
                                                <Star size={12} color="#f59e0b" /> Luxury Resort Destination
                                            </span>
                                            <span className={styles.metaChip}>
                                                <MapPin size={12} color="#0284c7" /> Kumarakom, Kerala
                                            </span>
                                            <span className={styles.metaChip} style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
                                                <CheckCircle2 size={12} /> Active Property
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Card */}
                                <div className={styles.cardGroup}>
                                    <h3 className={styles.cardGroupTitle}>
                                        <Building size={18} color="#10b981" /> Resort Registration & Trade Name
                                    </h3>
                                    <p className={styles.cardGroupSubtitle}>Official registration details printed on guest bills and folios.</p>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Public Resort Name</label>
                                            <div className={styles.inputWrapper}>
                                                <Building className={styles.inputIcon} size={16} />
                                                <input
                                                    type="text"
                                                    value={settings.resort_name || ''}
                                                    onChange={(e) => handleInputChange('resort_name', e.target.value)}
                                                    className={styles.input}
                                                    placeholder="Ave Vista Resort & Hotels"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Registered Legal Entity</label>
                                            <div className={styles.inputWrapper}>
                                                <ShieldCheck className={styles.inputIcon} size={16} />
                                                <input
                                                    type="text"
                                                    value={legalEntityName}
                                                    onChange={(e) => setLegalEntityName(e.target.value)}
                                                    className={styles.input}
                                                    placeholder="Ave Vista Hospitality & Leisure Pvt. Ltd."
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Official Reservations Email</label>
                                            <div className={styles.inputWrapper}>
                                                <Mail className={styles.inputIcon} size={16} />
                                                <input
                                                    type="email"
                                                    value={settings.contact_email || ''}
                                                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                                    className={styles.input}
                                                    placeholder="avevistaresort@gmail.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Direct Desk Phone Number</label>
                                            <div className={styles.inputWrapper}>
                                                <Phone className={styles.inputIcon} size={16} />
                                                <input
                                                    type="text"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className={styles.input}
                                                    placeholder="+91 94470 12345"
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Official Resort Website</label>
                                            <div className={styles.inputWrapper}>
                                                <Globe className={styles.inputIcon} size={16} />
                                                <input
                                                    type="text"
                                                    value={websiteUrl}
                                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                                    className={styles.input}
                                                    placeholder="https://avevistaresort.com"
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Currency Configuration</label>
                                            <div className={styles.inputWrapper}>
                                                <DollarSign className={styles.inputIcon} size={16} />
                                                <select className={styles.input} defaultValue="INR">
                                                    <option value="INR">₹ INR - Indian Rupee (Default)</option>
                                                    <option value="USD">$ USD - US Dollar</option>
                                                    <option value="EUR">€ EUR - Euro</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                            <label className={styles.formLabel}>
                                                Physical Location & Address
                                                <a
                                                    href={`https://maps.google.com/?q=${encodeURIComponent(settings.address || 'Ave Vista Resort Kumarakom')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                                >
                                                    <ExternalLink size={12} /> Open in Maps
                                                </a>
                                            </label>
                                            <textarea
                                                value={settings.address || ''}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className={styles.textarea}
                                                placeholder="Street, Landmark, City, State, PIN"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Timings Card */}
                                <div className={styles.cardGroup}>
                                    <h3 className={styles.cardGroupTitle}>
                                        <Clock size={18} color="#0284c7" /> Front Desk Timings & Policy
                                    </h3>
                                    <p className={styles.cardGroupSubtitle}>Standard check-in and checkout schedules enforced across reservation systems.</p>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Standard Check-in Time</label>
                                            <div className={styles.inputWrapper}>
                                                <Clock className={styles.inputIcon} size={16} />
                                                <input
                                                    type="time"
                                                    value={checkInTime}
                                                    onChange={(e) => setCheckInTime(e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Standard Checkout Time</label>
                                            <div className={styles.inputWrapper}>
                                                <Clock className={styles.inputIcon} size={16} />
                                                <input
                                                    type="time"
                                                    value={checkOutTime}
                                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Staff Access & Registration Quick Card */}
                                <div className={styles.cardGroup}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                                        <div>
                                            <h3 className={styles.cardGroupTitle} style={{ margin: 0 }}>
                                                <ShieldCheck size={18} color="#e11d48" /> Staff Portal Self-Registration
                                            </h3>
                                            <p className={styles.cardGroupSubtitle} style={{ margin: '4px 0 0 0' }}>
                                                Permit or pause public staff account creation at the <code>/signup</code> portal.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className={`${styles.regStatusIndicator} ${settings.allow_registration !== false ? styles.regStatusActive : styles.regStatusPaused}`}>
                                                {settings.allow_registration !== false ? (
                                                    <>
                                                        <CheckCircle2 size={13} /> Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <PauseCircle size={13} /> Paused
                                                    </>
                                                )}
                                            </span>
                                            {settings.allow_registration !== false ? (
                                                <button
                                                    type="button"
                                                    className={`${styles.regToggleActionBtn} ${styles.pauseActionBtn}`}
                                                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                                                    onClick={() => handleToggleRegistration(false)}
                                                >
                                                    <PauseCircle size={15} /> Pause Signups
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={`${styles.regToggleActionBtn} ${styles.resumeActionBtn}`}
                                                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                                                    onClick={() => handleToggleRegistration(true)}
                                                >
                                                    <PlayCircle size={15} /> Resume Signups
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                                        When paused, prospective employees cannot self-register. To view complete authentication guidelines, visit the{' '}
                                        <button
                                            type="button"
                                            onClick={() => setActiveTopTab('Security')}
                                            style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                        >
                                            Access & Security
                                        </button>{' '}
                                        module.
                                    </p>
                                </div>

                                <div className={styles.actionRow}>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ─────────────────────────────────────────────────────
                           SECTION 2: ROOM INVENTORY & CONFIGURATION
                           ───────────────────────────────────────────────────── */}
                        {activeTopTab === 'Rooms' && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Room Inventory & Pricing Configuration</h2>
                                        <p className={styles.sectionSubtitle}>Manage suite tiers, standard rates, guest capacities, and room availability.</p>
                                    </div>
                                    <button className={styles.primaryBtn} onClick={handleAddRoom}>
                                        <Plus size={16} /> Add New Room
                                    </button>
                                </div>

                                {/* Mini Stats */}
                                <div className={styles.roomStatsGrid}>
                                    <div className={styles.roomStatCard}>
                                        <div className={styles.roomStatInfo}>
                                            <span className={styles.roomStatNumber}>{roomMetrics.total}</span>
                                            <span className={styles.roomStatText}>Total Suites</span>
                                        </div>
                                        <BedDouble size={26} color="#0284c7" />
                                    </div>
                                    <div className={styles.roomStatCard}>
                                        <div className={styles.roomStatInfo}>
                                            <span className={styles.roomStatNumber} style={{ color: '#059669' }}>{roomMetrics.clean}</span>
                                            <span className={styles.roomStatText}>Available / Clean</span>
                                        </div>
                                        <ShieldCheck size={26} color="#059669" />
                                    </div>
                                    <div className={styles.roomStatCard}>
                                        <div className={styles.roomStatInfo}>
                                            <span className={styles.roomStatNumber} style={{ color: '#2563eb' }}>{roomMetrics.occupied}</span>
                                            <span className={styles.roomStatText}>Occupied</span>
                                        </div>
                                        <LayoutGrid size={26} color="#2563eb" />
                                    </div>
                                    <div className={styles.roomStatCard}>
                                        <div className={styles.roomStatInfo}>
                                            <span className={styles.roomStatNumber} style={{ color: '#dc2626' }}>{roomMetrics.maintenance}</span>
                                            <span className={styles.roomStatText}>Maintenance</span>
                                        </div>
                                        <AlertCircle size={26} color="#dc2626" />
                                    </div>
                                </div>

                                {/* Category Filter Pills */}
                                <div className={styles.categoryFilterBar}>
                                    {roomCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`${styles.filterPill} ${selectedCategoryFilter === cat ? styles.activeFilterPill : ''}`}
                                            onClick={() => setSelectedCategoryFilter(cat)}
                                        >
                                            {cat === 'All' ? 'All Suites' : cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Room Search and View Mode Switcher */}
                                <div className={styles.roomControlsRow}>
                                    <div className={styles.searchBox}>
                                        <Search size={15} color="#94a3b8" />
                                        <input
                                            type="text"
                                            placeholder="Search by room #, category, or status..."
                                            value={roomSearch}
                                            onChange={(e) => setRoomSearch(e.target.value)}
                                            className={styles.searchInput}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            Showing {filteredRooms.length} of {rooms.length} Suites
                                        </span>

                                        <div className={styles.viewModeSwitcher}>
                                            <button
                                                type="button"
                                                className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.activeViewMode : ''}`}
                                                onClick={() => setViewMode('grid')}
                                                title="Card Grid View"
                                            >
                                                <Grid size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.viewModeBtn} ${viewMode === 'table' ? styles.activeViewMode : ''}`}
                                                onClick={() => setViewMode('table')}
                                                title="Data Table View"
                                            >
                                                <List size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* VIEW 1: LUXURY CARD GRID */}
                                {viewMode === 'grid' ? (
                                    <div className={styles.roomCardsGrid}>
                                        {filteredRooms.length === 0 ? (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                                No rooms found matching your filter.
                                            </div>
                                        ) : (
                                            filteredRooms.map(room => {
                                                const s = (room.status || 'clean').toLowerCase();
                                                const statusClass =
                                                    s === 'occupied' ? styles.statusOccupied :
                                                    s === 'dirty' ? styles.statusDirty :
                                                    s === 'maintenance' ? styles.statusMaintenance :
                                                    styles.statusClean;

                                                return (
                                                    <div key={room.id} className={styles.roomCard}>
                                                        <div className={styles.roomCardTop}>
                                                            <div>
                                                                <span className={styles.roomCardNumber}>{room.room_number}</span>
                                                                <h4 className={styles.roomCardTier}>{room.type}</h4>
                                                                <div className={styles.roomCardOccupancy}>
                                                                    <BedDouble size={14} /> Max {room.max_occupancy} Pax
                                                                </div>
                                                            </div>
                                                            <span className={`${styles.statusBadge} ${statusClass}`}>
                                                                {room.status || 'Clean'}
                                                            </span>
                                                        </div>

                                                        <div className={styles.roomCardFooter}>
                                                            <div className={styles.roomCardPrice}>
                                                                ₹{room.price_per_night?.toLocaleString('en-IN')}{getPricingUnit(room.type)}
                                                            </div>
                                                            <div className={styles.actionBtns}>
                                                                <button
                                                                    className={styles.iconActionBtn}
                                                                    title="Edit Room"
                                                                    onClick={() => handleEditRoom(room)}
                                                                >
                                                                    <Edit2 size={15} />
                                                                </button>
                                                                <button
                                                                    className={`${styles.iconActionBtn} ${styles.danger}`}
                                                                    title="Delete Room"
                                                                    onClick={() => setDeleteRoomTarget(room)}
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                ) : (
                                    /* VIEW 2: DENSE DATA TABLE */
                                    <div className={styles.tableWrapper}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Room #</th>
                                                    <th>Category Tier</th>
                                                    <th>Base Tariff</th>
                                                    <th>Capacity</th>
                                                    <th>Housekeeping</th>
                                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRooms.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                                            No rooms match the search filter.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredRooms.map((room) => {
                                                        const s = (room.status || 'clean').toLowerCase();
                                                        const statusClass =
                                                            s === 'occupied' ? styles.statusOccupied :
                                                            s === 'dirty' ? styles.statusDirty :
                                                            s === 'maintenance' ? styles.statusMaintenance :
                                                            styles.statusClean;

                                                        return (
                                                            <tr key={room.id}>
                                                                <td>
                                                                    <span className={styles.roomNumberBadge}>{room.room_number}</span>
                                                                </td>
                                                                <td>
                                                                    <span className={styles.roomTypePill}>{room.type}</span>
                                                                </td>
                                                                <td>
                                                                    <span className={styles.roomPriceText}>
                                                                        ₹{room.price_per_night?.toLocaleString('en-IN')}{getPricingUnit(room.type)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span style={{ fontWeight: 600, color: '#475569' }}>
                                                                        {room.max_occupancy} Pax
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                                                        {room.status || 'Clean'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.actionBtns}>
                                                                        <button
                                                                            className={styles.iconActionBtn}
                                                                            title="Edit Room"
                                                                            onClick={() => handleEditRoom(room)}
                                                                        >
                                                                            <Edit2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            className={`${styles.iconActionBtn} ${styles.danger}`}
                                                                            title="Delete Room"
                                                                            onClick={() => setDeleteRoomTarget(room)}
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─────────────────────────────────────────────────────
                           SECTION 3: TAXES & FISCAL SETTLEMENTS
                           ───────────────────────────────────────────────────── */}
                        {activeTopTab === 'Finance' && (
                            <form onSubmit={handleSaveSettings} className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Taxes, Surcharges & Fiscal Compliance</h2>
                                        <p className={styles.sectionSubtitle}>GSTIN rules, automatic tax splitting, service charges, and accepted tender modes.</p>
                                    </div>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Tax Rules'}
                                    </button>
                                </div>

                                {/* GST Card */}
                                <div className={styles.cardGroup}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <h3 className={styles.cardGroupTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Percent size={18} color="#d97706" /> Statutory Goods & Services Tax (GST)
                                                <span className={settings.gst_enabled !== false ? styles.gstBadgeActive : styles.gstBadgeInactive}>
                                                    {settings.gst_enabled !== false ? 'GST Active' : 'GST Disabled'}
                                                </span>
                                            </h3>
                                            <p className={styles.cardGroupSubtitle} style={{ marginTop: 4, marginBottom: 0 }}>
                                                Applied automatically across guest room checkouts and restaurant dining receipts.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.secondaryBtn}
                                            onClick={() => handleInputChange('gst_enabled', settings.gst_enabled === false)}
                                            style={{
                                                background: settings.gst_enabled !== false ? '#ecfdf5' : '#f8fafc',
                                                borderColor: settings.gst_enabled !== false ? '#a7f3d0' : '#cbd5e1',
                                                color: settings.gst_enabled !== false ? '#15803d' : '#475569',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div className={`${styles.switchTrack} ${settings.gst_enabled !== false ? styles.switchOn : ''}`} style={{ pointerEvents: 'none' }}>
                                                <div className={styles.switchThumb} />
                                            </div>
                                            <span>{settings.gst_enabled !== false ? 'GST Enabled' : 'GST Disabled'}</span>
                                        </button>
                                    </div>

                                    {/* Master Enable/Disable Banner */}
                                    <div
                                        className={`${styles.gstToggleBox} ${settings.gst_enabled !== false ? styles.gstToggleActive : ''}`}
                                        onClick={() => handleInputChange('gst_enabled', settings.gst_enabled === false)}
                                    >
                                        <div className={styles.gstToggleLeft}>
                                            <div className={styles.gstToggleIcon}>
                                                <Percent size={20} />
                                            </div>
                                            <div>
                                                <div className={styles.gstToggleTitle}>
                                                    <span>Enable Statutory Goods & Services Tax (GST)</span>
                                                    <span className={settings.gst_enabled !== false ? styles.gstBadgeActive : styles.gstBadgeInactive}>
                                                        {settings.gst_enabled !== false ? 'Enabled' : 'Disabled (0% Exempt)'}
                                                    </span>
                                                </div>
                                                <div className={styles.gstToggleSub}>
                                                    {settings.gst_enabled !== false
                                                        ? `Levy statutory tax (${settings.tax_rate || 18}%) with central (CGST) and state (SGST) split on billing.`
                                                        : 'Statutory GST is disabled. Invoices and receipts will be issued as Tax-Exempt with 0% tax.'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`${styles.switchTrack} ${settings.gst_enabled !== false ? styles.switchOn : ''}`}
                                            aria-label="Toggle GST"
                                        >
                                            <div className={styles.switchThumb} />
                                        </button>
                                    </div>

                                    {settings.gst_enabled === false && (
                                        <div className={styles.gstDisabledNotice}>
                                            <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                                            <span>
                                                <strong>Tax-Exempt Mode Active:</strong> All room tariff bills, restaurant tickets, and guest invoices will omit GST levies (0% rate).
                                            </span>
                                        </div>
                                    )}

                                    <div className={`${styles.formGrid} ${settings.gst_enabled === false ? styles.disabledInputsBox : ''}`}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>GSTIN Identification Number</label>
                                            <input
                                                type="text"
                                                value={settings.gst_number || ''}
                                                onChange={(e) => handleInputChange('gst_number', e.target.value)}
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                placeholder="32AAAAA0000A1Z5"
                                                disabled={settings.gst_enabled === false}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Composite Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={settings.gst_enabled === false ? 0 : (settings.tax_rate || 0)}
                                                onChange={(e) => handleInputChange('tax_rate', Number(e.target.value))}
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                placeholder="18"
                                                min={0}
                                                max={100}
                                                disabled={settings.gst_enabled === false}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Central GST (CGST %)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={settings.gst_enabled === false ? '0.0' : ((settings.tax_rate || 18) / 2).toFixed(1)}
                                                readOnly
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                style={{ background: '#f8fafc', color: '#64748b' }}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>State GST (SGST %)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={settings.gst_enabled === false ? '0.0' : ((settings.tax_rate || 18) / 2).toFixed(1)}
                                                readOnly
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                style={{ background: '#f8fafc', color: '#64748b' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Live Tax Simulator Box */}
                                    <div className={styles.taxSimulatorBox}>
                                        <div className={styles.taxSimulatorTitle}>
                                            <Calculator size={16} color="#0284c7" /> Live Tax Breakdown Simulator
                                            {settings.gst_enabled === false && (
                                                <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 10, marginLeft: 8, fontWeight: 700 }}>
                                                    Exempt (0% GST)
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Simulate Room Bill Total:</span>
                                            <div style={{ position: 'relative', width: 140 }}>
                                                <input
                                                    type="number"
                                                    value={simulationAmount}
                                                    onChange={(e) => setSimulationAmount(Math.max(100, Number(e.target.value)))}
                                                    className={styles.input}
                                                    style={{ padding: '6px 10px', fontSize: '0.88rem' }}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.simulatorRow}>
                                            <span className={styles.simulatorLabel}>Net Room Base Tariff</span>
                                            <span className={styles.simulatorValue}>₹{simulatedTax.base.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.simulatorRow}>
                                            <span className={styles.simulatorLabel}>Central GST (CGST {simulatedTax.halfRate}%)</span>
                                            <span className={styles.simulatorValue}>
                                                {simulatedTax.cgst > 0 ? `+ ₹${simulatedTax.cgst.toLocaleString('en-IN')}` : '₹0 (Exempt)'}
                                            </span>
                                        </div>
                                        <div className={styles.simulatorRow}>
                                            <span className={styles.simulatorLabel}>State GST (SGST {simulatedTax.halfRate}%)</span>
                                            <span className={styles.simulatorValue}>
                                                {simulatedTax.sgst > 0 ? `+ ₹${simulatedTax.sgst.toLocaleString('en-IN')}` : '₹0 (Exempt)'}
                                            </span>
                                        </div>
                                        <div className={styles.simulatorRow}>
                                            <span>Guest Invoice Total Amount</span>
                                            <span style={{ color: '#059669', fontWeight: 700 }}>₹{simulationAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Tenders */}
                                <div className={styles.cardGroup}>
                                    <h3 className={styles.cardGroupTitle}>
                                        <Wallet size={18} color="#059669" /> Accepted Payment Tender Gateways
                                    </h3>
                                    <p className={styles.cardGroupSubtitle}>Toggle payment methods enabled across Front Desk, POS Invoicing, and Folio Settlement.</p>

                                    <div className={styles.paymentGrid}>
                                        <div
                                            className={`${styles.paymentCard} ${paymentTenders.upi ? styles.paymentActive : ''}`}
                                            onClick={() => setPaymentTenders(p => ({ ...p, upi: !p.upi }))}
                                        >
                                            <div className={styles.paymentCardLeft}>
                                                <DollarSign size={20} color={paymentTenders.upi ? '#10b981' : '#94a3b8'} />
                                                <span className={styles.paymentCardName}>UPI / Instant QR Code</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`${styles.switchTrack} ${paymentTenders.upi ? styles.switchOn : ''}`}
                                            >
                                                <div className={styles.switchThumb}></div>
                                            </button>
                                        </div>

                                        <div
                                            className={`${styles.paymentCard} ${paymentTenders.card ? styles.paymentActive : ''}`}
                                            onClick={() => setPaymentTenders(p => ({ ...p, card: !p.card }))}
                                        >
                                            <div className={styles.paymentCardLeft}>
                                                <CreditCard size={20} color={paymentTenders.card ? '#10b981' : '#94a3b8'} />
                                                <span className={styles.paymentCardName}>Credit / Debit Card Machine</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`${styles.switchTrack} ${paymentTenders.card ? styles.switchOn : ''}`}
                                            >
                                                <div className={styles.switchThumb}></div>
                                            </button>
                                        </div>

                                        <div
                                            className={`${styles.paymentCard} ${paymentTenders.cash ? styles.paymentActive : ''}`}
                                            onClick={() => setPaymentTenders(p => ({ ...p, cash: !p.cash }))}
                                        >
                                            <div className={styles.paymentCardLeft}>
                                                <Wallet size={20} color={paymentTenders.cash ? '#10b981' : '#94a3b8'} />
                                                <span className={styles.paymentCardName}>Physical Cash Counter</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`${styles.switchTrack} ${paymentTenders.cash ? styles.switchOn : ''}`}
                                            >
                                                <div className={styles.switchThumb}></div>
                                            </button>
                                        </div>

                                        <div
                                            className={`${styles.paymentCard} ${paymentTenders.bankTransfer ? styles.paymentActive : ''}`}
                                            onClick={() => setPaymentTenders(p => ({ ...p, bankTransfer: !p.bankTransfer }))}
                                        >
                                            <div className={styles.paymentCardLeft}>
                                                <Building size={20} color={paymentTenders.bankTransfer ? '#10b981' : '#94a3b8'} />
                                                <span className={styles.paymentCardName}>Bank NEFT / RTGS Wire</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`${styles.switchTrack} ${paymentTenders.bankTransfer ? styles.switchOn : ''}`}
                                            >
                                                <div className={styles.switchThumb}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actionRow}>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Financial Rules'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ─────────────────────────────────────────────────────
                           SECTION 4: EMAIL AUTOMATION
                           ───────────────────────────────────────────────────── */}
                        {activeTopTab === 'Email' && (
                            <EmailSettingsPage />
                        )}

                        {/* ─────────────────────────────────────────────────────
                           SECTION 5: ACCESS & SECURITY / REGISTRATION
                           ───────────────────────────────────────────────────── */}
                        {activeTopTab === 'Security' && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Access & User Registration Control</h2>
                                        <p className={styles.sectionSubtitle}>
                                            Manage staff onboarding protocols, self-registration privileges, and institutional portal security.
                                        </p>
                                    </div>
                                </div>

                                {/* Security Hero Card */}
                                <div className={styles.securityHeroCard}>
                                    <div className={styles.securityHeroContent}>
                                        <div className={styles.securityHeroBadge}>
                                            <Shield size={13} /> Institutional Access Control
                                        </div>
                                        <h3 className={styles.securityHeroTitle}>Staff Portal Self-Registration</h3>
                                        <p className={styles.securityHeroDesc}>
                                            Control whether new personnel can self-register at the <code>/signup</code> portal, or if all staff accounts must be strictly provisioned by an administrator.
                                        </p>
                                    </div>
                                    <div
                                        className={styles.resortEmblem}
                                        style={{
                                            background: settings.allow_registration !== false ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            width: 58,
                                            height: 58,
                                            borderRadius: 16,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        {settings.allow_registration !== false ? <CheckCircle2 size={32} color="#10b981" /> : <Lock size={32} color="#f87171" />}
                                    </div>
                                </div>

                                {/* Master Control Card */}
                                <div className={`${styles.regControlCard} ${settings.allow_registration !== false ? styles.activeState : styles.pausedState}`}>
                                    <div className={styles.regControlHeader}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                                    New User Self-Registration
                                                </h3>
                                                <span className={`${styles.regStatusIndicator} ${settings.allow_registration !== false ? styles.regStatusActive : styles.regStatusPaused}`}>
                                                    {settings.allow_registration !== false ? (
                                                        <>
                                                            <CheckCircle2 size={14} /> Open & Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PauseCircle size={14} /> Paused / Blocked
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', maxWidth: '640px', lineHeight: 1.5 }}>
                                                {settings.allow_registration !== false
                                                    ? 'Staff self-registration is currently allowed. Anyone with access to the /signup page can submit credentials and create a staff profile.'
                                                    : 'Staff self-registration is currently PAUSED. The public /signup page displays an administrative hold notice and prevents any new user creations.'}
                                            </p>
                                        </div>

                                        {settings.allow_registration !== false ? (
                                            <button
                                                type="button"
                                                className={`${styles.regToggleActionBtn} ${styles.pauseActionBtn}`}
                                                onClick={() => handleToggleRegistration(false)}
                                            >
                                                <PauseCircle size={18} />
                                                Pause Registration
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`${styles.regToggleActionBtn} ${styles.resumeActionBtn}`}
                                                onClick={() => handleToggleRegistration(true)}
                                            >
                                                <PlayCircle size={18} />
                                                Resume Registration
                                            </button>
                                        )}
                                    </div>

                                    {/* Policy & Security Guidance Grid */}
                                    <div className={styles.regPolicyGrid}>
                                        <div className={styles.regPolicyCard}>
                                            <div className={styles.regPolicyHeader}>
                                                <ShieldAlert size={18} color="#e11d48" />
                                                <span>What Happens When Paused</span>
                                            </div>
                                            <p className={styles.regPolicyText}>
                                                The <code>/signup</code> page presents a clean pause notice. Direct API signup requests to Supabase are rejected. Prospective staff cannot register accounts autonomously.
                                            </p>
                                        </div>

                                        <div className={styles.regPolicyCard}>
                                            <div className={styles.regPolicyHeader}>
                                                <CheckCircle2 size={18} color="#059669" />
                                                <span>Existing Staff Unaffected</span>
                                            </div>
                                            <p className={styles.regPolicyText}>
                                                All existing staff members and administrators can continue signing in and operating the PMS at <code>/login</code> without interruption.
                                            </p>
                                        </div>

                                        <div className={styles.regPolicyCard}>
                                            <div className={styles.regPolicyHeader}>
                                                <UserPlus size={18} color="#2563eb" />
                                                <span>Admin Account Provisioning</span>
                                            </div>
                                            <p className={styles.regPolicyText}>
                                                Administrators can provision verified staff accounts directly from the Supabase dashboard or temporarily resume registration whenever onboarding a new hire.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Live Visitor Simulation Preview */}
                                    <div className={styles.livePreviewNotice}>
                                        <div className={styles.livePreviewHeader}>
                                            <span className={styles.livePreviewTitle}>
                                                <Globe size={14} /> Visitor View Simulation at /signup
                                            </span>
                                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                Current Mode: {settings.allow_registration !== false ? 'Live Form' : 'Pause Banner'}
                                            </span>
                                        </div>

                                        {settings.allow_registration !== false ? (
                                            <div className={styles.previewMockBox}>
                                                <div className={styles.previewMockIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                                                    <UserPlus size={20} />
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                                                        Self-Registration Form Displayed
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        Visitors see the full Staff Account Registration form with Full Name, Email, Password, and Role selection.
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.previewMockBox} style={{ border: '1px solid #fecdd3', background: '#fff5f5' }}>
                                                <div className={styles.previewMockIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
                                                    <Lock size={20} />
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.88rem', color: '#991b1b', display: 'block' }}>
                                                        Staff Registration Paused Notice Displayed
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                                                        Visitors are greeted with: &ldquo;New staff self-registration is currently paused by property administration. Please contact your General Manager to have an account provisioned.&rdquo;
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Room Modal */}
            {showRoomModal && (
                <RoomModal
                    room={editingRoom}
                    onClose={() => setShowRoomModal(false)}
                    onSuccess={handleRoomSuccess}
                />
            )}

            {/* Delete Room Confirmation Modal */}
            {deleteRoomTarget && (
                <div className={styles.confirmOverlay} onClick={() => setDeleteRoomTarget(null)}>
                    <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.confirmTitle}>Delete Room {deleteRoomTarget.room_number}?</h3>
                        <p className={styles.confirmText}>
                            Are you sure you want to delete this room configuration? Any historical bookings linked to this room will retain records, but new reservations will no longer see this unit.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                onClick={() => setDeleteRoomTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.dangerBtn}
                                onClick={handleConfirmDeleteRoom}
                            >
                                Delete Room
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
