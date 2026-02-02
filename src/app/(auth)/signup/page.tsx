'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff, ChevronDown } from 'lucide-react';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Manager'); // Default
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!email || !password || !fullName) {
            setError('Please fill in all fields.');
            setIsSubmitting(false);
            return;
        }

        try {
            const errorMsg = await signup(email, password, fullName, role);
            if (errorMsg) {
                setError(errorMsg);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An error occurred during sign up.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <div className={styles.brandHeader}>
                        <Image src="/logo.png" alt="Ave Vista" width={180} height={80} style={{ objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Account Created!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Please check your email to confirm your account, then login.
                    </p>
                    <Link href="/login" className={styles.submitBtn} style={{ display: 'block', textDecoration: 'none' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.brandHeader}>
                    <Image src="/logo.png" alt="Ave Vista" width={180} height={80} style={{ objectFit: 'contain' }} />
                    <p className={styles.subtitle}>Create New Account</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullname" className={styles.label}>Full Name</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.icon} size={20} />
                            <input
                                id="fullname"
                                type="text"
                                className={styles.input}
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.icon} size={20} />
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                placeholder="Create password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        <label htmlFor="role" className={styles.label}>Role</label>
                        <div className={styles.inputWrapper}>
                            <Briefcase className={styles.icon} size={20} />
                            <select
                                id="role"
                                className={`${styles.input} ${styles.select}`}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ backgroundColor: 'var(--background)' }}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Reception">Reception</option>

                            </select>
                            <div className={styles.selectArrow}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                        Already have an account? <Link href="/login" className={styles.forgotLink}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
