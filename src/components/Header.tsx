'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Search,
    Settings,
    ChevronDown,
    Calendar,
    Clock,
    Users,
    BedDouble,
    LogOut,
    User,
    X,
    Sparkles,
    Shield,
    Home,
    ChevronRight,
    LayoutDashboard,
    CalendarDays,
    KeyRound,
    UtensilsCrossed,
    BarChart3,
    Receipt,
    HelpCircle,
    FileText,
    Building2,
    LogIn,
    Compass,
    Bell,
    Menu,
    CheckCircle2,
    AlertTriangle,
    Brush,
    UserCheck,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useMobileNav } from '@/contexts/MobileNavContext';
import { supabase } from '@/lib/supabase';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
}

interface SearchResult {
    id: string;
    type: 'guest' | 'booking' | 'room';
    title: string;
    subtitle: string;
    path: string;
}

interface OperationalAlert {
    id: string;
    type: 'checkin' | 'checkout' | 'housekeeping' | 'billing' | 'booking';
    title: string;
    description: string;
    timestamp: string;
    path: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

const getHeaderEmblem = (title: string, pathname: string) => {
    const t = title.toLowerCase();
    const p = pathname.toLowerCase();

    if (p.includes('rooms') || t.includes('room')) {
        return <BedDouble size={20} />;
    }
    if (p.includes('bookings') || t.includes('reservation') || t.includes('booking')) {
        return <CalendarDays size={20} />;
    }
    if (p.includes('front-desk') || t.includes('front desk') || t.includes('check-in') || t.includes('check-out')) {
        return <KeyRound size={20} />;
    }
    if (p.includes('restaurant') || t.includes('restaurant') || t.includes('dining') || t.includes('menu')) {
        return <UtensilsCrossed size={20} />;
    }
    if (p.includes('guests') || t.includes('guest')) {
        return <Users size={20} />;
    }
    if (p.includes('reports') || t.includes('report') || t.includes('intelligence')) {
        return <BarChart3 size={20} />;
    }
    if (p.includes('billing') || p.includes('expenses') || t.includes('billing') || t.includes('invoice') || t.includes('expense')) {
        return <Receipt size={20} />;
    }
    if (p.includes('settings') || t.includes('settings')) {
        return <Settings size={20} />;
    }
    if (p.includes('profile') || t.includes('profile')) {
        return <User size={20} />;
    }
    if (p.includes('help') || t.includes('help')) {
        return <HelpCircle size={20} />;
    }
    if (p.includes('terms') || p.includes('privacy') || t.includes('terms') || t.includes('policy')) {
        return <FileText size={20} />;
    }
    return <LayoutDashboard size={20} />;
};

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const { user, logout } = useAuth();
    const { restartTour } = useOnboarding();
    const { openMobileNav } = useMobileNav();
    const pathname = usePathname();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Real-time stats state
    const [todaysBookings, setTodaysBookings] = useState(0);
    const [roomStats, setRoomStats] = useState({ occupied: 0, total: 0 });
    const [alerts, setAlerts] = useState<OperationalAlert[]>([]);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!user) return;

        fetchRealTimeStats();
        fetchOperationalAlerts();

        const bookingsSubscription = supabase
            .channel('header-bookings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchTodaysBookings();
                fetchOperationalAlerts();
            })
            .subscribe();

        const roomsSubscription = supabase
            .channel('header-rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRoomStats();
                fetchOperationalAlerts();
            })
            .subscribe();

        return () => {
            bookingsSubscription.unsubscribe();
            roomsSubscription.unsubscribe();
        };
    }, [user]);

    const fetchRealTimeStats = () => {
        fetchTodaysBookings();
        fetchRoomStats();
    };

    const fetchTodaysBookings = async () => {
        const todayStr = new Date().toISOString().split('T')[0];

        const { count, error } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${todayStr}T00:00:00`);

        if (!error && count !== null) {
            setTodaysBookings(count);
        }
    };

    const fetchRoomStats = async () => {
        const { count: total, error: totalError } = await supabase
            .from('rooms')
            .select('*', { count: 'exact', head: true });

        const { count: occupied, error: occupiedError } = await supabase
            .from('rooms')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Occupied');

        if (!totalError && !occupiedError && total !== null && occupied !== null) {
            setRoomStats({ occupied, total });
        }
    };

    const fetchOperationalAlerts = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const alertList: OperationalAlert[] = [];

            // 1. Pending Arrivals Today
            const { data: arrivals } = await supabase
                .from('bookings')
                .select('id, guests(first_name, last_name), rooms(room_number)')
                .eq('status', 'Confirmed')
                .lte('check_in_date', todayStr)
                .limit(5);

            if (arrivals && arrivals.length > 0) {
                alertList.push({
                    id: 'alert-arrivals',
                    type: 'checkin',
                    title: `${arrivals.length} Arrival${arrivals.length > 1 ? 's' : ''} Expected Today`,
                    description: 'Guests scheduled for check-in at front desk',
                    timestamp: 'Today',
                    path: '/front-desk',
                    severity: 'info'
                });
            }

            // 2. Pending Departures Today
            const { data: departures } = await supabase
                .from('bookings')
                .select('id')
                .eq('status', 'Checked In')
                .lte('check_out_date', todayStr)
                .limit(5);

            if (departures && departures.length > 0) {
                alertList.push({
                    id: 'alert-departures',
                    type: 'checkout',
                    title: `${departures.length} Departure${departures.length > 1 ? 's' : ''} Scheduled`,
                    description: 'Check-out & folio settlement required today',
                    timestamp: 'Today',
                    path: '/front-desk/checkout',
                    severity: 'warning'
                });
            }

            // 3. Housekeeping Dirty Rooms
            const { count: dirtyCount } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Dirty');

            if (dirtyCount && dirtyCount > 0) {
                alertList.push({
                    id: 'alert-housekeeping',
                    type: 'housekeeping',
                    title: `${dirtyCount} Room${dirtyCount > 1 ? 's' : ''} Require Cleaning`,
                    description: 'Turnover needed for upcoming guest check-ins',
                    timestamp: 'Active',
                    path: '/rooms',
                    severity: 'warning'
                });
            }

            // 4. Pending Folios / Unpaid Invoices
            const { count: pendingFoliosCount } = await supabase
                .from('invoices')
                .select('*', { count: 'exact', head: true })
                .in('status', ['Pending', 'Partial']);

            if (pendingFoliosCount && pendingFoliosCount > 0) {
                alertList.push({
                    id: 'alert-billing',
                    type: 'billing',
                    title: `${pendingFoliosCount} Folio${pendingFoliosCount > 1 ? 's' : ''} Awaiting Settlement`,
                    description: 'Unsettled guest charges or balance due',
                    timestamp: 'Pending',
                    path: '/billing',
                    severity: 'error'
                });
            }

            setAlerts(alertList);
        } catch (err) {
            console.error('Error fetching operational alerts:', err);
        }
    };

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Global shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Build breadcrumbs dynamically from pathname
    const breadcrumbs = pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, array) => {
            const path = `/${array.slice(0, index + 1).join('/')}`;
            const label = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
            return { label, path };
        });

    const navigateToProfile = () => {
        setShowProfileMenu(false);
        router.push('/profile');
    };

    const navigateToSettings = () => {
        setShowProfileMenu(false);
        router.push('/settings');
    };

    const handleRestartTour = () => {
        setShowProfileMenu(false);
        restartTour();
    };

    const performSearch = async (query: string) => {
        const results: SearchResult[] = [];

        try {
            // Search guests
            const { data: guests, error: guestsError } = await supabase
                .from('guests')
                .select('id, first_name, last_name, email, phone')
                .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
                .limit(5);

            if (!guestsError && guests) {
                guests.forEach(guest => {
                    results.push({
                        id: guest.id,
                        type: 'guest',
                        title: `${guest.first_name} ${guest.last_name}`,
                        subtitle: guest.email,
                        path: '/guests'
                    });
                });
            }

            // Search bookings
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    guests (first_name, last_name),
                    rooms (room_number)
                `)
                .or(`id::text.ilike.%${query}%`)
                .limit(5);

            if (!bookingsError && bookings) {
                bookings.forEach((booking: any) => {
                    const guestName = booking.guests
                        ? `${booking.guests.first_name} ${booking.guests.last_name}`
                        : 'Unknown Guest';
                    const roomNumber = booking.rooms?.room_number || 'N/A';

                    results.push({
                        id: booking.id,
                        type: 'booking',
                        title: `Booking #${booking.id.slice(0, 8)}`,
                        subtitle: `${guestName} • Room ${roomNumber}`,
                        path: '/bookings'
                    });
                });
            }

            // Search rooms
            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('id, room_number, room_type, status')
                .or(`room_number.ilike.%${query}%,room_type.ilike.%${query}%`)
                .limit(5);

            if (!roomsError && rooms) {
                rooms.forEach(room => {
                    results.push({
                        id: room.id,
                        type: 'room',
                        title: `Room ${room.room_number}`,
                        subtitle: `${room.room_type} • ${room.status}`,
                        path: '/rooms'
                    });
                });
            }

            setSearchResults(results.slice(0, 8));
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setShowSearchResults(true);
        }
    };

    const handleSearchResultClick = (result: SearchResult) => {
        router.push(result.path);
        setSearchQuery('');
        setShowSearchResults(false);
        setShowMobileSearch(false);
    };

    const handleAlertClick = (alert: OperationalAlert) => {
        setShowNotifications(false);
        router.push(alert.path);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'guest':
                return <User size={16} />;
            case 'booking':
                return <Calendar size={16} />;
            case 'room':
                return <BedDouble size={16} />;
            default:
                return <Search size={16} />;
        }
    };

    const getAlertIcon = (type: OperationalAlert['type']) => {
        switch (type) {
            case 'checkin':
                return <UserCheck size={16} />;
            case 'checkout':
                return <LogOut size={16} />;
            case 'housekeeping':
                return <Brush size={16} />;
            case 'billing':
                return <Receipt size={16} />;
            default:
                return <CalendarDays size={16} />;
        }
    };

    return (
        <header className={styles.header}>
            {/* Left Section: Mobile Drawer Trigger + Desktop Luxury Emblem & Breadcrumbs */}
            <div className={styles.leftSection}>
                {/* Mobile Menu Hamburger Button */}
                <button
                    type="button"
                    className={styles.mobileNavTrigger}
                    onClick={openMobileNav}
                    aria-label="Open Navigation Menu"
                    title="Open Navigation"
                >
                    <Menu size={20} />
                </button>

                {/* Mobile Brand Identity */}
                <div className={styles.mobileBrand}>
                    <span className={styles.mobileBrandTitle}>Ave Vista</span>
                    <span className={styles.mobilePageTag}>{title}</span>
                </div>

                {/* Desktop Emblem */}
                <div className={styles.emblemContainer}>
                    <div className={styles.emblemSquircle} title={title}>
                        {getHeaderEmblem(title, pathname)}
                    </div>
                </div>

                {/* Desktop Title & Breadcrumbs */}
                <div className={styles.titleSection}>
                    <div className={styles.breadcrumbs}>
                        <button
                            type="button"
                            className={styles.homeCrumbBtn}
                            onClick={() => router.push('/')}
                            title="Go to Resort Dashboard"
                        >
                            <Home size={12} />
                            <span>Ave Vista</span>
                        </button>
                        <ChevronRight size={11} className={styles.breadcrumbChevron} />
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <span key={crumb.path} className={styles.breadcrumbItem}>
                                    {index > 0 && <ChevronRight size={11} className={styles.breadcrumbChevron} />}
                                    <button
                                        type="button"
                                        className={`${styles.crumbBtn} ${isLast ? styles.crumbBtnActive : ''}`}
                                        onClick={() => !isLast && router.push(crumb.path)}
                                        disabled={isLast}
                                    >
                                        {crumb.label}
                                    </button>
                                </span>
                            );
                        })}
                    </div>

                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>{title}</h1>
                    </div>
                </div>
            </div>

            {/* Right Section: Live Metrics & Controls */}
            <div className={styles.rightSection}>
                {/* Real-time Clock Capsule (Desktop) */}
                {mounted && (
                    <div className={styles.dateTimeCapsule}>
                        <div className={styles.dateSegment}>
                            <Calendar size={14} className={styles.calendarIcon} />
                            <span>
                                {currentTime.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <span className={styles.timeDivider} />
                        <div className={styles.timeSegment}>
                            <span className={styles.pulseDot} />
                            <Clock size={13} className={styles.clockIcon} />
                            <span className={styles.timeValue}>
                                {currentTime.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                })}
                            </span>
                        </div>
                    </div>
                )}

                {user ? (
                    <>
                        {/* Spotlight / Command Search */}
                        <div
                            className={`${styles.searchWrapper} ${showMobileSearch ? styles.mobileSearchOpen : ''}`}
                            ref={searchRef}
                        >
                            <button
                                className={styles.mobileSearchToggle}
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                aria-label="Open search"
                            >
                                <Search size={18} />
                            </button>

                            <div className={styles.search}>
                                <Search size={16} className={styles.searchIcon} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search guests, rooms, bookings..."
                                    className={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                                />
                                <div className={styles.searchKeycap}>
                                    <kbd>Ctrl</kbd>
                                    <span>K</span>
                                </div>

                                <button
                                    className={styles.mobileSearchClose}
                                    onClick={() => {
                                        setShowMobileSearch(false);
                                        setSearchQuery('');
                                    }}
                                    aria-label="Close search"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className={styles.searchResults}>
                                    {searchResults.length === 0 ? (
                                        <div className={styles.emptySearchState}>
                                            <Search size={28} />
                                            <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.searchResultsHeader}>
                                                <span>Quick Results</span>
                                                <span className={styles.resultsCountBadge}>
                                                    {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
                                                </span>
                                            </div>
                                            <div className={styles.searchResultsList}>
                                                {searchResults.map(result => (
                                                    <div
                                                        key={`${result.type}-${result.id}`}
                                                        className={styles.searchResultItem}
                                                        onClick={() => handleSearchResultClick(result)}
                                                    >
                                                        <div className={`${styles.searchResultIcon} ${styles[result.type]}`}>
                                                            {getResultIcon(result.type)}
                                                        </div>
                                                        <div className={styles.searchResultContent}>
                                                            <h4>{result.title}</h4>
                                                            <p>{result.subtitle}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Live Operations Stat Chips (Desktop) */}
                        <div className={styles.quickStats}>
                            <div className={styles.statChipGreen} title="Bookings created today">
                                <div className={styles.statIconWrapperGreen}>
                                    <Users size={14} />
                                </div>
                                <span className={styles.statChipLabel}>Bookings</span>
                                <span className={styles.statChipValueGreen}>{todaysBookings}</span>
                            </div>

                            <div className={styles.statChipBlue} title="Occupied rooms / Total rooms">
                                <div className={styles.statIconWrapperBlue}>
                                    <BedDouble size={14} />
                                </div>
                                <span className={styles.statChipLabel}>Rooms</span>
                                <span className={styles.statChipValueBlue}>
                                    {roomStats.occupied}/{roomStats.total}
                                </span>
                            </div>
                        </div>

                        {/* Operational Notifications Bell (Mobile & Desktop) */}
                        <div className={styles.notificationWrapper} ref={notificationsRef}>
                            <button
                                className={styles.notificationBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
                                aria-label="Operational Notifications"
                                title="Resort Notifications & Live Alerts"
                            >
                                <Bell size={18} />
                                {alerts.length > 0 && (
                                    <span className={styles.notificationBadge}>
                                        {alerts.length}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Panel / Mobile Bottom Sheet */}
                            {showNotifications && (
                                <>
                                    <div
                                        className={styles.notificationsBackdrop}
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <div className={styles.notificationsPanel}>
                                        <div className={styles.notificationsHeader}>
                                            <div className={styles.notificationsTitleGroup}>
                                                <Bell size={16} className={styles.bellIcon} />
                                                <h3 className={styles.notificationsHeading}>Operational Alerts</h3>
                                                {alerts.length > 0 && (
                                                    <span className={styles.activeAlertsCountBadge}>
                                                        {alerts.length} active
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                className={styles.closeNotificationsBtn}
                                                onClick={() => setShowNotifications(false)}
                                                aria-label="Close notifications"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className={styles.notificationsList}>
                                            {alerts.length === 0 ? (
                                                <div className={styles.emptyNotifications}>
                                                    <CheckCircle2 size={32} className={styles.emptyAlertIcon} />
                                                    <h4>All Tasks Clear</h4>
                                                    <p>Front desk, bookings, and housekeeping operations are currently on track.</p>
                                                </div>
                                            ) : (
                                                alerts.map((alert) => (
                                                    <div
                                                        key={alert.id}
                                                        className={`${styles.alertItem} ${styles[`severity_${alert.severity}`]}`}
                                                        onClick={() => handleAlertClick(alert)}
                                                    >
                                                        <div className={`${styles.alertIconSquircle} ${styles[`icon_${alert.type}`]}`}>
                                                            {getAlertIcon(alert.type)}
                                                        </div>
                                                        <div className={styles.alertDetails}>
                                                            <div className={styles.alertTitleRow}>
                                                                <h4 className={styles.alertTitle}>{alert.title}</h4>
                                                                <span className={styles.alertTimestamp}>{alert.timestamp}</span>
                                                            </div>
                                                            <p className={styles.alertDesc}>{alert.description}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className={styles.notificationsFooter}>
                                            <Link
                                                href="/front-desk"
                                                className={styles.notificationsFooterLink}
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                <span>Go to Front Desk Operations</span>
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Quick Action: Settings (Desktop) */}
                        <button
                            className={`${styles.iconBtn} ${styles.desktopOnlyBtn}`}
                            onClick={navigateToSettings}
                            aria-label="Settings"
                            title="System Settings"
                        >
                            <Settings size={18} />
                        </button>

                        {/* Executive User Profile Capsule */}
                        <div className={styles.profileWrapper} ref={profileRef}>
                            <div
                                className={styles.profile}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className={styles.avatarWrapper}>
                                    <div className={styles.avatar}>
                                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className={styles.userStatusDot} />
                                </div>

                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user?.name}</span>
                                    <div className={styles.roleContainer}>
                                        <span className={`${styles.roleBadge} ${styles[user?.role?.toLowerCase() || 'admin']}`}>
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>

                                <ChevronDown
                                    size={14}
                                    className={`${styles.chevron} ${showProfileMenu ? styles.chevronOpen : ''}`}
                                />
                            </div>

                            {/* Profile Menu Dropdown */}
                            {showProfileMenu && (
                                <div className={styles.profileMenu}>
                                    <div className={styles.profileMenuHeader}>
                                        <div className={styles.menuHeaderName}>{user?.name || 'User'}</div>
                                        <div className={styles.menuHeaderEmail}>{user?.email}</div>
                                    </div>
                                    <div className={styles.menuDivider} />

                                    <button className={styles.menuItem} onClick={navigateToProfile}>
                                        <div className={styles.menuItemIcon}><User size={15} /></div>
                                        <span>My Profile</span>
                                    </button>
                                    <button className={styles.menuItem} onClick={navigateToSettings}>
                                        <div className={styles.menuItemIcon}><Settings size={15} /></div>
                                        <span>Settings</span>
                                    </button>
                                    <button className={styles.menuItem} onClick={handleRestartTour}>
                                        <div className={styles.menuItemIcon}><Compass size={15} /></div>
                                        <span>Restart Product Tour</span>
                                    </button>

                                    <div className={styles.menuDivider} />

                                    <button className={`${styles.menuItem} ${styles.logoutMenuItem}`} onClick={logout}>
                                        <div className={styles.menuItemIcon}><LogOut size={15} /></div>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link href="/login" className={styles.loginBtn}>
                        <LogIn size={15} />
                        <span>Staff Sign In</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
