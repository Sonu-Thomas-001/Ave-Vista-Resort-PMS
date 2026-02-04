'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';

type Room = Database['public']['Tables']['rooms']['Row'];

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Default images mapping
    const getRoomImage = (roomNumber: string, type: string) => {
        // Specific Room Images
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

        // Fallback
        return 'https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/A1.JPG';
    };

    useEffect(() => {
        fetchRooms();
        fetchBookings();
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
                .select('room_id, status, check_in_date, check_out_date')
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
            alert('Cannot block an occupied room.');
            return;
        }

        const newStatus = room.status === 'Maintenance' ? 'Clean' : 'Maintenance';

        // Optimistic UI update
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));

        const { error } = await supabase
            .from('rooms')
            .update({ status: newStatus })
            .eq('id', room.id);

        if (error) {
            console.error('Error updating room:', error);
            // Revert
            fetchRooms();
        }
    };

    const handleCleanRoom = async (room: Room) => {
        if (room.status !== 'Dirty') {
            return;
        }

        // Optimistic UI update
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'Clean' } : r));

        const { error } = await supabase
            .from('rooms')
            .update({ status: 'Clean' })
            .eq('id', room.id);

        if (error) {
            console.error('Error cleaning room:', error);
            // Revert on error
            fetchRooms();
        }
    };

    const handleViewDetails = (room: Room) => {
        setSelectedRoom(room);
    };

    const getRoomStatus = (room: Room) => {
        // If booking exists for this room on selected date -> Occupied
        const isActive = bookings.some(b => b.room_id === room.id);
        if (isActive) return 'Occupied';

        // Map 'Clean' to 'Free' for display
        if (room.status === 'Clean') return 'Free';

        return room.status; // Dirty / Maintenance
    };

    const processedRooms = rooms.map(room => ({
        ...room,
        displayStatus: getRoomStatus(room)
    }));

    const filteredRooms = filter === 'All'
        ? processedRooms
        : processedRooms.filter(r => r.displayStatus === filter);

    return (
        <>
            <Header title="Room Management" />

            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <div className={styles.controls}>
                        <div className={styles.filters}>
                            {['All', 'Free', 'Occupied', 'Maintenance'].map(status => (
                                <button
                                    key={status}
                                    className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status === 'All' ? 'All Rooms' : status}
                                </button>
                            ))}
                        </div>
                        <div className={styles.datePickerWrapper}>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className={styles.datePicker}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading rooms...</div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredRooms.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                                    No rooms found. Please run the seed script.
                                </div>
                            ) : (
                                filteredRooms.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        number={room.room_number}
                                        type={room.type}
                                        status={(room.displayStatus || 'Free') as "Clean" | "Dirty" | "Maintenance" | "Occupied" | "Free"}
                                        price={`₹${room.price_per_night.toLocaleString()}`}
                                        occupancy={room.max_occupancy}
                                        imageUrl={room.image_url || getRoomImage(room.room_number, room.type)}
                                        onBlock={() => handleBlockRoom(room)}
                                        onClean={() => handleCleanRoom(room)}
                                        onDetails={() => handleViewDetails(room)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    imageUrl={getRoomImage(selectedRoom.room_number, selectedRoom.type)}
                    onClose={() => setSelectedRoom(null)}
                    onUpdate={() => {
                        fetchRooms();
                        setSelectedRoom(null); // Close modal on save, or better yet, refetch and keep open? Let's close for simplicity
                    }}
                />
            )}
        </>
    );
}
