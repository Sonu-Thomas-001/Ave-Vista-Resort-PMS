'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserPlus, FileClock, Sun, Moon, Sunrise, CheckCircle, Trash2, Ban } from 'lucide-react';
import styles from './page.module.css';

const initialStaff = [
    { id: 1, name: 'John Doe', role: 'Manager', shift: 'Morning', email: 'john@avevista.com', status: 'Active', permissions: ['All Access'] },
    { id: 2, name: 'Alice Ray', role: 'Receptionist', shift: 'Evening', email: 'alice@avevista.com', status: 'Active', permissions: ['Bookings', 'Guests'] },

    { id: 4, name: 'Sarah Lee', role: 'Receptionist', shift: 'Morning', email: 'sarah@avevista.com', status: 'Active', permissions: ['Bookings', 'Guests'] },
];

const logs = [
    { id: 1, user: 'John Doe', action: 'Created Invoice #INV-2026-005', time: '10 mins ago', type: 'finance' },
    { id: 2, user: 'Alice Ray', action: 'Checked in Guest (Room 101)', time: '25 mins ago', type: 'booking' },

    { id: 4, user: 'System', action: 'Daily Backup Completed', time: '2 hours ago', type: 'system' },
];

const ShiftIcon = ({ shift }: { shift: string }) => {
    switch (shift) {
        case 'Morning': return <Sunrise size={16} className={styles.shiftIcon} color="#F57F17" />;
        case 'Evening': return <Sun size={16} className={styles.shiftIcon} color="#F9A825" />;
        case 'Night': return <Moon size={16} className={styles.shiftIcon} color="#3F51B5" />;
        default: return null;
    }
};

export default function StaffPage() {
    const { isAdmin } = useAuth();
    const [staffList, setStaffList] = useState(initialStaff);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleDeactivate = (id: number) => {
        if (confirm('Are you sure you want to deactivate this user?')) {
            setStaffList(staffList.map(s => s.id === id ? { ...s, status: 'Inactive' } : s));
        }
    };

    return (
        <>
            <Header title="Staff & Roles" />

            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Team Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.titleGroup}>
                                <Shield size={20} className={styles.icon} />
                                <h3>Team Members</h3>
                            </div>
                            {isAdmin && (
                                <button
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    onClick={() => alert('Add User Modal would open here.')}
                                >
                                    <UserPlus size={16} /> Add Staff
                                </button>
                            )}
                        </div>

                        <div className={styles.tableHeader} style={{ gridTemplateColumns: isAdmin ? '2fr 1fr 1fr 0.5fr' : '2fr 1fr 1fr' }}>
                            <span>Name / Role</span>
                            <span>Shift</span>
                            <span>Status</span>
                            {isAdmin && <span>Actions</span>}
                        </div>

                        <div className={styles.list}>
                            {staffList.map((member) => (
                                <div key={member.id} className={styles.item} style={{ gridTemplateColumns: isAdmin ? '2fr 1fr 1fr 0.5fr' : '2fr 1fr 1fr' }}>
                                    <div className={styles.info}>
                                        <div className={styles.avatar}>{member.name[0]}</div>
                                        <div>
                                            <div className={styles.name}>
                                                {member.name}
                                                {member.role === 'Manager' && <Shield size={12} fill="#FFD700" color="#F57F17" style={{ marginLeft: 6 }} />}
                                            </div>
                                            <div className={styles.role}>{member.role}</div>
                                        </div>
                                    </div>

                                    <div className={styles.shift}>
                                        <ShiftIcon shift={member.shift} />
                                        <span>{member.shift}</span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={`${styles.status} ${member.status === 'Active' ? styles.active : styles.inactive}`}>
                                            {member.status}
                                        </span>
                                    </div>

                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}
                                                onClick={() => handleDeactivate(member.id)}
                                                title="Deactivate User"
                                            >
                                                <Ban size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.titleGroup}>
                                <FileClock size={20} className={styles.icon} />
                                <h3>Activity Log</h3>
                            </div>
                        </div>

                        <div className={styles.logList}>
                            {logs.map((log) => (
                                <div key={log.id} className={styles.logItem}>
                                    <div className={styles.logIcon}>
                                        <CheckCircle size={14} />
                                    </div>
                                    <div className={styles.logContent}>
                                        <div className={styles.logHeader}>
                                            <span className={styles.logUser}>{log.user}</span>
                                            <span className={styles.logTime}>{log.time}</span>
                                        </div>
                                        <div className={styles.logAction}>{log.action}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
