'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Lock, Camera, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    // Personal Info State
    const [fullName, setFullName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                }
            });

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="My Profile" />

            <div className={styles.container}>
                <div className={styles.layout}>
                    {/* Back Button */}
                    <button
                        className={styles.backBtn}
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    {/* Profile Header */}
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarLarge}>
                                {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <button className={styles.uploadBtn}>
                                <Camera size={16} />
                                Change Photo
                            </button>
                        </div>
                        <div className={styles.headerInfo}>
                            <h2>{user?.name || 'User'}</h2>
                            <p className={styles.role}>
                                <Shield size={16} />
                                {user?.role || 'User'}
                            </p>
                            <p className={styles.email}>
                                <Mail size={16} />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'personal' ? styles.active : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <User size={18} />
                            Personal Information
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={18} />
                            Security
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className={styles.content}>
                        {activeTab === 'personal' && (
                            <form onSubmit={handleUpdateProfile} className={styles.section}>
                                <h3>Personal Information</h3>
                                <p className={styles.subtitle}>Update your personal details and information.</p>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            className={styles.input}
                                            disabled
                                            title="Email cannot be changed"
                                        />
                                        <small className={styles.hint}>Email cannot be changed</small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Role</label>
                                        <input
                                            type="text"
                                            value={user?.role || 'User'}
                                            className={styles.input}
                                            disabled
                                        />
                                        <small className={styles.hint}>Contact admin to change role</small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>User ID</label>
                                        <input
                                            type="text"
                                            value={user?.id || ''}
                                            className={styles.input}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className={styles.actionRow}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={styles.primaryBtn}
                                    >
                                        <Save size={16} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleChangePassword} className={styles.section}>
                                <h3>Change Password</h3>
                                <p className={styles.subtitle}>Ensure your account is using a strong password.</p>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={styles.input}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={styles.input}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <small className={styles.hint}>Minimum 6 characters</small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={styles.input}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.actionRow}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={styles.primaryBtn}
                                    >
                                        <Lock size={16} />
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
