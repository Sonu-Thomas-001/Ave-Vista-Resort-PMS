'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
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
                    <p className={styles.subtitle}>Set New Password</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>New Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.icon} size={20} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.icon} size={20} />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Reset Password
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: '#DCFCE7', borderRadius: '50%', color: '#166534', marginBottom: '1.5rem' }}>
                            <CheckCircle size={48} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Password Reset Successful</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            You can now login with your new password.
                        </p>
                        <Link href="/login" className={styles.submitBtn} style={{ display: 'block', textDecoration: 'none' }}>
                            Login Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
