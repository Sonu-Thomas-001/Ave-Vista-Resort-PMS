'use client';

import { Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
}


export default function Header({ title = "Dashboard" }: HeaderProps) {
    const { user } = useAuth();
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.actions}>
                <div className={styles.search}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search guests, bookings..."
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.icons}>
                    <button className={styles.iconBtn}>
                        <Bell size={20} />
                    </button>
                    <button className={styles.iconBtn}>
                        <Settings size={20} />
                    </button>
                </div>

                <div className={styles.profile}>
                    <div className={styles.avatar}>{user?.name ? user.name[0] : 'U'}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name || 'Guest'}</span>
                        <span className={styles.userRole}>{user?.role || 'Staff'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
