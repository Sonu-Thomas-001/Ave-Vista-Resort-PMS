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
    Calculator
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import EmailSettingsPage from './email/page';
import RoomModal from '@/components/RoomModal';
import { getPricingUnit } from '@/lib/constants';

type SettingsData = Database['public']['Tables']['app_settings']['Row'];
type RoomData = Database['public']['Tables']['rooms']['Row'];

const DEFAULT_SETTINGS: SettingsData = {
    id: 1,
    resort_name: 'Ave Vista Resort & Hotels',
    contact_email: 'avevistaresort@gmail.com',
    address: 'Near Old Toll Gate, Kumarakom Road, Kottayam, Kerala 686001',
    gst_number: '32AAAAA0000A1Z5',
    tax_rate: 18,
    updated_at: new Date().toISOString()
};

export default function SettingsPage() {
    const [activeTopTab, setActiveTopTab] = useState<'Property' | 'Rooms' | 'Finance' | 'Email'>('Property');
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
        try {
            const { data } = await supabase.from('app_settings').select('*').limit(1);
            if (data && data.length > 0) {
                setSettings(data[0]);
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setSettings(DEFAULT_SETTINGS);
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

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...settings,
                id: 1,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('app_settings')
                .upsert(payload);

            if (error) throw error;
            showToast('System configuration saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            showToast(error.message || 'Failed to save settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof SettingsData, value: string | number) => {
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
    }, [simulationAmount, settings.tax_rate]);

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
                            <span className={styles.heroStatValue}>{settings.tax_rate || 18}% Composite</span>
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
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>4 Modules</span>
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
                                    <h3 className={styles.cardGroupTitle}>
                                        <Percent size={18} color="#d97706" /> Statutory Goods & Services Tax (GST)
                                    </h3>
                                    <p className={styles.cardGroupSubtitle}>Applied automatically across guest room checkouts and restaurant dining receipts.</p>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>GSTIN Identification Number</label>
                                            <input
                                                type="text"
                                                value={settings.gst_number || ''}
                                                onChange={(e) => handleInputChange('gst_number', e.target.value)}
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                placeholder="32AAAAA0000A1Z5"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Composite Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={settings.tax_rate || 0}
                                                onChange={(e) => handleInputChange('tax_rate', Number(e.target.value))}
                                                className={`${styles.input} ${styles.inputNoIcon}`}
                                                placeholder="18"
                                                min={0}
                                                max={100}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Central GST (CGST %)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={((settings.tax_rate || 18) / 2).toFixed(1)}
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
                                                value={((settings.tax_rate || 18) / 2).toFixed(1)}
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
                                            <span className={styles.simulatorValue}>+ ₹{simulatedTax.cgst.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.simulatorRow}>
                                            <span className={styles.simulatorLabel}>State GST (SGST {simulatedTax.halfRate}%)</span>
                                            <span className={styles.simulatorValue}>+ ₹{simulatedTax.sgst.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={styles.simulatorRow}>
                                            <span>Guest Invoice Total Amount</span>
                                            <span style={{ color: '#059669' }}>₹{simulationAmount.toLocaleString('en-IN')}</span>
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
