'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Save, Building, CreditCard, LayoutGrid, Bell, Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './page.module.css';
import EmailSettingsPage from './email/page';
import RoomModal from '@/components/RoomModal';

type SettingsData = Database['public']['Tables']['app_settings']['Row'];
type RoomData = Database['public']['Tables']['rooms']['Row'];

export default function SettingsPage() {
    const [activeTopTab, setActiveTopTab] = useState('Property');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchRooms();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase.from('app_settings').select('*').single();
        if (data) setSettings(data);
    };

    const fetchRooms = async () => {
        const { data } = await supabase.from('rooms').select('*').order('room_number');
        if (data) setRooms(data);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('app_settings')
                .update({
                    ...settings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 1);

            if (error) throw error;
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof SettingsData, value: string | number) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const handleAddRoom = () => {
        setEditingRoom(null);
        setShowRoomModal(true);
    };

    const handleEditRoom = (room: RoomData) => {
        setEditingRoom(room);
        setShowRoomModal(true);
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm('Are you sure you want to delete this room?')) return;

        try {
            const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId);

            if (error) throw error;
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Failed to delete room.');
        }
    };

    const handleRoomSuccess = () => {
        setShowRoomModal(false);
        setEditingRoom(null);
        fetchRooms();
    };

    return (
        <>
            <Header title="Settings" />

            <div className={styles.container}>
                <div className={styles.layout}>
                    {/* Settings Navigation */}
                    <aside className={styles.sidebar}>
                        <button
                            className={`${styles.navBtn} ${activeTopTab === 'Property' ? styles.active : ''}`}
                            onClick={() => setActiveTopTab('Property')}
                        >
                            <Building size={18} /> Property Profile
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTopTab === 'Rooms' ? styles.active : ''}`}
                            onClick={() => setActiveTopTab('Rooms')}
                        >
                            <LayoutGrid size={18} /> Room Configuration
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTopTab === 'Finance' ? styles.active : ''}`}
                            onClick={() => setActiveTopTab('Finance')}
                        >
                            <CreditCard size={18} /> Taxes & Payments
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTopTab === 'Email' ? styles.active : ''}`}
                            onClick={() => setActiveTopTab('Email')}
                        >
                            <Bell size={18} /> Email Notifications
                        </button>
                    </aside>

                    {/* Content Area */}
                    <main className={styles.content}>
                        {activeTopTab === 'Email' && <EmailSettingsPage />}
                        {activeTopTab === 'Property' && settings && (
                            <form onSubmit={handleSaveSettings} className={styles.section}>
                                <h2>Property Details</h2>
                                <p className={styles.subtitle}>Manage your resort's public information.</p>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Resort Name</label>
                                        <input
                                            type="text"
                                            value={settings.resort_name || ''}
                                            onChange={(e) => handleInputChange('resort_name', e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={settings.contact_email || ''}
                                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone Number</label>
                                        <input
                                            type="text"
                                            placeholder="+91..."
                                            className={styles.input}
                                        // Add schema field if needed, currently using basic inputs
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Website</label>
                                        <input
                                            type="text"
                                            placeholder="www.example.com"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label>Address</label>
                                        <textarea
                                            value={settings.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className={styles.textarea}
                                        />
                                    </div>
                                </div>

                                <div className={styles.actionRow}>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTopTab === 'Rooms' && (
                            <div className={styles.section}>
                                <div className={styles.headerRow}>
                                    <h2>Room Configuration</h2>
                                    <button className={styles.secondaryBtn} onClick={handleAddRoom}>
                                        <Plus size={16} /> Add Room
                                    </button>
                                </div>
                                <p className={styles.subtitle}> manage room types and pricing.</p>

                                <div className={styles.tableWrapper}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Room No</th>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Occupancy</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rooms.map((room) => (
                                                <tr key={room.id}>
                                                    <td>{room.room_number}</td>
                                                    <td>{room.type}</td>
                                                    <td>₹{room.price_per_night}</td>
                                                    <td>{room.max_occupancy}</td>
                                                    <td>
                                                        <span className={`${styles.badge} ${styles[room.status?.toLowerCase() || 'clean']}`}>
                                                            {room.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <button className={styles.iconBtn} onClick={() => handleEditRoom(room)}><Edit2 size={16} /></button>
                                                            <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDeleteRoom(room.id)}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTopTab === 'Finance' && settings && (
                            <form onSubmit={handleSaveSettings} className={styles.section}>
                                <h2>Taxes & Charges</h2>
                                <p className={styles.subtitle}>Configure GST and service charges.</p>

                                <div className={styles.card}>
                                    <h3>GST Configuration</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>GSTIN Number</label>
                                            <input
                                                type="text"
                                                value={settings.gst_number || ''}
                                                onChange={(e) => handleInputChange('gst_number', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={settings.tax_rate || 0}
                                                onChange={(e) => handleInputChange('tax_rate', Number(e.target.value))}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.actionRow}>
                                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                        <Save size={16} /> Save Finance Settings
                                    </button>
                                </div>
                            </form>
                        )}
                    </main>
                </div>
            </div>

            {/* Room Modal */}
            {showRoomModal && (
                <RoomModal
                    room={editingRoom}
                    onClose={() => setShowRoomModal(false)}
                    onSuccess={handleRoomSuccess}
                />
            )}
        </>
    );
}
