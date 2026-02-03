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
  Mountain,
  BarChart3
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

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logo.png"
            alt="Ave Vista"
            width={180}
            height={80}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.navItem}
          style={{ cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
