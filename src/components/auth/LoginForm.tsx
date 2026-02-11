'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import styles from '@/app/(auth)/login/page.module.css'; // Reuse existing form styles for inputs

export default function LoginForm() {
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
        <form onSubmit={handleSubmit} className={styles.form} style={{ width: '100%', maxWidth: '400px' }}>
            <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                    <Mail className={styles.icon} size={18} />
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.icon} size={18} />
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Enter your password"
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
    );
}
