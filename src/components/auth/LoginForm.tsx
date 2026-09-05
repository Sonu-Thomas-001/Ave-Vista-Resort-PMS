'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import styles from '@/app/(auth)/login/page.module.css';

interface LoginFormProps {
    onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!email || !password) {
            setError('Please enter both your email address and password.');
            setIsSubmitting(false);
            return;
        }

        try {
            const errorMsg = await login(email, password);
            if (errorMsg) {
                setError(errorMsg);
            }
        } catch (err: any) {
            setError(err?.message || 'An unexpected error occurred during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <label htmlFor="login-email" className={styles.label}>
                    Institutional Email
                </label>
                <div className={styles.inputWrapper}>
                    <Mail className={styles.icon} size={18} />
                    <input
                        id="login-email"
                        type="email"
                        className={styles.input}
                        placeholder="officer@avevistaresort.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="login-password" className={styles.label}>
                    Security Passkey
                </label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.icon} size={18} />
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.actions}>
                <label className={styles.remember}>
                    <input type="checkbox" defaultChecked />
                    <span>Remember this device</span>
                </label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                    Forgot Password?
                </Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                    'Authenticating...'
                ) : (
                    <>
                        Sign In to Workspace
                        <ArrowRight size={16} />
                    </>
                )}
            </button>

            {onSwitchToSignup && (
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.9rem'
                        }}
                        onClick={onSwitchToSignup}
                    >
                        Create Account
                    </button>
                </div>
            )}
        </form>
    );
}
