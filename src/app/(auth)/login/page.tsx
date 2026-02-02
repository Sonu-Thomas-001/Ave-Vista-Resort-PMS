'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
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
            setError('Please enter both email and password.');
            setIsSubmitting(false);
            return;
        }

        try {
            const errorMsg = await login(email, password);
            if (errorMsg) {
                setError(errorMsg);
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.brandHeader}>
                    <Image
                        src="/logo.png"
                        alt="Ave Vista Resort"
                        width={180}
                        height={80}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                    <p className={styles.subtitle}>Property Management System</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.icon} size={20} />
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.icon} size={20} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Protected by Ave Vista Secure Auth</p>
                    <div className={styles.links}>
                        <span>Help</span>
                        <span>Privacy</span>
                        <span>Terms</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <p>Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link></p>
            </div>

            <div className={styles.credentialsHint}>
                <p><strong>Demo Credentials:</strong></p>
                <p>Admin: admin@avevista.com / admin123</p>
                <p>Manager: manager@avevista.com / manager123</p>
            </div>
        </div>
    );
}
