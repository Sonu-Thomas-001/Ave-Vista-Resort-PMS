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
  UtensilsCrossed,
  MonitorCheck,
  BookOpen,
  Search,
  Settings,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  IndianRupee
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { hasAccess } from '@/lib/permissions';

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { icon: CalendarDays, label: 'Bookings', href: '/bookings' },
      { icon: BedDouble, label: 'Rooms', href: '/rooms' },
      { icon: MonitorCheck, label: 'Front Desk', href: '/front-desk' },
    ],
  },
  {
    id: 'hospitality',
    title: 'Hospitality',
    items: [
      { icon: Users, label: 'Guests', href: '/guests' },
      { icon: Search, label: 'Guest Lookup', href: '/guest-lookup' },
    ],
  },
  {
    id: 'finance-dining',
    title: 'Finance & Dining',
    items: [
      { icon: CreditCard, label: 'Billing', href: '/billing' },
      { icon: IndianRupee, label: 'Expenses', href: '/expenses' },
      { icon: UtensilsCrossed, label: 'Restaurant Bill', href: '/restaurant-bill' },
      { icon: BookOpen, label: 'Restaurant Menu', href: '/restaurant-menu' },
    ],
  },
  {
    id: 'system',
    title: 'System & Reports',
    items: [
      { icon: BarChart3, label: 'Reports', href: '/reports' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
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

  const isCollapsedState = !isMobile && isCollapsed;

  const containerClasses = `
    ${styles.sidebar} 
    ${isCollapsedState ? styles.collapsed : ''} 
    ${isMobile && isOpen ? styles.mobileOpen : ''}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div className={styles.backdrop} onClick={onCloseMobile} />
      )}

      {/* Sidebar Container */}
      <aside className={containerClasses}>
        {/* Desktop Toggle Tab Button (Docked cleanly on the sidebar outer boundary) */}
        {!isMobile && (
          <button
            className={styles.toggleBtn}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} />
            )}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            className={styles.mobileCloseBtn}
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div className={styles.brand}>
          {isCollapsedState ? (
            <div className={styles.logoCollapsed} title="Ave Vista Resort & Hotels">
              <span className={styles.logoCollapsedInitial}>AV</span>
              <span className={styles.logoCollapsedTag}>PMS</span>
            </div>
          ) : (
            <div className={styles.brandWrapper}>
              <div className={styles.logoWrapper}>
                <Image
                  src="/logo.png"
                  alt="Ave Vista Resort & Hotels"
                  width={150}
                  height={62}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <div className={styles.brandBadge}>
                <span className={styles.brandBadgeDot} />
                <span>RESORT MANAGEMENT</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className={styles.nav}>
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => user && hasAccess(user.role, item.href)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id} className={styles.navSection}>
                {/* Section Header */}
                {!isCollapsedState ? (
                  <div className={styles.sectionTitle}>{section.title}</div>
                ) : (
                  <div className={styles.sectionDivider} />
                )}

                {/* Section Items */}
                <div className={styles.sectionItems}>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    const onboardingKey = `nav-${item.href.replace('/', '') || 'dashboard'}`;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-onboarding={onboardingKey}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => isMobile && onCloseMobile?.()}
                      >
                        <div className={styles.iconContainer}>
                          <Icon size={19} className={styles.navIcon} strokeWidth={isActive ? 2.2 : 1.8} />
                        </div>

                        {!isCollapsedState && (
                          <span className={styles.navLabel}>{item.label}</span>
                        )}

                        {/* Collapsed Tooltip */}
                        {isCollapsedState && (
                          <div className={styles.tooltip}>
                            <span>{item.label}</span>
                          </div>
                        )}

                        {isActive && !isCollapsedState && (
                          <div className={styles.activeGlow} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Area: User Card & Sign Out */}
        <div className={styles.footer}>
          {user && (
            <>
              {!isCollapsedState ? (
                <div className={styles.userCard}>
                  <div className={styles.avatarWrapper}>
                    <div className={styles.userAvatar}>
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className={styles.onlineStatusDot} title="Online" />
                  </div>

                  <div className={styles.userDetails}>
                    <div className={styles.userName} title={user.name || user.email || ''}>
                      {user.name || user.email?.split('@')[0]}
                    </div>
                    <div className={styles.roleContainer}>
                      <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase() || 'admin']}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    className={styles.iconLogoutBtn}
                    onClick={logout}
                    aria-label="Logout"
                    title="Sign Out"
                  >
                    <LogOut size={16} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className={styles.collapsedUserSection}>
                  <div className={styles.collapsedAvatarWrapper} title={`${user.name || 'User'} (${user.role})`}>
                    <div className={styles.userAvatar}>
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className={styles.onlineStatusDot} />
                    <div className={styles.tooltip}>
                      <span>{user.name || user.email}</span>
                      <span className={styles.tooltipRole}>{user.role}</span>
                    </div>
                  </div>

                  <button
                    className={styles.collapsedLogoutBtn}
                    onClick={logout}
                    aria-label="Logout"
                    title="Sign Out"
                  >
                    <LogOut size={17} strokeWidth={2} />
                    <div className={styles.tooltip}>Sign Out</div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
