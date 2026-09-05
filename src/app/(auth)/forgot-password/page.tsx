'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Shield, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthFooter from '@/components/AuthFooter';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Please enter your institutional email address.');
            return;
        }

        setLoading(true);

        try {
            const redirectTo = typeof window !== 'undefined'
                ? `${window.location.origin}/reset-password`
                : undefined;

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo
            });

            if (resetError) {
                throw resetError;
            }

            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Password reset request error:', err);
            setError(err.message || 'Unable to send recovery email. Please check the address and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.recoveryCard}>
                {/* Security Emblem */}
                <div className={styles.emblemWrapper}>
                    <div className={styles.emblemSquircle}>
                        <KeyRound size={28} />
                    </div>
                </div>

                <h1 className={styles.title}>Passkey Recovery</h1>
                <p className={styles.subtitle}>
                    Enter your registered institutional email to receive a verified access link to reset your Ave Vista PMS passkey.
                </p>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="recovery-email" className={styles.label}>
                                Institutional Email Address
                            </label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input
                                    id="recovery-email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="officer@avevistaresort.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    autoComplete="email"
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
                                'Sending Recovery Link...'
                            ) : (
                                <>
                                    Send Recovery Link
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

                        <div className={styles.securityNote}>
                            <Shield size={14} color="#0284c7" />
                            <span>256-Bit Encrypted Institutional Recovery</span>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <CheckCircle2 size={36} />
                        </div>
                        <h2 className={styles.title} style={{ fontSize: '1.4rem' }}>Recovery Email Dispatched</h2>
                        <p className={styles.successText}>
                            We&apos;ve sent recovery instructions to <strong>{email}</strong>.
                            Please check your inbox or spam folder and follow the secure link to set your new passkey.
                        </p>

                        <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                            <ArrowLeft size={16} />
                            Return to Sign In
                        </Link>

                        <button
                            type="button"
                            className={styles.resendBtn}
                            onClick={() => {
                                setIsSubmitted(false);
                            }}
                        >
                            Send to a Different Email
                        </button>
                    </div>
                )}
            </div>

            {/* Global Copyright Footer */}
            <div className={styles.footerWrapper}>
                <AuthFooter />
            </div>
        </div>
    );
}
