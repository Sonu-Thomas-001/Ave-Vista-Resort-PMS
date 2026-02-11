'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Settings, ChevronDown, Calendar, Clock, Users, BedDouble, LogOut, User, X } from 'lucide-react';
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

    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);



    // Mounted state to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
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
        const lowerQuery = query.toLowerCase();
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

            // Search bookings with guest and room info
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

            // Also search bookings by guest name
            const { data: bookingsByGuest, error: bookingsByGuestError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    guests!inner (first_name, last_name),
                    rooms (room_number)
                `)
                .or(`guests.first_name.ilike.%${query}%,guests.last_name.ilike.%${query}%`)
                .limit(3);

            if (!bookingsByGuestError && bookingsByGuest) {
                bookingsByGuest.forEach((booking: any) => {
                    const guestName = booking.guests
                        ? `${booking.guests.first_name} ${booking.guests.last_name}`
                        : 'Unknown Guest';
                    const roomNumber = booking.rooms?.room_number || 'N/A';

                    // Avoid duplicates
                    if (!results.find(r => r.id === booking.id && r.type === 'booking')) {
                        results.push({
                            id: booking.id,
                            type: 'booking',
                            title: `Booking #${booking.id.slice(0, 8)}`,
                            subtitle: `${guestName} • Room ${roomNumber}`,
                            path: '/bookings'
                        });
                    }
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

            setSearchResults(results.slice(0, 8)); // Limit to 8 results
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
                return <User size={18} />;
            case 'booking':
                return <Calendar size={18} />;
            case 'room':
                return <BedDouble size={18} />;
            default:
                return <Search size={18} />;
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
                {mounted && (
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
                )}

                {/* Search */}
                <div className={`${styles.searchWrapper} ${showMobileSearch ? styles.mobileSearchOpen : ''}`} ref={searchRef}>
                    {/* Mobile Search Toggle */}
                    <button
                        className={styles.mobileSearchToggle}
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                    >
                        <Search size={20} />
                    </button>

                    <div className={styles.search}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search guests, bookings..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                        />
                        {/* Close button for mobile search */}
                        <button
                            className={styles.mobileSearchClose}
                            onClick={() => {
                                setShowMobileSearch(false);
                                setSearchQuery('');
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {showSearchResults && (
                        <div className={styles.searchResults}>
                            {searchResults.length === 0 ? (
                                <div className={styles.emptySearchState}>
                                    <Search size={32} />
                                    <p>No results found for "{searchQuery}"</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.searchResultsHeader}>
                                        <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
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
