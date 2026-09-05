'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthFooter from '@/components/AuthFooter';
import styles from '../forgot-password/page.module.css';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('New password must contain at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please verify.');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password
            });

            if (updateError) {
                throw updateError;
            }

            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || 'Unable to update password. Your session may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.recoveryCard}>
                <div className={styles.emblemWrapper}>
                    <div className={styles.emblemSquircle}>
                        <Lock size={28} />
                    </div>
                </div>

                <h1 className={styles.title}>Set New Passkey</h1>
                <p className={styles.subtitle}>
                    Enter your new secure passkey to regain access to your Ave Vista PMS workspace.
                </p>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="new-password" className={styles.label}>
                                New Passkey
                            </label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirm-password" className={styles.label}>
                                Confirm New Passkey
                            </label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    id="confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Re-type new passkey"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className={styles.errorBanner}>
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                'Updating Passkey...'
                            ) : (
                                <>
                                    Set New Passkey
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className={styles.backRow}>
                            <Link href="/login" className={styles.backLink}>
                                <ArrowLeft size={16} />
                                Return to Sign In
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <CheckCircle2 size={36} />
                        </div>
                        <h2 className={styles.title} style={{ fontSize: '1.4rem' }}>Passkey Updated!</h2>
                        <p className={styles.successText}>
                            Your new password has been established securely. You may now sign in to Ave Vista PMS.
                        </p>
                        <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                            <ArrowRight size={16} />
                            Proceed to Sign In
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.footerWrapper}>
                <AuthFooter />
            </div>
        </div>
    );
}
