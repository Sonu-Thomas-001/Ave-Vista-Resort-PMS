'use client';

import { useEffect, useState } from 'react';
import { EmailService } from '@/lib/email-service';
import { Loader2, Save, X } from 'lucide-react';
import styles from './page.module.css';

export default function EmailSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [enabled, setEnabled] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    useEffect(() => {
        loadData();

        // Set up polling for real-time updates every 10 seconds
        const interval = setInterval(() => {
            loadLogs();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [tmpl, lg, st] = await Promise.all([
                EmailService.getTemplates(),
                EmailService.getLogs(),
                EmailService.getSystemEmailStatus()
            ]);
            setTemplates(tmpl || []);
            setLogs(lg || []);
            setEnabled(st);
        } catch (error) {
            console.error('Error loading email data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadLogs() {
        try {
            const lg = await EmailService.getLogs();
            setLogs(lg || []);
        } catch (error) {
            console.error('Error loading email logs:', error);
        }
    }

    async function handleToggle(checked: boolean) {
        try {
            await EmailService.toggleSystemEmails(checked);
            setEnabled(checked);
        } catch (e) {
            console.error('Failed to toggle', e);
        }
    }

    async function handleSaveTemplate(e: React.FormEvent) {
        e.preventDefault();
        if (!editingTemplate) return;

        try {
            await EmailService.updateTemplate(editingTemplate.id, editingTemplate.subject_template, editingTemplate.body_html);
            setEditingTemplate(null);
            loadData(); // refresh
        } catch (err) {
            console.error(err);
            alert('Failed to save template');
        }
    }

    function getDummyData(slug: string) {
        const base = {
            guest_name: 'John Doe',
            first_name: 'John',
            last_name: 'Doe',
            room_number: '101',
            check_in_date: '2026-03-10',
            check_out_date: '2026-03-15',
            booking_id: 'BK-2026-001',
            guests: '2 Adults',
            advance_amount: '2000',
            room_type: 'Deluxe Suite',
            total_amount: '5000'
        };

        if (slug === 'invoice-email') {
            return {
                ...base,
                invoice_number: 'INV-001',
                total_amount: '$500.00',
                payment_status: 'Paid'
            };
        }
        if (slug === 'admin-alert') {
            return {
                event_type: 'New Booking',
                description: 'John Doe booked Room 101',
                timestamp: new Date().toLocaleString(),
                dashboard_link: '#'
            };
        }
        return base;
    }

    if (loading) return <div className={styles.container}><div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div></div>;

    return (
        <div className={styles.container}>
            <div className={styles.headerCard}>
                <div>
                    <h2 className={styles.title}>Email Communication</h2>
                    <p className={styles.subtitle}>Manage confirmation emails and alerts.</p>
                </div>
                <div className={styles.toggleContainer}>
                    <span className={styles.toggleLabel}>System Emails</span>
                    <button
                        onClick={() => handleToggle(!enabled)}
                        className={`${styles.toggleBtn} ${enabled ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                    >
                        <div className={`${styles.toggleHandle} ${enabled ? styles.toggleHandleOn : ''}`}></div>
                    </button>
                    <span className={styles.toggleLabel} style={{ color: enabled ? '#16a34a' : '#6b7280' }}>
                        {enabled ? 'Active' : 'Disabled'}
                    </span>
                </div>
            </div>

            {/* Templates Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Email Templates</h3>
                </div>
                <div className={styles.content}>
                    <div className={styles.grid}>
                        {templates.map(t => (
                            <div key={t.id} className={styles.templateCard}>
                                <div className={styles.templateHeader}>
                                    <h4 className={styles.templateName}>{t.name}</h4>
                                    <button
                                        onClick={() => setEditingTemplate({ ...t, view: 'edit' })}
                                        className={styles.editBtn}
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className={styles.templateSubject}>
                                    <span style={{ fontWeight: 500 }}>Subject:</span> {t.subject_template}
                                </p>
                                <div className={styles.slug}>{t.slug}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recent Email Activity</h3>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Recipient</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No emails sent recently</td></tr>}
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td data-label="Time">{new Date(log.created_at).toLocaleString()}</td>
                                    <td data-label="Type" style={{ fontWeight: 500 }}>{log.template_slug}</td>
                                    <td data-label="Recipient">{log.recipient}</td>
                                    <td data-label="Status">
                                        <span className={`${styles.status} ${log.status === 'Sent' ? styles.statusSent :
                                            log.status === 'Failed' ? styles.statusFailed : styles.statusPending
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTemplate && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Edit Template: {editingTemplate.name}</h2>
                                <button type="button" onClick={() => setEditingTemplate(null)} className={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.tabs}>
                                    <button
                                        type="button"
                                        className={`${styles.tab} ${editingTemplate.view === 'edit' ? styles.tabActive : ''}`}
                                        onClick={() => setEditingTemplate({ ...editingTemplate, view: 'edit' })}
                                    >
                                        Edit Template
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.tab} ${editingTemplate.view === 'preview' ? styles.tabActive : ''}`}
                                        onClick={() => setEditingTemplate({ ...editingTemplate, view: 'preview' })}
                                    >
                                        Live Preview
                                    </button>
                                </div>

                                {editingTemplate.view === 'preview' ? (
                                    <div className={styles.previewContainer}>
                                        <div
                                            className={styles.previewFrame}
                                            dangerouslySetInnerHTML={{
                                                __html: (() => {
                                                    let html = editingTemplate.body_html || '';
                                                    const dummyData = getDummyData(editingTemplate.slug);
                                                    Object.keys(dummyData).forEach(key => {
                                                        const regex = new RegExp(`{{${key}}}`, 'g');
                                                        html = html.replace(regex, (dummyData as any)[key]);
                                                    });
                                                    return html;
                                                })()
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label>Email Subject</label>
                                            <input
                                                className={styles.input}
                                                value={editingTemplate.subject_template}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, subject_template: e.target.value })}
                                            />
                                            <p className={styles.helperText}>Supports {'{{variable}}'} placeholders.</p>
                                        </div>

                                        <div className={styles.formGroup} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label>HTML Body</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={editingTemplate.body_html}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setEditingTemplate(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
