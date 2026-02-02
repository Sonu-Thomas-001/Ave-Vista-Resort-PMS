'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { UserCheck, LogOut, Search } from 'lucide-react';
import styles from './page.module.css';

export default function FrontDeskPage() {
    return (
        <>
            <Header title="Front Desk" />

            <div className={styles.container}>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} />
                    <input type="text" placeholder="Quick search reservation..." className={styles.input} />
                </div>

                <div className={styles.grid}>
                    <Link href="/front-desk/checkin" className={styles.card}>
                        <div className={`${styles.iconWrapper} ${styles.checkin}`}>
                            <UserCheck size={48} />
                        </div>
                        <h2 className={styles.title}>Guest Check-in</h2>
                        <p className={styles.desc}>New arrivals, ID verification, Room assignment</p>
                    </Link>

                    <Link href="/front-desk/checkout" className={styles.card}>
                        <div className={`${styles.iconWrapper} ${styles.checkout}`}>
                            <LogOut size={48} />
                        </div>
                        <h2 className={styles.title}>Guest Check-out</h2>
                        <p className={styles.desc}>Billing, Payment settlement, feedback</p>
                    </Link>
                </div>
            </div>
        </>
    );
}
