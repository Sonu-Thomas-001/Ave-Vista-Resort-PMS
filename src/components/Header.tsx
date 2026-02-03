'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Settings, ChevronDown, Calendar, Clock, Users, BedDouble, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Generate breadcrumbs from pathname
    const getBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean);
        if (paths.length === 0) return [{ label: 'Dashboard', path: '/' }];

        return paths.map((path, index) => ({
            label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
            path: '/' + paths.slice(0, index + 1).join('/')
        }));
    };

    const breadcrumbs = getBreadcrumbs();
    const notifications = 3; // Mock notification count

    const navigateToProfile = () => {
        setShowProfileMenu(false);
        router.push('/profile');
    };

    const navigateToSettings = () => {
        setShowProfileMenu(false);
        router.push('/settings');
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{title}</h1>
                    <div className={styles.breadcrumbs}>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.path} className={styles.breadcrumb}>
                                {index > 0 && <span className={styles.separator}>/</span>}
                                {crumb.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* Date & Time */}
                <div className={styles.dateTime}>
                    <div className={styles.dateTimeItem}>
                        <Calendar size={14} />
                        <span>{currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className={styles.dateTimeItem}>
                        <Clock size={14} />
                        <span>{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* Search */}
                <div className={styles.search}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search guests, bookings..."
                        className={styles.searchInput}
                    />
                </div>

                {/* Quick Stats */}
                <div className={styles.quickStats}>
                    <div className={styles.statItem}>
                        <Users size={16} />
                        <span className={styles.statValue}>12</span>
                    </div>
                    <div className={styles.statItem}>
                        <BedDouble size={16} />
                        <span className={styles.statValue}>8/15</span>
                    </div>
                </div>

                {/* Action Icons */}
                <div className={styles.icons}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications > 0 && (
                            <span className={styles.badge}>{notifications}</span>
                        )}
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={navigateToSettings}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                {/* Profile Dropdown */}
                <div className={styles.profileWrapper}>
                    <div
                        className={styles.profile}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className={styles.avatar}>{user?.name ? user.name[0] : 'U'}</div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || 'Guest'}</span>
                            <span className={styles.userRole}>{user?.role || 'User'}</span>
                        </div>
                        <ChevronDown size={16} className={styles.chevron} />
                    </div>

                    {showProfileMenu && (
                        <div className={styles.profileMenu}>
                            <button className={styles.menuItem} onClick={navigateToProfile}>
                                <User size={16} />
                                <span>My Profile</span>
                            </button>
                            <button className={styles.menuItem} onClick={navigateToSettings}>
                                <Settings size={16} />
                                <span>Settings</span>
                            </button>
                            <div className={styles.menuDivider}></div>
                            <button className={styles.menuItem} onClick={logout}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
