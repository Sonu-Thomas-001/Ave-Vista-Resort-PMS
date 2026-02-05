'use client';

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
  Menu,
  X
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { hasAccess } from '@/lib/permissions';

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

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;       // For mobile: true = open, false = closed
  isCollapsed: boolean;  // For desktop: true = collapsed, false = expanded
  onToggle: () => void;  // Toggles relevant state
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobile, isOpen, isCollapsed, onToggle, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // On desktop, use isCollapsed. On mobile, use isOpen.
  // When mobile, adding 'collapsed' class might break layout if reused, but we use 'mobileOpen' for transform.
  const containerClasses = `
    ${styles.sidebar} 
    ${!isMobile && isCollapsed ? styles.collapsed : ''} 
    ${isMobile && isOpen ? styles.mobileOpen : ''}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div className={styles.backdrop} onClick={onCloseMobile} />
      )}

      {/* Desktop Toggle Button (Inside Sidebar) */}
      {!isMobile && (
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}

      {/* Sidebar Container */}
      <aside className={containerClasses}>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            className={styles.toggleBtn}
            style={{ top: '12px', right: '12px', position: 'absolute' }}
            onClick={onCloseMobile}
          >
            <X size={20} />
          </button>
        )}

        {/* Brand */}
        <div className={styles.brand}>
          {!isMobile && isCollapsed ? (
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
                title={!isMobile && isCollapsed ? item.label : ''}
                onClick={() => isMobile && onCloseMobile?.()}
              >
                <Icon size={20} className={styles.navIcon} />
                {/* Show label if: Mobile (always expanded when open) OR Desktop & Not Collapsed */}
                {(isMobile || !isCollapsed) && <span className={styles.navLabel}>{item.label}</span>}
                {isActive && <div className={styles.activeIndicator}></div>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          {/* User Info */}
          {(isMobile || !isCollapsed) && user && (
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
            title={!isMobile && isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className={styles.navIcon} />
            {(isMobile || !isCollapsed) && <span className={styles.navLabel}>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
