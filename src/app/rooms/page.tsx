'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';
import { getPricingUnit, isFullResortType } from '@/lib/constants';
import {
    Bed,
    Users,
    Key,
    CheckCircle2,
    Brush,
    Wrench,
    Search,
    Calendar,
    LayoutGrid,
    List,
    RefreshCw,
    Plus,
    X,
    Sparkles,
    Eye,
    Ban,
    Clock,
    AlertCircle
} from 'lucide-react';

type Room = Database['public']['Tables']['rooms']['Row'];

export default function RoomsPage() {
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters & Controls
    const [filter, setFilter] = useState<string>('All');
    const [typeFilter, setTypeFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modals
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Default room images mapping
    const getRoomImage = (roomNumber: string, type: string) => {
        if (roomNumber === 'A1') return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A1.JPG';
        if (roomNumber === 'A2') return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A2.JPG';
        if (roomNumber === 'A3') return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A3.JPG';
        if (roomNumber === 'A4') return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A4.JPG';

        const typeLower = type.toLowerCase();
        if (typeLower.includes('family')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Family%20Cottage.jpg';
        if (typeLower.includes('dorm')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Dormitory.jpg';
        if (typeLower.includes('auditorium')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Mini%20Auditorium.jpg';
        if (typeLower.includes('pool')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Swimming%20Pool.jpg';
        if (typeLower.includes('tree')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Tree%20House.jpg';
        if (typeLower.includes('full resort')) return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A1.JPG';

        return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A1.JPG';
    };

    const fetchAllData = async () => {
        setRefreshing(true);
        await Promise.all([fetchRooms(), fetchBookings()]);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [selectedDate]);

    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .order('room_number', { ascending: true });

            if (error) throw error;
            if (data) setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    room_id,
                    status,
                    check_in_date,
                    check_out_date,
                    rooms(type),
                    guests(first_name, last_name, phone)
                `)
                .lte('check_in_date', selectedDate)
                .gt('check_out_date', selectedDate)
                .in('status', ['Confirmed', 'Checked In']);

            if (error) throw error;
            if (data) setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleBlockRoom = async (room: Room) => {
        if (room.status === 'Occupied') {
            alert('Cannot block an occupied room with guests in-house.');
            return;
        }

        const newStatus = room.status === 'Maintenance' ? 'Clean' : 'Maintenance';

        // Optimistic UI update
        setRooms(prev => prev.map(r => (r.id === room.id ? { ...r, status: newStatus } : r)));

        const { error } = await supabase
            .from('rooms')
            .update({ status: newStatus })
            .eq('id', room.id);

        if (error) {
            console.error('Error updating room:', error);
            fetchRooms();
        }
    };

    const handleCleanRoom = async (room: Room) => {
        if (room.status !== 'Dirty') {
            return;
        }

        // Optimistic UI update
        setRooms(prev => prev.map(r => (r.id === room.id ? { ...r, status: 'Clean' } : r)));

        const { error } = await supabase
            .from('rooms')
            .update({ status: 'Clean' })
            .eq('id', room.id);

        if (error) {
            console.error('Error cleaning room:', error);
            fetchRooms();
        }
    };

    const handleViewDetails = (room: Room) => {
        setSelectedRoom(room);
    };

    const getRoomActiveBooking = (roomId: string, roomType: string) => {
        const isFullResortActive = bookings.find((b: any) => isFullResortType(b.rooms?.type || ''));
        if (isFullResortType(roomType)) {
            return bookings[0] || null;
        }
        if (isFullResortActive) {
            return isFullResortActive;
        }
        return bookings.find((b: any) => b.room_id === roomId) || null;
    };

    const getRoomStatus = (room: Room, activeBooking: any) => {
        if (activeBooking) {
            return 'Occupied';
        }

        // Map database 'Clean' to user-friendly 'Free'
        if (room.status === 'Clean') return 'Free';

        return room.status; // Dirty / Maintenance
    };

    // Calculate processed rooms with live display status and guest info
    const processedRooms = useMemo(() => {
        return rooms.map(room => {
            const activeBooking = getRoomActiveBooking(room.id, room.type);
            const displayStatus = getRoomStatus(room, activeBooking);
            const guestName = activeBooking?.guests
                ? `${activeBooking.guests.first_name || ''} ${activeBooking.guests.last_name || ''}`.trim()
                : undefined;
            const checkOutDate = activeBooking?.check_out_date || undefined;

            return {
                ...room,
                displayStatus,
                guestName,
                checkOutDate,
                activeBooking
            };
        });
    }, [rooms, bookings]);

    // Unique Room Types for filtering
    const roomTypes = useMemo(() => {
        const types = new Set(rooms.map(r => r.type).filter(Boolean));
        return Array.from(types);
    }, [rooms]);

    // Summary KPIs
    const kpiStats = useMemo(() => {
        const total = processedRooms.length;
        const free = processedRooms.filter(r => r.displayStatus === 'Free').length;
        const occupied = processedRooms.filter(r => r.displayStatus === 'Occupied').length;
        const dirty = processedRooms.filter(r => r.displayStatus === 'Dirty').length;
        const maintenance = processedRooms.filter(r => r.displayStatus === 'Maintenance').length;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

        return {
            total,
            free,
            occupied,
            dirty,
            maintenance,
            attentionNeeded: dirty + maintenance,
            occupancyRate
        };
    }, [processedRooms]);

    // Filtered rooms based on Status, Room Type, and Search Query
    const filteredRooms = useMemo(() => {
        return processedRooms.filter(room => {
            // Status filter
            if (filter !== 'All' && room.displayStatus !== filter) {
                return false;
            }

            // Room Type filter
            if (typeFilter !== 'All' && room.type !== typeFilter) {
                return false;
            }

            // Search Query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNumber = room.room_number.toLowerCase().includes(q);
                const matchType = room.type.toLowerCase().includes(q);
                const matchGuest = room.guestName?.toLowerCase().includes(q);
                if (!matchNumber && !matchType && !matchGuest) {
                    return false;
                }
            }

            return true;
        });
    }, [processedRooms, filter, typeFilter, searchQuery]);

    const isViewingToday = selectedDate === todayStr;

    return (
        <>
            <Header title="Room Management" />

            <div className={styles.pageWrapper}>
                {/* 1. Luxury KPI Metric Overview Banner */}
                <div className={styles.kpiGrid}>
                    <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                        <div className={styles.kpiIconWrapper}>
                            <Key size={22} />
                        </div>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Total Inventory</span>
                            <span className={styles.kpiValue}>{kpiStats.total}</span>
                            <span className={styles.kpiSubtext}>Across all accommodation types</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                        <div className={styles.kpiIconWrapper}>
                            <CheckCircle2 size={22} />
                        </div>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Available & Ready</span>
                            <span className={styles.kpiValue}>{kpiStats.free}</span>
                            <span className={styles.kpiSubtext}>
                                {kpiStats.total > 0 ? Math.round((kpiStats.free / kpiStats.total) * 100) : 0}% vacant for booking
                            </span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiIndigo}`}>
                        <div className={styles.kpiIconWrapper}>
                            <Users size={22} />
                        </div>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Occupied / In-House</span>
                            <span className={styles.kpiValue}>{kpiStats.occupied}</span>
                            <span className={styles.kpiSubtext}>{kpiStats.occupancyRate}% occupancy today</span>
                        </div>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.kpiAmber}`}>
                        <div className={styles.kpiIconWrapper}>
                            <Wrench size={22} />
                        </div>
                        <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Housekeeping & Service</span>
                            <span className={styles.kpiValue}>{kpiStats.attentionNeeded}</span>
                            <span className={styles.kpiSubtext}>
                                {kpiStats.dirty} dirty, {kpiStats.maintenance} out of service
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Controls & Search Hub */}
                <div className={styles.toolbarCard}>
                    {/* Top Row: Search, Date Selection, Refresh & New Booking */}
                    <div className={styles.topRow}>
                        {/* Search Input */}
                        <div className={styles.searchWrapper}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search room #, cottage, guest..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            {searchQuery && (
                                <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* Date Inspection & Actions */}
                        <div className={styles.dateControls}>
                            <div className={styles.datePickerBox}>
                                <span className={styles.dateLabel}>
                                    <Calendar size={14} /> Date:
                                </span>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(val) => setSelectedDate(val)}
                                    size="sm"
                                    clearable={false}
                                />
                            </div>

                            <button
                                className={`${styles.todayBtn} ${isViewingToday ? styles.todayBtnActive : ''}`}
                                onClick={() => setSelectedDate(todayStr)}
                                title="Reset to Today"
                            >
                                <Clock size={14} /> Today
                            </button>

                            <button
                                className={styles.refreshBtn}
                                onClick={fetchAllData}
                                title="Refresh live room inventory"
                                disabled={refreshing}
                            >
                                <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                            </button>

                            <Link href="/bookings" className={styles.newBookingBtn}>
                                <Plus size={16} /> New Booking
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Row: Status Tabs & View Toggles */}
                    <div className={styles.filterBar}>
                        {/* Status Pills */}
                        <div className={styles.statusTabs}>
                            {[
                                { id: 'All', label: 'All Inventory', count: kpiStats.total },
                                { id: 'Free', label: 'Available', count: kpiStats.free },
                                { id: 'Occupied', label: 'Occupied', count: kpiStats.occupied },
                                { id: 'Dirty', label: 'Needs Cleaning', count: kpiStats.dirty },
                                { id: 'Maintenance', label: 'Out of Order', count: kpiStats.maintenance }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tabBtn} ${filter === tab.id ? styles.tabBtnActive : ''}`}
                                    onClick={() => setFilter(tab.id)}
                                >
                                    <span>{tab.label}</span>
                                    <span className={styles.tabCount}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Room Type Selector & View Mode Switcher */}
                        <div className={styles.viewAndTypeControls}>
                            {roomTypes.length > 0 && (
                                <CustomSelect
                                    options={[
                                        { label: 'All Accommodation Types', value: 'All' },
                                        ...roomTypes.map(t => ({ label: t, value: t }))
                                    ]}
                                    value={typeFilter}
                                    onChange={val => setTypeFilter(val)}
                                    size="sm"
                                    fullWidth={false}
                                    placeholder="All Types"
                                />
                            )}

                            <div className={styles.viewModeToggle}>
                                <button
                                    className={`${styles.modeBtn} ${viewMode === 'grid' ? styles.modeBtnActive : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    className={`${styles.modeBtn} ${viewMode === 'table' ? styles.modeBtnActive : ''}`}
                                    onClick={() => setViewMode('table')}
                                    title="List / Table View"
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Rooms Content Area */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={28} className={styles.spinning} style={{ color: '#0284c7' }} />
                        <span>Loading resort inventory & reservations...</span>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconWrapper}>
                            <Bed size={32} />
                        </div>
                        <h3 className={styles.emptyTitle}>No Rooms Match Your Filter</h3>
                        <p className={styles.emptySubtext}>
                            Try choosing another status tab or clear your search criteria to see all available inventory.
                        </p>
                        {(filter !== 'All' || typeFilter !== 'All' || searchQuery) && (
                            <button
                                className={styles.resetFilterBtn}
                                onClick={() => {
                                    setFilter('All');
                                    setTypeFilter('All');
                                    setSearchQuery('');
                                }}
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid Cards View */
                    <div className={styles.grid}>
                        {filteredRooms.map(room => (
                            <RoomCard
                                key={room.id}
                                number={room.room_number}
                                type={room.type}
                                status={
                                    (room.displayStatus || 'Free') as
                                        | 'Clean'
                                        | 'Dirty'
                                        | 'Maintenance'
                                        | 'Occupied'
                                        | 'Free'
                                }
                                price={`₹${room.price_per_night.toLocaleString()}${getPricingUnit(room.type)}`}
                                occupancy={room.max_occupancy}
                                guest={room.guestName}
                                checkOutDate={room.checkOutDate}
                                imageUrl={room.image_url || getRoomImage(room.room_number, room.type)}
                                onBlock={() => handleBlockRoom(room)}
                                onClean={() => handleCleanRoom(room)}
                                onDetails={() => handleViewDetails(room)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Luxury Compact Operational Table View */
                    <div className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Accommodation</th>
                                        <th>Capacity</th>
                                        <th>Base Rate</th>
                                        <th>Status</th>
                                        <th>Current Guest</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRooms.map(room => (
                                        <tr key={room.id} className={styles.tableRow}>
                                            <td>
                                                <div className={styles.roomCell}>
                                                    <img
                                                        src={room.image_url || getRoomImage(room.room_number, room.type)}
                                                        alt={`Room ${room.room_number}`}
                                                        className={styles.tableThumb}
                                                        onError={(e: any) => {
                                                            e.target.src =
                                                                'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A1.JPG';
                                                        }}
                                                    />
                                                    <div className={styles.roomCellInfo}>
                                                        <span className={styles.roomCellNumber}>
                                                            Room {room.room_number}
                                                        </span>
                                                        <span className={styles.roomCellType}>{room.type}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Users size={14} style={{ color: '#94a3b8' }} />
                                                    {room.max_occupancy} Guests
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                                    ₹{room.price_per_night.toLocaleString()}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {getPricingUnit(room.type)}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.badgeCell} ${
                                                        room.displayStatus === 'Occupied'
                                                            ? styles.badgeOccupied
                                                            : room.displayStatus === 'Dirty'
                                                            ? styles.badgeDirty
                                                            : room.displayStatus === 'Maintenance'
                                                            ? styles.badgeMaintenance
                                                            : styles.badgeFree
                                                    }`}
                                                >
                                                    {room.displayStatus === 'Occupied'
                                                        ? 'Occupied'
                                                        : room.displayStatus === 'Dirty'
                                                        ? 'Needs Cleaning'
                                                        : room.displayStatus === 'Maintenance'
                                                        ? 'Out of Order'
                                                        : 'Ready / Vacant'}
                                                </span>
                                            </td>
                                            <td>
                                                {room.guestName ? (
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                                            {room.guestName}
                                                        </div>
                                                        {room.checkOutDate && (
                                                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                                Departs {room.checkOutDate}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className={styles.tableActions} style={{ justifyContent: 'flex-end' }}>
                                                    {room.displayStatus === 'Dirty' && (
                                                        <button
                                                            className={styles.tableActionBtn}
                                                            onClick={() => handleCleanRoom(room)}
                                                            title="Mark Clean"
                                                        >
                                                            <Sparkles size={13} style={{ color: '#10b981' }} /> Clean
                                                        </button>
                                                    )}
                                                    {room.displayStatus === 'Maintenance' && (
                                                        <button
                                                            className={styles.tableActionBtn}
                                                            onClick={() => handleBlockRoom(room)}
                                                            title="Restore to Service"
                                                        >
                                                            <CheckCircle2 size={13} style={{ color: '#6366f1' }} /> Restore
                                                        </button>
                                                    )}
                                                    {room.displayStatus === 'Free' && (
                                                        <button
                                                            className={styles.tableActionBtn}
                                                            onClick={() => handleBlockRoom(room)}
                                                            title="Mark Out of Order"
                                                        >
                                                            <Ban size={13} style={{ color: '#ef4444' }} /> Block
                                                        </button>
                                                    )}
                                                    <button
                                                        className={styles.tableActionBtn}
                                                        onClick={() => handleViewDetails(room)}
                                                    >
                                                        <Eye size={13} /> Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Room Details & Management Modal */}
            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    imageUrl={selectedRoom.image_url || getRoomImage(selectedRoom.room_number, selectedRoom.type)}
                    onClose={() => setSelectedRoom(null)}
                    onUpdate={() => {
                        fetchAllData();
                        setSelectedRoom(null);
                    }}
                />
            )}
        </>
    );
}
