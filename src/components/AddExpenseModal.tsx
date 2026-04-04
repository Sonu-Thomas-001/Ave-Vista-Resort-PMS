'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertCircle, FileText, UploadCloud, Tag, CreditCard, Receipt, ChevronDown, Check } from 'lucide-react';
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
    const [isClosing, setIsClosing] = useState(false);
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isPayOpen, setIsPayOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const catRef = useRef<HTMLDivElement>(null);
    const payRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setIsCatOpen(false);
            setIsPayOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (catRef.current && !catRef.current.contains(event.target as Node)) {
                setIsCatOpen(false);
            }
            if (payRef.current && !payRef.current.contains(event.target as Node)) {
                setIsPayOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user starts typing
    };

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

    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Description is required');
            return;
        }

        if (formData.title.trim().length < 3) {
            setError('Description must be at least 3 characters');
            return;
        }

        if (!formData.categoryId) {
            setError('Please select a category');
            return;
        }

        if (!formData.amount || isNaN(parseFloat(formData.amount))) {
            setError('Please enter a valid amount');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        try {
            setLoading(true);

            // Upload file to Supabase Storage if selected
            let attachmentUrl = '';
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadResponse = await fetch('/api/expenses/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.json();
                    throw new Error(uploadError.error || 'Failed to upload file');
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
                categoryId: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                paymentMode: 'Cash',
                notes: '',
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen && !isClosing) return null;

    const selectedCategory = categories.find(
        (cat) => cat.id === formData.categoryId
    );

    return (
        <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
            <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalBody}>
                    <div className={styles.header}>
                        <div className={styles.headerIcon}>
                            <Receipt size={24} />
                        </div>
                        <div className={styles.headerText}>
                            <h2 className={styles.title}>New Expense</h2>
                            <p className={styles.subtitle}>Enter the details of your recent expenditure</p>
                        </div>
                        <button className={styles.closeBtn} onClick={handleClose} type="button" aria-label="Close modal">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                {/* Expense Title */}
                                <div className={styles.formGroup + ' ' + styles.fullWidth}>
                                    <label htmlFor="title">Description *</label>
                                    <div className={styles.inputWrapper}>
                                        <div className={styles.iconWrapper}><Receipt size={16} /></div>
                                        <input id="title" type="text" name="title" placeholder="e.g., Office Supplies, Electricity Bill" value={formData.title} onChange={handleChange} disabled={loading} autoFocus={!error} />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className={styles.formGroup} ref={catRef}>
                                    <label>Category *</label>
                                    <div className={styles.customSelectContainer}>
                                        <div 
                                            className={`${styles.customSelectHeader} ${isCatOpen ? styles.active : ''} ${loading ? styles.disabled : ''}`} 
                                            onClick={() => !loading && setIsCatOpen(!isCatOpen)}
                                        >
                                            <div className={styles.iconWrapper}>
                                                {selectedCategory ? (
                                                    <div className={styles.categoryColorDot} style={{ backgroundColor: selectedCategory.color }} />
                                                ) : (
                                                    <Tag size={16} />
                                                )}
                                            </div>
                                            <span className={styles.customSelectValue}>
                                                {selectedCategory ? selectedCategory.name : 'Select a category'}
                                            </span>
                                            <ChevronDown size={16} className={styles.chevron} />
                                        </div>
                                        {isCatOpen && !loading && (
                                            <div className={styles.customSelectOptions}>
                                                {categories.map((cat) => (
                                                    <div 
                                                        key={cat.id} 
                                                        className={`${styles.customSelectOption} ${formData.categoryId === cat.id ? styles.selected : ''}`}
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, categoryId: cat.id }));
                                                            setError('');
                                                            setIsCatOpen(false);
                                                        }}
                                                    >
                                                        <div className={styles.categoryColorDot} style={{ backgroundColor: cat.color }} />
                                                        {cat.name}
                                                        {formData.categoryId === cat.id && <Check size={16} className={styles.checkIcon} />}
                                                    </div>
                                                ))}
                                                {categories.length === 0 && (
                                                    <div className={styles.customSelectOption} style={{ color: '#9ca3af', cursor: 'default' }}>
                                                        No categories available
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="amount">Amount *</label>
                                    <div className={styles.inputWrapper}>
                                        <div className={styles.iconWrapper}><span className={styles.currencySymbol}>₹</span></div>
                                        <input id="amount" type="number" name="amount" placeholder="0.00" value={formData.amount} onChange={handleChange} disabled={loading} step="0.01" min="0" className={styles.inputWithIcon} />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="date">Date</label>
                                    <div className={styles.inputWrapper}>
                                        <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} disabled={loading} className={styles.dateInput} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className={styles.formGroup} ref={payRef}>
                                    <label>Payment Mode</label>
                                    <div className={styles.customSelectContainer}>
                                        <div 
                                            className={`${styles.customSelectHeader} ${isPayOpen ? styles.active : ''} ${loading ? styles.disabled : ''}`} 
                                            onClick={() => !loading && setIsPayOpen(!isPayOpen)}
                                        >
                                            <div className={styles.iconWrapper}><CreditCard size={16} /></div>
                                            <span className={styles.customSelectValue}>{formData.paymentMode}</span>
                                            <ChevronDown size={16} className={styles.chevron} />
                                        </div>
                                        {isPayOpen && !loading && (
                                            <div className={styles.customSelectOptions}>
                                                {['Cash', 'UPI', 'Bank', 'Card'].map((mode) => (
                                                    <div 
                                                        key={mode} 
                                                        className={`${styles.customSelectOption} ${formData.paymentMode === mode ? styles.selected : ''}`}
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, paymentMode: mode as any }));
                                                            setIsPayOpen(false);
                                                        }}
                                                    >
                                                        {mode}
                                                        {formData.paymentMode === mode && <Check size={16} className={styles.checkIcon} />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.formSection}>
                            <div className={styles.twoColumnGrid}>
                                {/* Notes */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="notes">Notes</label>
                                    <div className={styles.textareaWrapper}>
                                        <textarea id="notes" name="notes" placeholder="Add any additional context..." value={formData.notes || ''} onChange={handleChange} disabled={loading} maxLength={200} />
                                        <div className={styles.charCount}>{(formData.notes || '').length}/200</div>
                                    </div>
                                </div>

                                {/* Attachment */}
                                <div className={styles.formGroup}>
                                    <label>Bill/Receipt</label>
                                    <div 
                                        className={`${styles.uploadZone} ${previewUrl ? styles.hasPreview : ''}`} 
                                        onClick={triggerFilePicker}
                                    >
                                        <input id="attachment" type="file" ref={fileInputRef} onChange={handleFileChange} disabled={loading} accept="image/*,application/pdf" className={styles.hiddenInput} />
                                        
                                        {previewUrl ? (
                                            <div className={styles.previewContainer}>
                                                <img src={previewUrl} alt="Receipt preview" className={styles.imagePreview} />
                                                <div className={styles.previewOverlay}>
                                                    <span className={styles.changeText}>Click to change</span>
                                                </div>
                                            </div>
                                        ) : selectedFile ? (
                                            <div className={styles.fileIconContainer}>
                                                <FileText size={32} className={styles.fileIcon} />
                                                <span className={styles.fileNameLarge}>{selectedFile.name}</span>
                                                <span className={styles.changeText}>Click to change</span>
                                            </div>
                                        ) : (
                                            <div className={styles.uploadPrompt}>
                                                <div className={styles.uploadIconBackground}>
                                                    <UploadCloud size={24} className={styles.uploadIcon} />
                                                </div>
                                                <span className={styles.uploadTitle}>Click to upload</span>
                                                <span className={styles.uploadSubtitle}>PNG, JPG or PDF (max. 10MB)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button type="button" onClick={handleClose} disabled={loading} className={styles.cancelBtn}>Cancel</button>
                            <button type="submit" disabled={loading} className={styles.submitBtn}>
                                {loading ? 'Saving...' : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
