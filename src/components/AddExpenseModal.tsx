'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X,
    Plus,
    AlertCircle,
    FileText,
    UploadCloud,
    CreditCard,
    Receipt,
    Banknote,
    QrCode,
    Building2,
    Calendar,
    IndianRupee,
    RefreshCw,
    Check,
    Sparkles
} from 'lucide-react';
import styles from './AddExpenseModal.module.css';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';

interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
}

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expense: ExpenseFormData) => Promise<void>;
    categories: ExpenseCategory[];
}

export interface ExpenseFormData {
    title: string;
    categoryId: string;
    amount: string;
    date: string;
    paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Card';
    notes?: string;
    attachmentUrl?: string;
}

export default function AddExpenseModal({
    isOpen,
    onClose,
    onSubmit,
    categories,
}: AddExpenseModalProps) {
    const [formData, setFormData] = useState<ExpenseFormData>({
        title: '',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: 'Cash',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && categories.length > 0 && !formData.categoryId) {
            setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [isOpen, categories, formData.categoryId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Expense description / title is required');
            return;
        }

        if (!formData.categoryId) {
            setError('Please select an expense category');
            return;
        }

        if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid positive amount');
            return;
        }

        try {
            setLoading(true);

            let attachmentUrl = '';
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadResponse = await fetch('/api/expenses/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.json().catch(() => ({}));
                    throw new Error(uploadError.error || 'Failed to upload receipt attachment');
                }

                const uploadData = await uploadResponse.json();
                attachmentUrl = uploadData.url;
            }

            await onSubmit({
                ...formData,
                attachmentUrl,
            });

            // Reset form
            setFormData({
                title: '',
                categoryId: categories[0]?.id || '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                paymentMode: 'Cash',
                notes: '',
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to record expense');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 1. Header Banner */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />

                    <div className={styles.headerTopBar}>
                        <div className={styles.voucherTag}>
                            <Receipt size={12} />
                            <span>EXPENSE DISBURSEMENT VOUCHER</span>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.headerHero}>
                        <h3 className={styles.title}>Record New Expense</h3>
                        <span className={styles.subtitle}>
                            Disburse operational funds, inventory acquisitions, or maintenance payments
                        </span>
                    </div>
                </div>

                {/* 2. Scrollable Form Body */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Section 1: Voucher Particulars & Amount */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <IndianRupee size={15} className={styles.sectionIcon} />
                            <h4 className={styles.sectionTitle}>Expense Particulars & Amount</h4>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Amount Disbursed (₹) *</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.currencyPrefix}>₹</span>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className={`${styles.input} ${styles.inputAmount}`}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData({ ...formData, amount: e.target.value });
                                        setError('');
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Expense Description / Item Title *</label>
                            <input
                                type="text"
                                required
                                className={styles.input}
                                placeholder="e.g. Kitchen groceries procurement, Generator diesel fuel, Laundry supplies..."
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    setError('');
                                }}
                            />
                        </div>

                        <div className={styles.formGrid2}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Expense Category *</label>
                                <CustomSelect
                                    options={categories.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                        color: c.color
                                    }))}
                                    value={formData.categoryId}
                                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                    placeholder="Select Category..."
                                    fullWidth
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Expense Date *</label>
                                <DatePicker
                                    value={formData.date}
                                    onChange={(val) => setFormData({ ...formData, date: val })}
                                    fullWidth
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Payment Instrument / Mode */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <CreditCard size={15} className={styles.sectionIcon} />
                            <h4 className={styles.sectionTitle}>Disbursement Mode / Payment Instrument</h4>
                        </div>

                        <div className={styles.paymentModeGrid}>
                            {(['Cash', 'UPI', 'Card', 'Bank'] as const).map((mode) => (
                                <div
                                    key={mode}
                                    className={`${styles.modeOption} ${
                                        formData.paymentMode === mode ? styles.modeOptionActive : ''
                                    }`}
                                    onClick={() => setFormData({ ...formData, paymentMode: mode })}
                                >
                                    {mode === 'Cash' && <Banknote size={15} />}
                                    {mode === 'UPI' && <QrCode size={15} />}
                                    {mode === 'Card' && <CreditCard size={15} />}
                                    {mode === 'Bank' && <Building2 size={15} />}
                                    <span>{mode === 'Bank' ? 'Bank Wire' : mode}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Receipt Attachment & Remarks */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <FileText size={15} className={styles.sectionIcon} />
                            <h4 className={styles.sectionTitle}>Receipt Voucher Attachment & Remarks</h4>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Invoice / Voucher Bill Document (Optional)</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {previewUrl ? (
                                <div className={styles.previewBox}>
                                    <img src={previewUrl} alt="Receipt Preview" className={styles.previewThumb} />
                                    <div>
                                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                                            {selectedFile?.name}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB • Image Attached` : ''}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeThumbBtn}
                                        onClick={handleRemoveFile}
                                        title="Remove attachment"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : selectedFile ? (
                                <div className={styles.previewBox}>
                                    <FileText size={28} color="#0284c7" />
                                    <div>
                                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                                            {selectedFile.name}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                            {(selectedFile.size / 1024).toFixed(0)} KB • Document Attached
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeThumbBtn}
                                        onClick={handleRemoveFile}
                                        title="Remove attachment"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={styles.dropzone}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud size={30} className={styles.dropzoneIcon} />
                                    <p className={styles.dropzoneText}>Click or drop receipt, bill, or invoice voucher</p>
                                    <p className={styles.dropzoneSub}>Supports JPG, PNG, PDF formats up to 10MB</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Vendor Details / Staff Remarks (Optional)</label>
                            <textarea
                                className={styles.textarea}
                                rows={2}
                                placeholder="Vendor/Supplier name, bill tax reference number, or purchase justification..."
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 3. Footer Actions */}
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} />
                                    <span>Saving Voucher...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={15} />
                                    <span>Record Expense Voucher</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
