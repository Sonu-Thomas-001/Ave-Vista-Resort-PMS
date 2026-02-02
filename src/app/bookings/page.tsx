'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import BookingList from '@/components/BookingList';
import NewBookingModal from '@/components/NewBookingModal';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';
import styles from './page.module.css';

export default function BookingsPage() {
    const [view, setView] = useState<'calendar' | 'list'>('list'); // Default to list to see data
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Header title="Reservations" />

            <div className={styles.container}>
                <div className={styles.controls}>
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${view === 'calendar' ? styles.active : ''}`}
                            onClick={() => setView('calendar')}
                        >
                            <CalendarIcon size={16} /> Calendar
                        </button>
                        <button
                            className={`${styles.filterBtn} ${view === 'list' ? styles.active : ''}`}
                            onClick={() => setView('list')}
                        >
                            <List size={16} /> List View
                        </button>
                    </div>

                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        New Booking
                    </button>
                </div>

                <div className={styles.contentWrapper}>
                    {view === 'calendar' ? <AvailabilityCalendar /> : <BookingList />}
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
                        {/* Simple wrapper if needed, or just the component handles overlay */}
                        <NewBookingModal
                            onClose={() => setShowModal(false)}
                            onSuccess={() => {
                                // Optional: refresh list if not using realtime, but we are.
                                setShowModal(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
