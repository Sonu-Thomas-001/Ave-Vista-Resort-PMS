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
    Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Header({ title = "Dashboard" }: HeaderProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Real-time stats state
    const [todaysBookings, setTodaysBookings] = useState(0);
    const [roomStats, setRoomStats] = useState({ occupied: 0, total: 0 });

    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Mounted state to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchRealTimeStats();

        // Subscribe to changes
        const bookingsSubscription = supabase
            .channel('header-bookings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchTodaysBookings();
            })
            .subscribe();

        const roomsSubscription = supabase
            .channel('header-rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRoomStats();
            })
            .subscribe();

        return () => {
            bookingsSubscription.unsubscribe();
            roomsSubscription.unsubscribe();
        };
    }, []);

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

    // Update time every second for real-time live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Global shortcut (Ctrl+K / Cmd+K) to focus search
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

    return (
        <header className={styles.header}>
            {/* Left Section: Title & Luxury Breadcrumbs */}
            <div className={styles.leftSection}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{title}</h1>
                    <div className={styles.breadcrumbs}>
                        <span className={styles.breadcrumbDot} />
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.path} className={styles.breadcrumb}>
                                {index > 0 && <span className={styles.separator}>/</span>}
                                <span>{crumb.label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Section: Live Metrics & Controls */}
            <div className={styles.rightSection}>
                {/* Real-time Clock Capsule */}
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

                {/* Spotlight / Command Search */}
                <div
                    className={`${styles.searchWrapper} ${showMobileSearch ? styles.mobileSearchOpen : ''}`}
                    ref={searchRef}
                >
                    {/* Mobile Search Toggle */}
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

                        {/* Mobile close button */}
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

                {/* Live Operations Stat Chips */}
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

                {/* Quick Action: Settings */}
                <button
                    className={styles.iconBtn}
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
                            <span className={styles.userName}>{user?.name || 'Guest User'}</span>
                            <div className={styles.roleContainer}>
                                <span className={`${styles.roleBadge} ${styles[user?.role?.toLowerCase() || 'admin']}`}>
                                    {user?.role || 'Admin'}
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

                            <div className={styles.menuDivider} />

                            <button className={`${styles.menuItem} ${styles.logoutMenuItem}`} onClick={logout}>
                                <div className={styles.menuItemIcon}><LogOut size={15} /></div>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
