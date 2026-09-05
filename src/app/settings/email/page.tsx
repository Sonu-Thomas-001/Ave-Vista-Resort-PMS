'use client';

import { useEffect, useState } from 'react';
import { EmailService } from '@/lib/email-service';
import { Loader2, Save, X, Mail, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import styles from './page.module.css';

export default function EmailSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [enabled, setEnabled] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    useEffect(() => {
        loadData();

        // Polling for email logs every 10s
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
            loadData();
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
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            room_number: '101',
            check_in_date: '2026-03-10',
            check_out_date: '2026-03-15',
            invoice_date: '2026-03-10',
            booking_id: 'AVBK1001',
            booking_type: 'Standard',
            guests: '2 Adults',
            advance_amount: '2000',
            room_type: 'Deluxe Suite',
            total_amount: '5000',
            payment_mode: 'Cash',
            gst_rate: '12',
            gst_amount: '600',
            paid_amount: '2000',
            balance_due: '3600',
            company_name: 'Tech Solutions Pvt Ltd',
            gst_number: '29ABCDE1234F1Z5',
            address: '456, Cyber City, Bangalore, Karnataka - 560001',
            room_rate: '4000',
            extra_pax: '2',
            extra_pax_rate: '300',
            nights: '5',
        };

        if (slug === 'invoice-email') {
            return {
                ...base,
                invoice_number: 'INV-001',
                total_amount: '5000',
                payment_status: 'Paid',
                status: 'Partial'
            };
        }
        if (slug === 'admin-alert') {
            return {
                event_type: 'New Booking',
                booking_id: 'AVBK1001',
                guest_name: 'John Doe',
                room_number: '101',
                booking_type: 'Standard',
                total_amount: '5000',
                description: 'John Doe booked Room 101 for 5 nights',
                timestamp: new Date().toLocaleString(),
                dashboard_link: '#'
            };
        }
        return base;
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#10b981' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header / Master Switch */}
            <div className={styles.headerCard}>
                <div>
                    <h2 className={styles.title}>Email Communication</h2>
                    <p className={styles.subtitle}>Automated booking confirmations, invoices, and front-desk alerts.</p>
                </div>
                <div className={styles.toggleContainer}>
                    <span className={styles.toggleLabel}>System Emails:</span>
                    <button
                        type="button"
                        onClick={() => handleToggle(!enabled)}
                        className={`${styles.toggleBtn} ${enabled ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                    >
                        <div className={`${styles.toggleHandle} ${enabled ? styles.toggleHandleOn : ''}`}></div>
                    </button>
                    <span className={`${styles.statusIndicator} ${enabled ? styles.active : styles.disabled}`}>
                        {enabled ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
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
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Subject:</span> {t.subject_template}
                                </p>
                                <div className={styles.templateFooter}>
                                    <div className={styles.slug}>{t.slug}</div>
                                </div>
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
                                <th>Timestamp</th>
                                <th>Template Type</th>
                                <th>Recipient</th>
                                <th>Delivery Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        No emails sent recently
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.created_at).toLocaleString()}</td>
                                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.template_slug}</td>
                                        <td>{log.recipient}</td>
                                        <td>
                                            <span className={`${styles.status} ${
                                                log.status === 'Sent' ? styles.statusSent :
                                                log.status === 'Failed' ? styles.statusFailed : styles.statusPending
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                                        Live HTML Preview
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
                                            <p className={styles.helperText}>Supports dynamic {'{{variable}}'} placeholders.</p>
                                        </div>

                                        <div className={styles.formGroup} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label>HTML Email Body</label>
                                            <div className={styles.variableChipsBar}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Insert Placeholders:</span>
                                                {['{{guest_name}}', '{{room_number}}', '{{room_type}}', '{{check_in_date}}', '{{check_out_date}}', '{{booking_id}}', '{{total_amount}}', '{{paid_amount}}', '{{balance_due}}'].map(chip => (
                                                    <span
                                                        key={chip}
                                                        className={styles.variableChip}
                                                        title="Click to insert"
                                                        onClick={() => {
                                                            setEditingTemplate({
                                                                ...editingTemplate,
                                                                body_html: (editingTemplate.body_html || '') + ' ' + chip
                                                            });
                                                        }}
                                                    >
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>
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
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
