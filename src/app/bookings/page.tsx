'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import BookingList from '@/components/BookingList';
import NewBookingModal from '@/components/NewBookingModal';
import { CalendarPlus, CalendarDays, LayoutList } from 'lucide-react';
import styles from './page.module.css';

export default function BookingsPage() {
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Header title="Reservations & Bookings" />

            <main className={styles.container}>
                {/* Control Bar: View Switcher & Primary Action */}
                <div className={styles.controlsBar}>
                    <div className={styles.viewSwitcher}>
                        <button
                            className={`${styles.switchBtn} ${view === 'list' ? styles.activeSwitch : ''}`}
                            onClick={() => setView('list')}
                            aria-label="List View"
                        >
                            <LayoutList size={16} strokeWidth={2.2} />
                            <span>List View</span>
                        </button>

                        <button
                            className={`${styles.switchBtn} ${view === 'calendar' ? styles.activeSwitch : ''}`}
                            onClick={() => setView('calendar')}
                            aria-label="Availability Calendar"
                        >
                            <CalendarDays size={16} strokeWidth={2.2} />
                            <span>Availability Calendar</span>
                        </button>
                    </div>

                    <button
                        className={styles.newBookingBtn}
                        onClick={() => setShowModal(true)}
                    >
                        <CalendarPlus size={18} strokeWidth={2.2} />
                        <span>New Reservation</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className={styles.contentWrapper}>
                    {view === 'calendar' ? <AvailabilityCalendar /> : <BookingList />}
                </div>

                {/* New Booking Modal */}
                {showModal && (
                    <NewBookingModal
                        onClose={() => setShowModal(false)}
                        onSuccess={() => setShowModal(false)}
                    />
                )}
            </main>
        </>
    );
}
