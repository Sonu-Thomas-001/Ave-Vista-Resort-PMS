'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
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
                    <p className={styles.subtitle}>Password Recovery</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.icon} size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Send Reset Link
                        </button>

                        <div className={styles.actions} style={{ justifyContent: 'center', marginTop: '1rem' }}>
                            <Link href="/login" className={styles.forgotLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: '#DCFCE7', borderRadius: '50%', color: '#166534', marginBottom: '1.5rem' }}>
                            <CheckCircle size={48} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Check your email</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            We've sent a password reset link to <strong>{email}</strong>.
                        </p>
                        <Link href="/login" className={styles.submitBtn} style={{ display: 'block', textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                )}

                <div className={styles.footer}>
                    <p>Protected by Ave Vista Secure Auth</p>
                </div>
            </div>
        </div>
    );
}
