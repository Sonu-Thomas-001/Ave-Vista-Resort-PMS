import Header from '@/components/Header';
import { User, Phone, Mail, MapPin, Clock, FileText, Shield, Star } from 'lucide-react';
import styles from './page.module.css';

import { use } from 'react';

export default async function GuestProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Mock data - in real app fetch based on id
    const guest = {
        id: id,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        address: '123, Green Park, New Delhi',
        nationality: 'Indian',
        vip: true,
        history: [
            { id: 101, room: '101 - Deluxe', checkIn: '02 Feb 2026', checkOut: '05 Feb 2026', status: 'Current' },
            { id: 54, room: '105 - Standard', checkIn: '12 Dec 2025', checkOut: '14 Dec 2025', status: 'Completed' },
        ]
    };

    return (
        <>
            <Header title="Guest Profile" />

            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Profile Card */}
                    <div className={styles.card}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatarLarge}>{guest.name[0]}</div>
                            <div>
                                <h2 className={styles.profileName}>
                                    {guest.name}
                                    {guest.vip && <Star size={18} fill="#F57F17" color="#F57F17" style={{ marginLeft: 8 }} />}
                                </h2>
                                <div className={styles.tags}>
                                    <span className={styles.tag}>VIP Guest</span>
                                    <span className={styles.tag}>Repeat Customer</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <Mail size={16} className={styles.icon} />
                                <span>{guest.email}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <Phone size={16} className={styles.icon} />
                                <span>{guest.phone}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={16} className={styles.icon} />
                                <span>{guest.address}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <Shield size={16} className={styles.icon} />
                                <span>ID: Aadhar XXXX-1234</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Preferences */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Notes & Preferences</h3>
                        <textarea
                            className={styles.notesInput}
                            placeholder="Add notes here (e.g. loves corner room, allergic to nuts)..."
                            rows={4}
                        ></textarea>
                        <div className={styles.notesList}>
                            <div className={styles.note}>
                                <span className={styles.noteDate}>12 Dec 2025</span>
                                <p>Requested extra pillows.</p>
                            </div>
                        </div>
                    </div>

                    {/* Stay History */}
                    <div className={`${styles.card} ${styles.fullWidth}`}>
                        <h3 className={styles.cardTitle}>Stay History</h3>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guest.history.map(stay => (
                                    <tr key={stay.id}>
                                        <td data-label="Room">{stay.room}</td>
                                        <td data-label="Check-in">{stay.checkIn}</td>
                                        <td data-label="Check-out">{stay.checkOut}</td>
                                        <td data-label="Status">
                                            <span className={`${styles.status} ${styles[stay.status.toLowerCase()]}`}>
                                                {stay.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
