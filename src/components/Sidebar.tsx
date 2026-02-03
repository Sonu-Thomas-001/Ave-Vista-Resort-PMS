'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  CreditCard,
  MonitorCheck,
  Settings,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Repeat // For Channel Manager
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: CalendarDays, label: 'Bookings', href: '/bookings' },
  { icon: BedDouble, label: 'Rooms', href: '/rooms' },
  { icon: Users, label: 'Guests', href: '/guests' },
  { icon: CreditCard, label: 'Billing', href: '/billing' },
  { icon: MonitorCheck, label: 'Front Desk', href: '/front-desk' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

import { hasAccess } from '@/lib/permissions';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Toggle Button */}
      <button
        className={styles.toggleBtn}
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Brand */}
      <div className={styles.brand}>
        {isCollapsed ? (
          <div className={styles.logoCollapsed}>
            <span className={styles.logoInitial}>AV</span>
          </div>
        ) : (
          <div className={styles.logoWrapper}>
            <Image
              src="/logo.png"
              alt="Ave Vista"
              width={160}
              height={70}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        )}
      </div>



      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.filter(item => user && hasAccess(user.role, item.href)).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className={styles.navIcon} />
              {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && <div className={styles.activeIndicator}></div>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {/* User Info */}
        {!isCollapsed && user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          className={styles.logoutBtn}
          onClick={logout}
          aria-label="Logout"
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className={styles.navIcon} />
          {!isCollapsed && <span className={styles.navLabel}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
