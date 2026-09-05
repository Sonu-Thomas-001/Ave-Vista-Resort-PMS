'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Shield, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from '@/app/(auth)/login/page.module.css';

interface SignupFormProps {
    onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Manager');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const roles = [
        { id: 'Manager', title: 'Manager' },
        { id: 'Admin', title: 'Admin' },
        { id: 'Reception', title: 'Reception' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!email || !password || !fullName) {
            setError('Please complete all required fields.');
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
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
        } catch (err: any) {
            setError(err?.message || 'An unexpected error occurred during account creation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successCard}>
                <div className={styles.successIconCircle}>
                    <CheckCircle2 size={36} />
                </div>
                <h3 className={styles.successTitle}>Account Created!</h3>
                <p className={styles.successText}>
                    Welcome to Ave Vista PMS. Your staff account for <strong>{email}</strong> has been registered.
                </p>
                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={onSwitchToLogin}
                >
                    Proceed to Sign In
                    <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <label htmlFor="signup-name" className={styles.label}>
                    Staff Full Name
                </label>
                <div className={styles.inputWrapper}>
                    <User className={styles.icon} size={18} />
                    <input
                        id="signup-name"
                        type="text"
                        className={styles.input}
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="signup-email" className={styles.label}>
                    Institutional Email
                </label>
                <div className={styles.inputWrapper}>
                    <Mail className={styles.icon} size={18} />
                    <input
                        id="signup-email"
                        type="email"
                        className={styles.input}
                        placeholder="staff@avevistaresort.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="signup-password" className={styles.label}>
                    Create Passkey
                </label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.icon} size={18} />
                    <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
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

            <div className={styles.inputGroup}>
                <label className={styles.label}>
                    Assigned Property Role
                </label>
                <div className={styles.roleSelectorGrid}>
                    {roles.map((r) => (
                        <div
                            key={r.id}
                            className={`${styles.roleOption} ${role === r.id ? styles.roleOptionSelected : ''}`}
                            onClick={() => setRole(r.id)}
                        >
                            {r.title}
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                    'Registering Account...'
                ) : (
                    <>
                        Create Staff Account
                        <ArrowRight size={16} />
                    </>
                )}
            </button>

            {onSwitchToLogin && (
                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.9rem', color: '#64748b' }}>
                    Already have an account?{' '}
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
                        onClick={onSwitchToLogin}
                    >
                        Sign In
                    </button>
                </div>
            )}
        </form>
    );
}
