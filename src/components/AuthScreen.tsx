'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './AuthScreen.module.css';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import AuthFooter from './AuthFooter';

interface AuthScreenProps {
    initialMode: 'login' | 'signup';
}

export default function AuthScreen({ initialMode }: AuthScreenProps) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(initialMode === 'signup');
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setIsRightPanelActive(initialMode === 'signup');
    }, [initialMode]);

    if (!isMounted) {
        return null; // Prevent hydration mismatch
    }

    const handleSignUpClick = () => {
        setIsRightPanelActive(true);
        window.history.pushState(null, '', '/signup');
    };

    const handleSignInClick = () => {
        setIsRightPanelActive(false);
        window.history.pushState(null, '', '/login');
    };

    // Mobile specific toggle handles
    const toggleMobileMode = () => {
        if (isRightPanelActive) {
            handleSignInClick();
        } else {
            handleSignUpClick();
        }
    };

    return (
        <div className={`${styles.container} ${isRightPanelActive ? styles.rightPanelActive : ''}`}>
            {/* Sign Up Container (Left, but moves to Right/Visible when Active) */}
            <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
                <div className={styles.formHeader}>
                    <h1 className={styles.formTitle}><span>Create Account</span></h1>
                    <p className={styles.formSubtitle}><span>Join Ave Vista PMS</span></p>
                </div>
                <SignupForm />
                <div className={styles.mobileToggle}>
                    <span>Already have an account?</span> <span onClick={toggleMobileMode}>Sign In</span>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <AuthFooter />
                </div>
            </div>

            {/* Sign In Container (Right, but moves to Left/Hidden when Active) */}
            <div className={`${styles.formContainer} ${styles.signInContainer}`}>
                <div className={styles.formHeader}>
                    <h1 className={styles.formTitle}><span>Welcome Back</span></h1>
                    <p className={styles.formSubtitle}><span>Sign in to your dashboard</span></p>
                </div>
                <LoginForm />
                <div className={styles.mobileToggle}>
                    <span>Don't have an account?</span> <span onClick={toggleMobileMode}>Sign Up</span>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <AuthFooter />
                </div>
            </div>

            {/* Overlay Container (The Sliding Image Part) */}
            <div className={styles.overlayContainer}>
                <div className={styles.overlay}>
                    <div className={styles.overlayBg} />

                    {/* Left Overlay Panel (Visible when Right Panel is Active / Signup Mode) */}
                    <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                        <Image
                            src="/logo-white.png"
                            alt="Ave Vista"
                            width={140}
                            height={60}
                            style={{ objectFit: 'contain', opacity: 0.9, marginBottom: '20px' }}
                        />
                        <h1 className={styles.title}><span>Welcome Back!</span></h1>
                        <p className={styles.description}>
                            <span>To keep connected with us please login with your personal info</span>
                        </p>
                        <button className={styles.ghost} onClick={handleSignInClick}>
                            <span>Sign In</span>
                        </button>
                        <div className={styles.overlayFooter}>
                            <a href="/help" className={styles.footerLink}>Help</a>
                            <a href="/privacy" className={styles.footerLink}>Privacy</a>
                            <a href="/terms" className={styles.footerLink}>Terms</a>
                        </div>
                    </div>

                    {/* Right Overlay Panel (Visible when Right Panel is INACTIVE / Login Mode) */}
                    <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                        <Image
                            src="/logo-white.png"
                            alt="Ave Vista"
                            width={140}
                            height={60}
                            style={{ objectFit: 'contain', opacity: 0.9, marginBottom: '20px' }}
                        />
                        <h1 className={styles.title}><span>Hello, Friend!</span></h1>
                        <p className={styles.description}>
                            <span>Enter your personal details and start your journey with us</span>
                        </p>
                        <button className={styles.ghost} onClick={handleSignUpClick}>
                            <span>Sign Up</span>
                        </button>
                        <div className={styles.overlayFooter}>
                            <a href="/help" className={styles.footerLink}>Help</a>
                            <a href="/privacy" className={styles.footerLink}>Privacy</a>
                            <a href="/terms" className={styles.footerLink}>Terms</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
