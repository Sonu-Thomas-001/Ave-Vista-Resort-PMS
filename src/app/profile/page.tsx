'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import {
    User,
    Mail,
    Shield,
    Lock,
    Save,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    KeyRound,
    Laptop,
    Building2,
    BadgeCheck,
    Briefcase,
    Clock,
    Sparkles,
    Sliders,
    Palette,
    Check,
    Phone,
    FileText,
    BedDouble,
    UtensilsCrossed,
    BarChart3,
    Settings as SettingsIcon,
    CalendarDays
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const AVATAR_PALETTES = [
    { name: 'Emerald', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.25)' },
    { name: 'Ocean', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', shadow: 'rgba(2, 132, 199, 0.25)' },
    { name: 'Violet', bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: 'rgba(139, 92, 246, 0.25)' },
    { name: 'Amber', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.25)' },
    { name: 'Rose', bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', shadow: 'rgba(244, 63, 94, 0.25)' }
];

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions' | 'preferences'>('profile');
    const [loading, setLoading] = useState(false);

    // Profile Fields
    const [fullName, setFullName] = useState(user?.name || '');
    const [phone, setPhone] = useState('+91 98470 12345');
    const [department, setDepartment] = useState('Executive Management');
    const [employeeId, setEmployeeId] = useState('AV-2024-ADM01');
    const [bio, setBio] = useState('Senior Resort Administrator oversee front office, billing, rooms inventory, and restaurant operations at Ave Vista Resort.');
    const [selectedPalette, setSelectedPalette] = useState(0);

    // Security & Password Fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Preferences Fields
    const [defaultLanding, setDefaultLanding] = useState('/dashboard');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [vipArrivals, setVipArrivals] = useState(true);

    // Toast Notification
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    // Load initial metadata from Supabase user session
    useEffect(() => {
        const loadUserMetadata = async () => {
            try {
                const { data: { user: sbUser } } = await supabase.auth.getUser();
                if (sbUser) {
                    const meta = sbUser.user_metadata || {};
                    if (meta.full_name) setFullName(meta.full_name);
                    else if (user?.name) setFullName(user.name);

                    if (meta.phone) setPhone(meta.phone);
                    if (meta.department) setDepartment(meta.department);
                    if (meta.employee_id) setEmployeeId(meta.employee_id);
                    if (meta.bio) setBio(meta.bio);
                    if (typeof meta.avatar_palette === 'number') setSelectedPalette(meta.avatar_palette);
                    if (meta.default_landing) setDefaultLanding(meta.default_landing);
                    if (typeof meta.email_alerts === 'boolean') setEmailAlerts(meta.email_alerts);
                    if (typeof meta.vip_arrivals === 'boolean') setVipArrivals(meta.vip_arrivals);
                }
            } catch (err) {
                console.error('Failed to load user metadata:', err);
            }
        };

        loadUserMetadata();
    }, [user]);

    // Password strength computation
    const calculateStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0 to 4
    };

    const passScore = calculateStrength(newPassword);

    const getStrengthLabel = (score: number) => {
        if (!newPassword) return { text: 'Empty', color: '#94a3b8' };
        if (score <= 1) return { text: 'Weak', color: '#ef4444' };
        if (score <= 3) return { text: 'Good', color: '#f59e0b' };
        return { text: 'Very Strong', color: '#10b981' };
    };

    const strengthInfo = getStrengthLabel(passScore);

    // Profile Save Handler
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone,
                    department,
                    employee_id: employeeId,
                    bio,
                    avatar_palette: selectedPalette,
                    default_landing: defaultLanding,
                    email_alerts: emailAlerts,
                    vip_arrivals: vipArrivals,
                }
            });

            if (error) throw error;
            showToast('Staff profile details saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Password Change Handler
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            showToast('Password must contain at least 6 characters.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match. Please verify.', 'error');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showToast('Password updated securely!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            showToast(error.message || 'Failed to change password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const currentRole = user?.role || 'Admin';

    // Permissions list based on role
    const permissions = [
        {
            title: 'Front Desk & Reservations',
            icon: CalendarDays,
            desc: 'Check-in/out guests, allocate luxury suites, create reservations, and manage folios.',
            access: 'Full Access',
            isFull: true
        },
        {
            title: 'Room Inventory & Pricing Overrides',
            icon: BedDouble,
            desc: 'Configure room types, maintain real-time status, manage custom rates and blockades.',
            access: 'Full Access',
            isFull: true
        },
        {
            title: 'Restaurant POS & In-Room Dining',
            icon: UtensilsCrossed,
            desc: 'Process guest dine-in checks, room bill transfers, KOT order tickets, and menu items.',
            access: 'Full Access',
            isFull: true
        },
        {
            title: 'Financial Reports & Executive Analytics',
            icon: BarChart3,
            desc: 'Audit revenue streams, tax summaries, ADR, RevPAR, and occupancy trend analytics.',
            access: currentRole === 'Admin' ? 'Full Access' : (currentRole === 'Manager' ? 'Manager View' : 'Restricted'),
            isFull: currentRole === 'Admin'
        },
        {
            title: 'System Categories & Resort Configuration',
            icon: SettingsIcon,
            desc: 'Configure tax structures (GST 12%/18%), room amenities, bed categories, and system logs.',
            access: currentRole === 'Admin' ? 'Full Access' : 'View Only',
            isFull: currentRole === 'Admin'
        },
        {
            title: 'Security & Staff Directory Audit',
            icon: Shield,
            desc: 'Manage staff credentials, role assignments, security sessions, and administrative rights.',
            access: currentRole === 'Admin' ? 'Full Access' : 'Personal Only',
            isFull: currentRole === 'Admin'
        }
    ];

    const avatarInitials = (fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className={styles.pageWrapper}>
            <Header title="My Profile" />

            <div className={styles.container}>
                {/* Top Nav Row */}
                <div className={styles.topNavRow}>
                    <button
                        className={styles.backBtn}
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={16} />
                        Back to Workspace
                    </button>

                    <div className={styles.securityPill}>
                        <span className={styles.pulseDot} />
                        Active Staff Session • TLS 1.3 Verified
                    </div>
                </div>

                {/* Executive Profile Hero Banner */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroLeft}>
                        <div className={styles.avatarContainer}>
                            <div
                                className={styles.avatarCircle}
                                style={{
                                    background: AVATAR_PALETTES[selectedPalette].bg,
                                    boxShadow: `0 10px 24px ${AVATAR_PALETTES[selectedPalette].shadow}`
                                }}
                            >
                                {avatarInitials}
                            </div>
                            <button
                                className={styles.avatarBadgeBtn}
                                title="Cycle Avatar Theme Palette"
                                onClick={() => setSelectedPalette((prev) => (prev + 1) % AVATAR_PALETTES.length)}
                            >
                                <Palette size={18} />
                            </button>
                        </div>

                        <div className={styles.heroDetails}>
                            <div className={styles.heroTagRow}>
                                <span className={styles.roleTag}>
                                    <Shield size={13} />
                                    {currentRole === 'Admin' ? 'Executive Administrator' : `${currentRole} Lead`}
                                </span>
                                <span className={styles.propertyTag}>
                                    <Building2 size={13} />
                                    Ave Vista Resort & Spa
                                </span>
                            </div>

                            <h1 className={styles.heroName}>
                                {fullName || user?.name || 'Resort Officer'}
                            </h1>

                            <div className={styles.heroMetaRow}>
                                <span className={styles.heroMetaItem}>
                                    <Mail size={15} />
                                    {user?.email || 'officer@avevistaresort.com'}
                                </span>
                                <span className={styles.heroMetaItem}>
                                    <Briefcase size={15} />
                                    {department}
                                </span>
                                <span className={styles.heroMetaItem}>
                                    <BadgeCheck size={15} />
                                    ID: {employeeId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.heroRightStats}>
                        <div className={styles.statCard}>
                            <span className={styles.statCardLabel}>Security Score</span>
                            <span className={styles.statCardValue}>98%</span>
                            <span className={styles.statCardSub}>Strong Credentials</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statCardLabel}>Session State</span>
                            <span className={styles.statCardValue}>Active</span>
                            <span className={styles.statCardSub}>Encrypted Web</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statCardLabel}>Access Level</span>
                            <span className={styles.statCardValue}>Level 1</span>
                            <span className={styles.statCardSub}>{currentRole} Clearance</span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} />
                        Staff Profile & Info
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} />
                        Security & Credentials
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'permissions' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('permissions')}
                    >
                        <Shield size={18} />
                        Access & Privileges Matrix
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <Sliders size={18} />
                        App Preferences
                    </button>
                </div>

                {/* Tab 1: Staff Profile & Contact Info */}
                {activeTab === 'profile' && (
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardHeaderTitle}>Staff Profile & Contact Details</h2>
                                <p className={styles.cardHeaderSub}>
                                    Manage your official Ave Vista resort identity, contact channels, and department assignment.
                                </p>
                            </div>
                            <span className={styles.badgePill}>
                                <BadgeCheck size={14} color="#10b981" />
                                Verified Staff Member
                            </span>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Full Name
                                        <span className={styles.formLabelHint}>Official Records</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <User size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.inputField}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your legal full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Resort Email
                                        <span className={styles.formLabelHint}>Primary Auth Account</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Mail size={18} className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            className={styles.inputField}
                                            value={user?.email || ''}
                                            disabled
                                            title="Email is verified via Supabase Auth and cannot be changed here."
                                        />
                                    </div>
                                    <span className={styles.fieldHelpText}>
                                        Contact system administrator to modify your institutional login email.
                                    </span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Direct Contact Phone
                                        <span className={styles.formLabelHint}>Duty Communication</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Phone size={18} className={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            className={styles.inputField}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98470 00000"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Staff ID / Badge #
                                        <span className={styles.formLabelHint}>Property Identifier</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <BadgeCheck size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.inputField}
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            placeholder="e.g. AV-2024-ADM01"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Department Assignment
                                        <span className={styles.formLabelHint}>Operational Unit</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Building2 size={18} className={styles.inputIcon} />
                                        <select
                                            className={styles.inputField}
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                        >
                                            <option value="Executive Management">Executive Management</option>
                                            <option value="Front Desk Operations">Front Desk Operations</option>
                                            <option value="Housekeeping & Facility">Housekeeping & Facility</option>
                                            <option value="Food & Beverage (F&B)">Food & Beverage (F&B)</option>
                                            <option value="Finance & Accounts">Finance & Accounts</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Assigned System Role
                                        <span className={styles.formLabelHint}>Security Clearance</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Shield size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.inputField}
                                            value={user?.role || 'Admin'}
                                            disabled
                                        />
                                    </div>
                                    <span className={styles.fieldHelpText}>
                                        Role clearance determines which PMS tabs and actions are accessible.
                                    </span>
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                                    <label className={styles.formLabel}>
                                        Staff Bio & Operational Responsibilities
                                    </label>
                                    <textarea
                                        className={styles.textareaField}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Brief description of your operational responsibilities at Ave Vista..."
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                                    <label className={styles.formLabel}>
                                        Personalize Avatar Gradient Theme
                                    </label>
                                    <div className={styles.paletteRow}>
                                        <span className={styles.paletteLabel}>Preset Palette:</span>
                                        {AVATAR_PALETTES.map((pal, idx) => (
                                            <button
                                                key={pal.name}
                                                type="button"
                                                className={`${styles.paletteColorBtn} ${selectedPalette === idx ? styles.paletteColorBtnActive : ''}`}
                                                style={{ background: pal.bg }}
                                                title={pal.name}
                                                onClick={() => setSelectedPalette(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actionBar}>
                                <button
                                    type="button"
                                    className={styles.resetBtn}
                                    onClick={() => {
                                        setFullName(user?.name || '');
                                        setPhone('+91 98470 12345');
                                    }}
                                >
                                    Revert Changes
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={loading}
                                >
                                    <Save size={16} />
                                    {loading ? 'Saving Profile...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 2: Security & Credentials */}
                {activeTab === 'security' && (
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardHeaderTitle}>Security & Credentials</h2>
                                <p className={styles.cardHeaderSub}>
                                    Update your access passkey and review real-time security device parameters.
                                </p>
                            </div>
                            <span className={styles.badgePill}>
                                <KeyRound size={14} color="#10b981" />
                                256-Bit Encrypted
                            </span>
                        </div>

                        <form onSubmit={handleChangePassword}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        New Passkey / Password
                                        <span className={styles.formLabelHint}>Min. 6 characters</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Lock size={18} className={styles.inputIcon} />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className={styles.inputField}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter strong new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.inputEndBtn}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Confirm New Passkey
                                        <span className={styles.formLabelHint}>Match verification</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <Lock size={18} className={styles.inputIcon} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className={styles.inputField}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-type new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.inputEndBtn}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className={styles.strengthMeterContainer}>
                                    <div className={styles.strengthLabel}>
                                        <span>Password Strength:</span>
                                        <span style={{ color: strengthInfo.color }}>{strengthInfo.text}</span>
                                    </div>
                                    <div className={styles.strengthBarWrap}>
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={styles.strengthSegment}
                                                style={{
                                                    background: passScore >= step ? strengthInfo.color : '#e2e8f0'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Requirements Checklist */}
                            <div className={styles.reqList}>
                                <div className={`${styles.reqItem} ${newPassword.length >= 6 ? styles.reqItemActive : ''}`}>
                                    {newPassword.length >= 6 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    At least 6 characters in length
                                </div>
                                <div className={`${styles.reqItem} ${/[A-Z]/.test(newPassword) ? styles.reqItemActive : ''}`}>
                                    {/[A-Z]/.test(newPassword) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    Contains uppercase letter (A-Z)
                                </div>
                                <div className={`${styles.reqItem} ${/[0-9]/.test(newPassword) ? styles.reqItemActive : ''}`}>
                                    {/[0-9]/.test(newPassword) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    Contains number (0-9)
                                </div>
                                <div className={`${styles.reqItem} ${newPassword && newPassword === confirmPassword ? styles.reqItemActive : ''}`}>
                                    {newPassword && newPassword === confirmPassword ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    Passwords match exactly
                                </div>
                            </div>

                            <div className={styles.actionBar}>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                                >
                                    <Lock size={16} />
                                    {loading ? 'Updating Credentials...' : 'Update Password'}
                                </button>
                            </div>
                        </form>

                        {/* Active Session Card */}
                        <div className={styles.deviceSessionCard}>
                            <div className={styles.deviceInfoLeft}>
                                <div className={styles.deviceIconCircle}>
                                    <Laptop size={22} />
                                </div>
                                <div>
                                    <h4 className={styles.deviceDetailsTitle}>Current Active Session • Windows Web Browser</h4>
                                    <p className={styles.deviceDetailsSub}>
                                        Connected via HTTPS • Supabase JWT Session active • Calicut, India
                                    </p>
                                </div>
                            </div>
                            <span className={styles.securityPill}>
                                <Check size={14} /> Current Device
                            </span>
                        </div>
                    </div>
                )}

                {/* Tab 3: Access & Privileges Matrix */}
                {activeTab === 'permissions' && (
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardHeaderTitle}>Module Access & Authorization Matrix</h2>
                                <p className={styles.cardHeaderSub}>
                                    Role-based access matrix and privileges for <strong>{currentRole}</strong> accounts across Ave Vista PMS.
                                </p>
                            </div>
                            <span className={styles.badgePill}>
                                <Shield size={14} color="#10b981" />
                                Role: {currentRole}
                            </span>
                        </div>

                        <div className={styles.permissionsGrid}>
                            {permissions.map((perm) => {
                                const IconComp = perm.icon;
                                return (
                                    <div key={perm.title} className={styles.permissionCard}>
                                        <div className={styles.permissionIconBox}>
                                            <IconComp size={22} />
                                        </div>
                                        <div className={styles.permissionInfo}>
                                            <div className={styles.permissionTitleRow}>
                                                <h4 className={styles.permissionTitle}>{perm.title}</h4>
                                                <span className={`${styles.accessPill} ${perm.isFull ? styles.accessPillFull : styles.accessPillView}`}>
                                                    {perm.access}
                                                </span>
                                            </div>
                                            <p className={styles.permissionDesc}>{perm.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.roleExplanationCard}>
                            <Shield size={24} />
                            <div className={styles.roleExplanationText}>
                                <strong>Role Clearance Policy:</strong> Administrative clearances are assigned via the resort governance team.
                                All audit activities are recorded with your unique staff signature (<code>{user?.id?.slice(0, 8) || 'AV-AUTH'}</code>) for compliance.
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: App Preferences */}
                {activeTab === 'preferences' && (
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardHeaderTitle}>Application & Display Preferences</h2>
                                <p className={styles.cardHeaderSub}>
                                    Tailor your workstation defaults, currency formatting, and automated notification alerts.
                                </p>
                            </div>
                            <span className={styles.badgePill}>
                                <Sliders size={14} color="#10b981" />
                                Workstation Settings
                            </span>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className={styles.preferenceList}>
                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceText}>
                                        <h4 className={styles.preferenceTitle}>Default Landing Page</h4>
                                        <p className={styles.preferenceDesc}>Choose the view that opens automatically upon signing in.</p>
                                    </div>
                                    <select
                                        className={styles.preferenceSelect}
                                        value={defaultLanding}
                                        onChange={(e) => setDefaultLanding(e.target.value)}
                                    >
                                        <option value="/dashboard">Executive Dashboard</option>
                                        <option value="/rooms">Room Inventory & Cards</option>
                                        <option value="/restaurant">Restaurant POS & Dining</option>
                                        <option value="/reports">Reports & Financial Analytics</option>
                                        <option value="/settings">Resort Settings & Tax Config</option>
                                    </select>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceText}>
                                        <h4 className={styles.preferenceTitle}>Currency & Financial Standard</h4>
                                        <p className={styles.preferenceDesc}>Currency display applied to folios, tariffs, and receipts.</p>
                                    </div>
                                    <span className={styles.badgePill}>
                                        INR (₹) • Indian Rupee
                                    </span>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceText}>
                                        <h4 className={styles.preferenceTitle}>Night Audit Summary Alerts</h4>
                                        <p className={styles.preferenceDesc}>Receive nightly reconciliation summaries and occupancy reports via email.</p>
                                    </div>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={emailAlerts}
                                            onChange={(e) => setEmailAlerts(e.target.checked)}
                                        />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceText}>
                                        <h4 className={styles.preferenceTitle}>VIP Arrival Real-Time Notifications</h4>
                                        <p className={styles.preferenceDesc}>Instant banner notifications when Platinum or Suite guests check in.</p>
                                    </div>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={vipArrivals}
                                            onChange={(e) => setVipArrivals(e.target.checked)}
                                        />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                </div>
                            </div>

                            <div className={styles.actionBar}>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={loading}
                                >
                                    <Save size={16} />
                                    {loading ? 'Saving Preferences...' : 'Save Preferences'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Custom Toast Alert */}
            {toast && (
                <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {toast.type === 'success' ? (
                        <CheckCircle2 size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span className={styles.toastMessage}>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
