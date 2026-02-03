'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Settings, ChevronDown, Calendar, Clock, Users, BedDouble, LogOut, User, CheckCheck, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
}

interface Notification {
    id: number;
    type: 'info' | 'warning' | 'success';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Mock notifications data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            type: 'info',
            title: 'New Booking',
            message: 'Room A4 booked by Priya Verma for 2 nights',
            time: '5 mins ago',
            read: false
        },
        {
            id: 2,
            type: 'warning',
            title: 'Check-out Reminder',
            message: 'Room A1 checkout scheduled for today at 11:00 AM',
            time: '15 mins ago',
            read: false
        },
        {
            id: 3,
            type: 'success',
            title: 'Payment Received',
            message: 'Payment of ₹15,000 received for booking #BK092',
            time: '1 hour ago',
            read: false
        },
        {
            id: 4,
            type: 'info',
            title: 'Maintenance Request',
            message: 'AC repair requested for Room B2',
            time: '2 hours ago',
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const navigateToProfile = () => {
        setShowProfileMenu(false);
        router.push('/profile');
    };

    const navigateToSettings = () => {
        setShowProfileMenu(false);
        router.push('/settings');
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertCircle size={20} />;
            case 'success':
                return <CheckCircle size={20} />;
            default:
                return <Info size={20} />;
        }
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
                    {/* Notifications Dropdown */}
                    <div className={styles.notificationWrapper} ref={notificationRef}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className={styles.badge}>{unreadCount}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className={styles.notificationPanel}>
                                <div className={styles.notificationHeader}>
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            className={styles.markAllBtn}
                                            onClick={markAllAsRead}
                                        >
                                            <CheckCheck size={16} />
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className={styles.notificationList}>
                                    {notifications.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <Bell size={32} />
                                            <p>No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${styles[notification.type]}`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className={styles.notificationIcon}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className={styles.notificationContent}>
                                                    <h4>{notification.title}</h4>
                                                    <p>{notification.message}</p>
                                                    <span className={styles.notificationTime}>{notification.time}</span>
                                                </div>
                                                {!notification.read && (
                                                    <div className={styles.unreadDot}></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className={styles.iconBtn}
                        onClick={navigateToSettings}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                {/* Profile Dropdown */}
                <div className={styles.profileWrapper} ref={profileRef}>
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
