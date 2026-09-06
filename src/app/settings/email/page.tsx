'use client';

import { useEffect, useState, useMemo } from 'react';
import { EmailService } from '@/lib/email-service';
import { 
    DEFAULT_EMAIL_TEMPLATES, 
    getDefaultTemplateBySlug, 
    getInterpolatedTemplateHtml,
    EmailTemplateDefinition 
} from '@/lib/default-email-templates';
import { 
    Loader2, Save, X, Mail, CheckCircle2, AlertCircle, RefreshCw, 
    Smartphone, Monitor, Send, RotateCcw, Eye, Code, SlidersHorizontal,
    Sparkles, Check, Copy, ExternalLink
} from 'lucide-react';
import styles from './page.module.css';

export default function EmailSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [dbTemplates, setDbTemplates] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [enabled, setEnabled] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    // Modal state
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [activeModalTab, setActiveModalTab] = useState<'preview' | 'code' | 'test'>('preview');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [customDummyData, setCustomDummyData] = useState<Record<string, string>>({});
    const [testRecipient, setTestRecipient] = useState<string>('avevistaresort@gmail.com');
    const [sendingTest, setSendingTest] = useState(false);
    const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [syncingAll, setSyncingAll] = useState(false);
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

    useEffect(() => {
        loadData();

        // Polling for email logs every 15s
        const interval = setInterval(() => {
            loadLogs();
        }, 15000);

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
            setDbTemplates(tmpl || []);
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
            alert('Failed to update email status');
        }
    }

    // Merge database templates with default templates
    const combinedTemplates = useMemo(() => {
        return DEFAULT_EMAIL_TEMPLATES.map(def => {
            const matchedDb = dbTemplates.find(t => t.slug === def.slug);
            return {
                id: matchedDb?.id,
                slug: def.slug,
                name: matchedDb?.name || def.name,
                category: def.category,
                description: def.description,
                subject_template: matchedDb?.subject_template || def.subject_template,
                body_html: matchedDb?.body_html || def.body_html,
                available_variables: def.available_variables,
                default_dummy: def.dummy_data,
                is_synced: !!matchedDb,
                updated_at: matchedDb?.updated_at
            };
        });
    }, [dbTemplates]);

    const filteredTemplates = useMemo(() => {
        if (selectedCategory === 'All') return combinedTemplates;
        return combinedTemplates.filter(t => t.category === selectedCategory);
    }, [combinedTemplates, selectedCategory]);

    const stats = useMemo(() => {
        const total = combinedTemplates.length;
        const sentCount = logs.filter(l => l.status === 'Sent').length;
        const failedCount = logs.filter(l => l.status === 'Failed').length;
        return { total, sentCount, failedCount };
    }, [combinedTemplates, logs]);

    function openTemplateModal(tmpl: any, tab: 'preview' | 'code' | 'test' = 'preview') {
        const defaultDef = getDefaultTemplateBySlug(tmpl.slug);
        setEditingTemplate({
            ...tmpl,
            id: tmpl.id,
            subject_template: tmpl.subject_template,
            body_html: tmpl.body_html,
        });
        setCustomDummyData({ ...(defaultDef?.dummy_data || tmpl.default_dummy || {}) });
        setActiveModalTab(tab);
        setTestFeedback(null);
    }

    async function handleSaveTemplate(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!editingTemplate) return;

        try {
            let updated;
            if (editingTemplate.id) {
                updated = await EmailService.updateTemplate(
                    editingTemplate.id,
                    editingTemplate.subject_template,
                    editingTemplate.body_html
                );
            } else {
                // If template didn't exist in DB, reset / upsert it
                await EmailService.syncAllDefaultTemplates();
            }

            await loadData();
            alert('Template updated successfully!');
            setEditingTemplate(null);
        } catch (err: any) {
            console.error(err);
            alert('Failed to save template: ' + (err.message || 'Unknown error'));
        }
    }

    async function handleRestoreDefault() {
        if (!editingTemplate) return;
        if (!confirm(`Are you sure you want to restore "${editingTemplate.name}" to its modern luxury default design? Any custom changes will be overwritten.`)) {
            return;
        }

        const defaultDef = getDefaultTemplateBySlug(editingTemplate.slug);
        if (!defaultDef) return;

        setEditingTemplate({
            ...editingTemplate,
            subject_template: defaultDef.subject_template,
            body_html: defaultDef.body_html
        });
        setCustomDummyData({ ...defaultDef.dummy_data });
        alert('Restored modern default design. Click "Save Changes" to commit.');
    }

    async function handleSyncAllTemplates() {
        if (!confirm('This will seed or update all 9 email templates in your Supabase database with the modern luxury designs. Proceed?')) {
            return;
        }

        try {
            setSyncingAll(true);
            await EmailService.syncAllDefaultTemplates();
            await loadData();
            alert('All 9 email templates have been synced and updated in Supabase successfully!');
        } catch (err: any) {
            console.error('Error syncing templates:', err);
            alert('Failed to sync templates: ' + (err.message || 'Unknown error'));
        } finally {
            setSyncingAll(false);
        }
    }

    async function handleSendTest() {
        if (!editingTemplate || !testRecipient) return;

        try {
            setSendingTest(true);
            setTestFeedback(null);

            await EmailService.sendTestEmail(
                testRecipient,
                editingTemplate.slug,
                editingTemplate.subject_template,
                editingTemplate.body_html,
                customDummyData
            );

            setTestFeedback({
                type: 'success',
                message: `Test email dispatched to ${testRecipient}! Check your inbox (and spam folder).`
            });
            await loadLogs();
        } catch (err: any) {
            console.error('Error sending test email:', err);
            setTestFeedback({
                type: 'error',
                message: err.message || 'Failed to dispatch test email. Please check your SMTP settings.'
            });
        } finally {
            setSendingTest(false);
        }
    }

    function insertVariable(variable: string) {
        if (!editingTemplate) return;
        setEditingTemplate({
            ...editingTemplate,
            body_html: (editingTemplate.body_html || '') + ' ' + variable
        });
        setCopiedVariable(variable);
        setTimeout(() => setCopiedVariable(null), 1800);
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <Loader2 className="animate-spin" size={36} />
                    <p style={{ marginTop: '12px', fontWeight: 600, color: '#64748b' }}>
                        Loading Ave Vista email system...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Top Overview & Master Controls */}
            <div className={styles.headerCard}>
                <div className={styles.headerInfo}>
                    <div className={styles.badgeRow}>
                        <span className={styles.luxuryPill}>
                            <Sparkles size={13} style={{ marginRight: '4px' }} />
                            Luxury Hospitality Suite
                        </span>
                        <span className={styles.versionBadge}>v2.0 Modern Redesign</span>
                    </div>
                    <h2 className={styles.title}>Email Communications & Automation</h2>
                    <p className={styles.subtitle}>
                        Automated guest confirmations, pre-arrival guides, executive invoices, and front-desk operational alerts.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    {/* System Master Switch */}
                    <div className={styles.toggleContainer}>
                        <span className={styles.toggleLabel}>System Emails:</span>
                        <button
                            type="button"
                            onClick={() => handleToggle(!enabled)}
                            className={`${styles.toggleBtn} ${enabled ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                            title={enabled ? 'Click to disable system emails' : 'Click to enable system emails'}
                        >
                            <div className={`${styles.toggleHandle} ${enabled ? styles.toggleHandleOn : ''}`}></div>
                        </button>
                        <span className={`${styles.statusIndicator} ${enabled ? styles.active : styles.disabled}`}>
                            {enabled ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {enabled ? 'Active' : 'Paused'}
                        </span>
                    </div>

                    {/* Sync / Reset All Templates to Database */}
                    <button
                        type="button"
                        onClick={handleSyncAllTemplates}
                        disabled={syncingAll}
                        className={styles.syncBtn}
                        title="Seed or update all 9 modern templates in Supabase"
                    >
                        <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
                        {syncingAll ? 'Syncing...' : 'Sync System Templates'}
                    </button>
                </div>
            </div>

            {/* Metric Overview Counters */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Available Templates</div>
                    <div className={styles.statValue}>{stats.total}</div>
                    <div className={styles.statSub}>9 Modern Designs Active</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Recent Deliveries</div>
                    <div className={styles.statValue} style={{ color: '#059669' }}>{stats.sentCount}</div>
                    <div className={styles.statSub}>Successfully Dispatched</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Delivery Issues</div>
                    <div className={styles.statValue} style={{ color: stats.failedCount > 0 ? '#dc2626' : '#64748b' }}>
                        {stats.failedCount}
                    </div>
                    <div className={styles.statSub}>Logged Failures</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Template Categories</div>
                    <div className={styles.statValue} style={{ color: '#0f766e' }}>3</div>
                    <div className={styles.statSub}>Stays &bull; Billing &bull; Operations</div>
                </div>
            </div>

            {/* Template Gallery Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Email Templates Gallery</h3>
                        <p className={styles.sectionSub}>Select any template to inspect live mobile/desktop layouts or edit content.</p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className={styles.filterPills}>
                        {['All', 'Guest Stays', 'Billing & Dining', 'Operations'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                className={`${styles.filterPill} ${selectedCategory === cat ? styles.filterPillActive : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.grid}>
                        {filteredTemplates.map(t => (
                            <div key={t.slug} className={styles.templateCard}>
                                <div>
                                    <div className={styles.templateTopRow}>
                                        <span className={`${styles.categoryBadge} ${
                                            t.category === 'Guest Stays' ? styles.catStays :
                                            t.category === 'Billing & Dining' ? styles.catBilling : styles.catOps
                                        }`}>
                                            {t.category}
                                        </span>
                                        <span className={styles.slugBadge}>
                                            #{t.slug}
                                        </span>
                                    </div>

                                    <h4 className={styles.templateName}>{t.name}</h4>
                                    <p className={styles.templateDesc}>{t.description}</p>
                                </div>

                                <div className={styles.subjectBox}>
                                    <span className={styles.subjectLabel}>Subject:</span>
                                    <span className={styles.subjectText}>{t.subject_template}</span>
                                </div>

                                <div className={styles.templateFooter}>
                                    <span className={styles.variableCount}>
                                        {t.available_variables.length} Dynamic Placeholders
                                    </span>

                                    <div className={styles.actionButtonsGroup}>
                                        <button
                                            type="button"
                                            onClick={() => openTemplateModal(t, 'preview')}
                                            className={styles.previewBtn}
                                            title="View responsive live preview"
                                        >
                                            <Eye size={14} /> Preview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openTemplateModal(t, 'code')}
                                            className={styles.editBtn}
                                            title="Edit HTML and subject"
                                        >
                                            <Code size={14} /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Email Activity Logs */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Recent Email Activity & Delivery Logs</h3>
                        <p className={styles.sectionSub}>Real-time delivery status for all outgoing resort communications.</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadLogs}
                        className={styles.iconRefreshBtn}
                        title="Refresh activity logs"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Template</th>
                                <th>Recipient Email</th>
                                <th>Delivery Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                                        No emails sent recently
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#64748b' }}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={styles.slugPill}>
                                                {log.template_slug}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                            {log.recipient}
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${
                                                log.status === 'Sent' ? styles.statusSent :
                                                log.status === 'Failed' ? styles.statusFailed : styles.statusPending
                                            }`}>
                                                {log.status === 'Sent' && <CheckCircle2 size={12} />}
                                                {log.status === 'Failed' && <AlertCircle size={12} />}
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

            {/* =========================================================================
                MODAL: FULL-FEATURED TEMPLATE EDITOR & LIVE SIMULATOR
               ========================================================================= */}
            {editingTemplate && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            
                            {/* Modal Header */}
                            <div className={styles.modalHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className={styles.modalIconWrap}>
                                        <Mail size={18} color="#0f766e" />
                                    </div>
                                    <div>
                                        <h2 className={styles.modalTitle}>{editingTemplate.name}</h2>
                                        <span className={styles.modalSlugTag}>slug: {editingTemplate.slug}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditingTemplate(null)}
                                    className={styles.closeBtn}
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Tabs Bar */}
                            <div className={styles.modalTabsBar}>
                                <div className={styles.tabs}>
                                    <button
                                        type="button"
                                        className={`${styles.tab} ${activeModalTab === 'preview' ? styles.tabActive : ''}`}
                                        onClick={() => setActiveModalTab('preview')}
                                    >
                                        <Eye size={15} /> Live Interactive Preview
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.tab} ${activeModalTab === 'code' ? styles.tabActive : ''}`}
                                        onClick={() => setActiveModalTab('code')}
                                    >
                                        <Code size={15} /> HTML & Subject Editor
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.tab} ${activeModalTab === 'test' ? styles.tabActive : ''}`}
                                        onClick={() => setActiveModalTab('test')}
                                    >
                                        <Send size={15} /> Send Test Dispatch
                                    </button>
                                </div>

                                {/* Preview Device Switcher (when in preview tab) */}
                                {activeModalTab === 'preview' && (
                                    <div className={styles.deviceSwitcher}>
                                        <button
                                            type="button"
                                            className={`${styles.deviceBtn} ${previewDevice === 'desktop' ? styles.deviceBtnActive : ''}`}
                                            onClick={() => setPreviewDevice('desktop')}
                                            title="Desktop wide layout (640px)"
                                        >
                                            <Monitor size={15} /> Desktop
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.deviceBtn} ${previewDevice === 'mobile' ? styles.deviceBtnActive : ''}`}
                                            onClick={() => setPreviewDevice('mobile')}
                                            title="Mobile responsive phone layout (375px)"
                                        >
                                            <Smartphone size={15} /> Mobile Phone
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Content Body */}
                            <div className={styles.modalBody}>
                                
                                {/* TAB 1: LIVE INTERACTIVE PREVIEW */}
                                {activeModalTab === 'preview' && (
                                    <div className={styles.previewSplitLayout}>
                                        
                                        {/* Viewport Frame */}
                                        <div className={styles.viewportWrapper}>
                                            <div className={`${styles.viewportContainer} ${
                                                previewDevice === 'mobile' ? styles.viewportMobile : styles.viewportDesktop
                                            }`}>
                                                {/* Mobile Device Frame Elements */}
                                                {previewDevice === 'mobile' && (
                                                    <div className={styles.phoneNotchBar}>
                                                        <div className={styles.phoneSpeaker}></div>
                                                        <div className={styles.phoneCamera}></div>
                                                    </div>
                                                )}

                                                <div
                                                    className={styles.emailContentFrame}
                                                    dangerouslySetInnerHTML={{
                                                        __html: getInterpolatedTemplateHtml(
                                                            editingTemplate.slug,
                                                            editingTemplate.body_html,
                                                            customDummyData
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Collapsible / Floating Sample Data Inspector */}
                                        <div className={styles.sampleDataPanel}>
                                            <div className={styles.panelHeader}>
                                                <SlidersHorizontal size={14} />
                                                <span>Live Sample Data Tester</span>
                                            </div>
                                            <p className={styles.panelHelper}>
                                                Edit values below to test how dynamic tags look in this email:
                                            </p>

                                            <div className={styles.sampleFieldsList}>
                                                {Object.keys(customDummyData).map(key => (
                                                    <div key={key} className={styles.sampleFieldRow}>
                                                        <label className={styles.sampleLabel}>{`{{${key}}}`}</label>
                                                        <input
                                                            type="text"
                                                            className={styles.sampleInput}
                                                            value={customDummyData[key]}
                                                            onChange={e => setCustomDummyData({
                                                                ...customDummyData,
                                                                [key]: e.target.value
                                                            })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: HTML & SUBJECT EDITOR */}
                                {activeModalTab === 'code' && (
                                    <div className={styles.editorLayout}>
                                        {/* Subject Input */}
                                        <div className={styles.formGroup}>
                                            <label className={styles.inputLabel}>
                                                Email Subject Template
                                            </label>
                                            <input
                                                className={styles.subjectInput}
                                                value={editingTemplate.subject_template}
                                                onChange={e => setEditingTemplate({
                                                    ...editingTemplate,
                                                    subject_template: e.target.value
                                                })}
                                                placeholder="e.g. Booking Confirmed: {{booking_id}} - Ave Vista Resort"
                                            />
                                            <span className={styles.inputHelper}>
                                                Supports placeholders like <code>{'{{guest_name}}'}</code> or <code>{'{{booking_id}}'}</code>.
                                            </span>
                                        </div>

                                        {/* Clickable Variable Chips Toolbar */}
                                        <div className={styles.variablesToolbar}>
                                            <div className={styles.varToolbarHeader}>
                                                <span className={styles.varToolbarTitle}>Click placeholder chip to insert into template:</span>
                                                {copiedVariable && (
                                                    <span className={styles.copiedFeedback}>
                                                        <Check size={12} /> Inserted {copiedVariable}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.chipsWrap}>
                                                {(editingTemplate.available_variables || []).map((v: string) => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        className={styles.varChipBtn}
                                                        onClick={() => insertVariable(v)}
                                                        title={`Click to insert ${v}`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* HTML Body Editor */}
                                        <div className={styles.formGroup} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <label className={styles.inputLabel}>HTML Email Source Code</label>
                                                <button
                                                    type="button"
                                                    onClick={handleRestoreDefault}
                                                    className={styles.restoreDefaultBtn}
                                                    title="Reset this template to the factory modern luxury design"
                                                >
                                                    <RotateCcw size={13} /> Restore Factory Default
                                                </button>
                                            </div>
                                            <textarea
                                                className={styles.codeTextarea}
                                                value={editingTemplate.body_html}
                                                onChange={e => setEditingTemplate({
                                                    ...editingTemplate,
                                                    body_html: e.target.value
                                                })}
                                                spellCheck={false}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: SEND LIVE TEST EMAIL */}
                                {activeModalTab === 'test' && (
                                    <div className={styles.testDispatchPanel}>
                                        <div className={styles.testCard}>
                                            <div className={styles.testIconBadge}>
                                                <Send size={24} color="#0f766e" />
                                            </div>
                                            <h3 className={styles.testTitle}>Send a Live Email Test</h3>
                                            <p className={styles.testSubtitle}>
                                                Verify how this email arrives and renders in your real Gmail, Apple Mail, or Outlook inbox.
                                            </p>

                                            <div className={styles.testFormWrap}>
                                                <label className={styles.inputLabel}>Recipient Email Address</label>
                                                <div className={styles.testInputRow}>
                                                    <input
                                                        type="email"
                                                        className={styles.testEmailInput}
                                                        value={testRecipient}
                                                        onChange={e => setTestRecipient(e.target.value)}
                                                        placeholder="you@domain.com"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSendTest}
                                                        disabled={sendingTest || !testRecipient}
                                                        className={styles.sendTestBtn}
                                                    >
                                                        {sendingTest ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                                        {sendingTest ? 'Sending...' : 'Send Test Now'}
                                                    </button>
                                                </div>
                                            </div>

                                            {testFeedback && (
                                                <div className={`${styles.feedbackBox} ${
                                                    testFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
                                                }`}>
                                                    {testFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                    <span>{testFeedback.message}</span>
                                                </div>
                                            )}

                                            <div className={styles.testNotes}>
                                                <strong>Note:</strong> Test emails use the sample data values defined in the preview tab and prepend <code>[TEST]</code> to the subject line.
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Modal Footer */}
                            <div className={styles.modalFooter}>
                                <div className={styles.footerLeft}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setEditingTemplate(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className={styles.footerRight}>
                                    <button
                                        type="submit"
                                        className={styles.saveBtn}
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
