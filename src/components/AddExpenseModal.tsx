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
    Check
} from 'lucide-react';
import styles from './AddExpenseModal.module.css';

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
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <Receipt size={20} color="#0284c7" />
                        <h3 className={styles.title}>Record New Expense</h3>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        type="button"
                        title="Close Modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Expense Title / Description *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Organic vegetables procurement, Diesel for generator..."
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                setError('');
                            }}
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Amount (₹) *</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.currencyPrefix}>₹</span>
                                <input
                                    type="number"
                                    step="any"
                                    className={styles.input}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData({ ...formData, amount: e.target.value });
                                        setError('');
                                    }}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Expense Date *</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Expense Category *</label>
                        <select
                            className={styles.select}
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Payment Instrument / Mode *</label>
                        <div className={styles.paymentModeGrid}>
                            {(['Cash', 'UPI', 'Card', 'Bank'] as const).map((mode) => (
                                <div
                                    key={mode}
                                    className={`${styles.modeOption} ${
                                        formData.paymentMode === mode ? styles.modeOptionActive : ''
                                    }`}
                                    onClick={() => setFormData({ ...formData, paymentMode: mode })}
                                >
                                    {mode === 'Cash' && <Banknote size={14} />}
                                    {mode === 'UPI' && <QrCode size={14} />}
                                    {mode === 'Card' && <CreditCard size={14} />}
                                    {mode === 'Bank' && <Building2 size={14} />}
                                    {mode === 'Bank' ? 'Bank Wire' : mode}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Receipt Upload Dropzone */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Receipt Bill / Invoice Attachment (Optional)</label>
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
                            <div className={styles.previewBox} style={{ padding: '16px' }}>
                                <FileText size={28} color="#0284c7" />
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                </span>
                                <button
                                    type="button"
                                    className={styles.removeThumbBtn}
                                    onClick={handleRemoveFile}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={styles.dropzone}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud size={28} className={styles.dropzoneIcon} />
                                <p className={styles.dropzoneText}>Click to upload receipt, invoice or voucher</p>
                                <p className={styles.dropzoneSub}>Supports JPG, PNG, PDF up to 10MB</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Additional Remarks / Supplier Notes (Optional)</label>
                        <textarea
                            className={styles.textarea}
                            rows={2}
                            placeholder="Supplier name, bill reference number, or justification..."
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <>
                                    <RefreshCw size={14} className="spin" /> Saving Expense...
                                </>
                            ) : (
                                <>
                                    <Check size={15} /> Save Expense Voucher
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
