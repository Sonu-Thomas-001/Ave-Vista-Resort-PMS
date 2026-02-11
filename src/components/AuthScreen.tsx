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

    useEffect(() => {
        setIsRightPanelActive(initialMode === 'signup');
    }, [initialMode]);

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
                    <h1 className={styles.formTitle}>Create Account</h1>
                    <p className={styles.formSubtitle}>Join Ave Vista PMS</p>
                </div>
                <SignupForm />
                <div className={styles.mobileToggle}>
                    Already have an account? <span onClick={toggleMobileMode}>Sign In</span>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <AuthFooter />
                </div>
            </div>

            {/* Sign In Container (Right, but moves to Left/Hidden when Active) */}
            <div className={`${styles.formContainer} ${styles.signInContainer}`}>
                <div className={styles.formHeader}>
                    <h1 className={styles.formTitle}>Welcome Back</h1>
                    <p className={styles.formSubtitle}>Sign in to your dashboard</p>
                </div>
                <LoginForm />
                <div className={styles.mobileToggle}>
                    Don't have an account? <span onClick={toggleMobileMode}>Sign Up</span>
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
                        <h1 className={styles.title}>Welcome Back!</h1>
                        <p className={styles.description}>
                            To keep connected with us please login with your personal info
                        </p>
                        <button className={styles.ghost} onClick={handleSignInClick}>
                            Sign In
                        </button>
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
                        <h1 className={styles.title}>Hello, Friend!</h1>
                        <p className={styles.description}>
                            Enter your personal details and start your journey with us
                        </p>
                        <button className={styles.ghost} onClick={handleSignUpClick}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
