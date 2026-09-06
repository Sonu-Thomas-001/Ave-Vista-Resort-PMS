'use client';

import React from 'react';
import {
    X,
    Receipt,
    Calendar,
    CreditCard,
    Tag,
    User,
    FileText,
    ExternalLink,
    Edit2,
    Paperclip,
    Clock,
    Banknote,
    QrCode,
    Building
} from 'lucide-react';
import type { Expense } from './ExpenseList';
import styles from './ExpenseDetailsModal.module.css';

interface ExpenseDetailsModalProps {
    expense: Expense | null;
    onClose: () => void;
    onEdit?: (expense: Expense) => void;
}

export default function ExpenseDetailsModal({
    expense,
    onClose,
    onEdit
}: ExpenseDetailsModalProps) {
    if (!expense) return null;

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const getPaymentIcon = (mode: string) => {
        switch (mode) {
            case 'Cash':
                return <Banknote size={14} color="#16a34a" />;
            case 'UPI':
                return <QrCode size={14} color="#7c3aed" />;
            case 'Card':
                return <CreditCard size={14} color="#0284c7" />;
            case 'Bank':
                return <Building size={14} color="#0d9488" />;
            default:
                return <CreditCard size={14} />;
        }
    };

    const categoryName = expense.expense_categories?.name || 'General Operations';
    const categoryColor = expense.expense_categories?.color || '#0284c7';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />
                    <div className={styles.titleGroup}>
                        <div className={styles.badgeRow}>
                            <span className={styles.voucherPill}>
                                <Receipt size={12} />
                                <span>#EXP-{expense.id.slice(0, 8).toUpperCase()}</span>
                            </span>
                            <span className={styles.categoryPill}>
                                <span
                                    className={styles.categoryDot}
                                    style={{ backgroundColor: categoryColor }}
                                />
                                <span>{categoryName}</span>
                            </span>
                        </div>
                        <h3 className={styles.title}>{expense.title}</h3>
                        <p className={styles.subtitle}>
                            Recorded on {formatDate(expense.date)} • Payment via {expense.payment_mode}
                        </p>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        title="Close Modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Hero Amount Card */}
                    <div className={styles.heroAmountCard}>
                        <div className={styles.amountGroup}>
                            <span className={styles.amountLabel}>Disbursement Amount</span>
                            <span className={styles.amountValue}>
                                ₹{Number(expense.amount || 0).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                        <div className={styles.paymentBadge}>
                            {getPaymentIcon(expense.payment_mode)}
                            <span>{expense.payment_mode} Mode</span>
                        </div>
                    </div>

                    {/* Particulars Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Tag size={15} />
                            <span>Voucher Particulars</span>
                        </div>
                        <div className={styles.grid2}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                    <Tag size={12} /> Category
                                </span>
                                <span className={styles.infoValue}>{categoryName}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                    <Calendar size={12} /> Expense Date
                                </span>
                                <span className={styles.infoValue}>{formatDate(expense.date)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                    <CreditCard size={12} /> Disbursement Method
                                </span>
                                <span className={styles.infoValue}>{expense.payment_mode}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>
                                    <User size={12} /> Recorded By
                                </span>
                                <span className={styles.infoValue}>
                                    {expense.profiles?.full_name || 'Front Desk Staff'}
                                </span>
                            </div>
                        </div>

                        {expense.created_at && (
                            <div className={styles.infoItem} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                <span className={styles.infoLabel}>
                                    <Clock size={12} /> Audit Timestamp
                                </span>
                                <span className={styles.infoValue} style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Logged on {formatDateTime(expense.created_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Accounting Notes */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FileText size={15} />
                            <span>Internal Notes & Remarks</span>
                        </div>
                        {expense.notes && expense.notes.trim() ? (
                            <div className={styles.notesBlock}>{expense.notes}</div>
                        ) : (
                            <div className={styles.emptyNotes}>
                                No additional accounting remarks recorded for this voucher.
                            </div>
                        )}
                    </div>

                    {/* Receipt Attachment */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Paperclip size={15} />
                            <span>Receipt & Proof of Payment</span>
                        </div>
                        {expense.attachment_url ? (
                            <div className={styles.attachmentBox}>
                                <img
                                    src={expense.attachment_url}
                                    alt="Expense Receipt"
                                    className={styles.attachmentImage}
                                    onError={(e) => {
                                        // Fallback if not direct image (e.g. PDF)
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                                <div className={styles.attachmentActions}>
                                    <a
                                        href={expense.attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.openLinkBtn}
                                    >
                                        <ExternalLink size={14} />
                                        <span>Open Full Document</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noAttachment}>
                                <Paperclip size={16} color="#94a3b8" />
                                <span>No physical receipt or invoice attached to this record.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.closeFooterBtn}
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {onEdit && (
                        <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => {
                                onClose();
                                onEdit(expense);
                            }}
                        >
                            <Edit2 size={15} />
                            <span>Edit Expense</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
