'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff, ChevronDown, CheckCircle } from 'lucide-react';
import styles from '@/app/(auth)/login/page.module.css'; // Reuse existing form styles

export default function SignupForm() {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Manager');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const roles = ['Admin', 'Manager', 'Reception'];

    useEffect(() => {
        const handleClickOutside = () => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

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
            <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <CheckCircle size={64} color="var(--primary)" style={{ margin: '0 auto' }} />
                </div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 700 }}>Account Created!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Please check your email to confirm your account, then login.
                </p>
                {/* Note: In sliding auth, "Go to Login" just means switch mode. Handled by parent or just text. */}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form} style={{ width: '100%', maxWidth: '400px' }}>
            <div className={styles.inputGroup}>
                <label htmlFor="fullname" className={styles.label}>Full Name</label>
                <div className={styles.inputWrapper}>
                    <User className={styles.icon} size={18} />
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
                    <Mail className={styles.icon} size={18} />
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        placeholder="Create strong password"
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
                <div className={styles.customSelectWrapper}>
                    <div className={styles.inputWrapper}>
                        <Briefcase className={styles.icon} size={18} />
                        <div
                            className={styles.customSelect}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className={styles.selectedValue}>
                                {role}
                            </div>
                            {isDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    {roles.map((r) => (
                                        <div
                                            key={r}
                                            className={`${styles.dropdownItem} ${role === r ? styles.selected : ''}`}
                                            onClick={() => {
                                                setRole(r);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {r}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.selectArrow}>
                            <ChevronDown size={18} />
                        </div>
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
        </form>
    );
}
