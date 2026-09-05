'use client';

import React from 'react';
import styles from './AuthFooter.module.css';

const AuthFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className={styles.footerContainer}>
            <span>&copy; {currentYear} <strong className={styles.boldText}>Ave Vista Resorts PMS</strong>.</span>
            <span className={styles.bullet}>&bull;</span>
            <span>A product of <strong className={styles.boldText}>MidCell Studios</strong>.</span>
            <span className={styles.bullet}>&bull;</span>
            <span>Proprietary Software. All Rights Reserved</span>
        </div>
    );
};

export default AuthFooter;
