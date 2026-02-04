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
            console.error(error);
        } finally {
            setLoading(false);
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
                                        onClick={() => setEditingTemplate(t)}
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
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td style={{ fontWeight: 500 }}>{log.template_slug}</td>
                                    <td>{log.recipient}</td>
                                    <td>
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
