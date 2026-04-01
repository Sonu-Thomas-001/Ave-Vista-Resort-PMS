'use client';

import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
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
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Expense title is required');
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
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedCategory = categories.find(
        (cat) => cat.id === formData.categoryId
    );

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <Plus size={20} />
                        Add Expense
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        type="button"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Expense Title */}
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Expense Title *</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="e.g., Kitchen Supplies"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Category */}
                    <div className={styles.formGroup}>
                        <label htmlFor="categoryId">Category *</label>
                        <div className={styles.categorySelect}>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {selectedCategory && (
                                <div
                                    className={styles.colorTag}
                                    style={{
                                        backgroundColor: selectedCategory.color,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className={styles.formGroup}>
                        <label htmlFor="amount">Amount (₹) *</label>
                        <input
                            id="amount"
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={loading}
                            step="0.01"
                            min="0"
                        />
                    </div>

                    {/* Date */}
                    <div className={styles.formGroup}>
                        <label htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Payment Mode */}
                    <div className={styles.formGroup}>
                        <label htmlFor="paymentMode">Payment Mode</label>
                        <select
                            id="paymentMode"
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Bank">Bank Transfer</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className={styles.formGroup}>
                        <label htmlFor="notes">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            placeholder="Add any additional details..."
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {/* Attachment (Placeholder) */}
                    <div className={styles.formGroup}>
                        <label htmlFor="attachment">
                            Bill/Receipt (Optional)
                        </label>
                        <input
                            id="attachment"
                            type="file"
                            onChange={handleFileChange}
                            disabled={loading}
                            accept="image/*,application/pdf"
                        />
                        {selectedFile && (
                            <p className={styles.fileName}>
                                {selectedFile.name}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className={styles.buttons}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
