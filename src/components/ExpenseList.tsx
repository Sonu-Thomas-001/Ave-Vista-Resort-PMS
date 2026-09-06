'use client';

import { useState } from 'react';
import {
    Trash2,
    Edit2,
    Search,
    ChevronDown,
    Eye,
    Download,
    FileSpreadsheet,
    FileText,
    Paperclip,
    Filter,
    X,
    ArrowUpDown,
    Banknote,
    CreditCard,
    QrCode,
    Building2,
    User,
    RefreshCw
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/expenseExport';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';
import styles from './ExpenseList.module.css';

export interface Expense {
    id: string;
    title: string;
    category_id: string;
    amount: number;
    date: string;
    payment_mode: 'Cash' | 'UPI' | 'Bank' | 'Card';
    notes?: string;
    attachment_url?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    expense_categories?: {
        id: string;
        name: string;
        color: string;
    };
    profiles?: {
        full_name: string;
    };
}

interface ExpenseListProps {
    expenses: Expense[];
    isLoading: boolean;
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => Promise<void>;
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterOptions) => void;
    categories: Array<{ id: string; name: string; color: string }>;
}

export interface FilterOptions {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    paymentMode?: string;
}

export default function ExpenseList({
    expenses,
    isLoading,
    onEdit,
    onDelete,
    onSearch,
    onFilterChange,
    categories,
}: ExpenseListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({});
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);
    const [exportingType, setExportingType] = useState<'excel' | 'pdf' | null>(null);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        const cleared = {};
        setFilters(cleared);
        setSearchQuery('');
        onSearch('');
        onFilterChange(cleared);
    };

    const handleDeleteClick = async (expenseId: string) => {
        if (
            confirm(
                'Are you sure you want to delete this expense record? This action cannot be undone.'
            )
        ) {
            try {
                setDeletingId(expenseId);
                await onDelete(expenseId);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete expense');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const sortedExpenses = [...expenses].sort((a, b) => {
        if (sortBy === 'date') {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        } else {
            return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
    });

    const handleSort = (type: 'date' | 'amount') => {
        if (sortBy === type) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(type);
            setSortOrder('desc');
        }
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            setExportingType(type);
            if (type === 'excel') {
                await exportToExcel(sortedExpenses);
            } else {
                await exportToPDF(sortedExpenses);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert(`Failed to export to ${type.toUpperCase()}`);
        } finally {
            setExportingType(null);
        }
    };

    const getPaymentModeIcon = (mode: string) => {
        switch (mode) {
            case 'Card':
                return <CreditCard size={13} />;
            case 'UPI':
                return <QrCode size={13} />;
            case 'Bank':
                return <Building2 size={13} />;
            case 'Cash':
            default:
                return <Banknote size={13} />;
        }
    };

    const isFilterActive = !!(
        searchQuery ||
        filters.categoryId ||
        filters.paymentMode ||
        filters.startDate ||
        filters.endDate
    );

    return (
        <div className={styles.container}>
            {/* Toolbar Card */}
            <div className={styles.toolbarCard}>
                <div className={styles.toolbarTop}>
                    {/* Search Bar */}
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search expenses by title or description..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                className={styles.clearSearchBtn}
                                onClick={() => handleSearchChange('')}
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Action & Filter Buttons */}
                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.filterToggleBtn} ${showFilters || isFilterActive ? styles.active : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={14} />
                            Filters
                            {isFilterActive && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
                            )}
                        </button>

                        <button
                            className={styles.exportBtn}
                            onClick={() => handleExport('excel')}
                            disabled={sortedExpenses.length === 0 || exportingType !== null}
                            title="Export to Excel Spreadsheet"
                        >
                            <FileSpreadsheet size={14} color="#10b981" />
                            {exportingType === 'excel' ? 'Exporting...' : 'Excel'}
                        </button>

                        <button
                            className={styles.exportBtn}
                            onClick={() => handleExport('pdf')}
                            disabled={sortedExpenses.length === 0 || exportingType !== null}
                            title="Export to PDF Document"
                        >
                            <Download size={14} color="#0284c7" />
                            {exportingType === 'pdf' ? 'Exporting...' : 'PDF'}
                        </button>

                        {isFilterActive && (
                            <button
                                className={styles.resetBtn}
                                onClick={handleClearFilters}
                                title="Reset all search and filter settings"
                            >
                                <X size={13} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded Filter Panel */}
                {showFilters && (
                    <div className={styles.filterPanel}>
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Category:</span>
                            <CustomSelect
                                options={[
                                    { label: 'All Categories', value: '' },
                                    ...categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))
                                ]}
                                value={filters.categoryId || ''}
                                onChange={(val) =>
                                    handleFilterChange({
                                        ...filters,
                                        categoryId: val || undefined,
                                    })
                                }
                                size="sm"
                                fullWidth={false}
                                placeholder="All Categories"
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Payment:</span>
                            <CustomSelect
                                options={[
                                    { label: 'All Modes', value: '' },
                                    { label: 'Cash', value: 'Cash' },
                                    { label: 'UPI', value: 'UPI' },
                                    { label: 'Card', value: 'Card' },
                                    { label: 'Bank Transfer', value: 'Bank' }
                                ]}
                                value={filters.paymentMode || ''}
                                onChange={(val) =>
                                    handleFilterChange({
                                        ...filters,
                                        paymentMode: (val as any) || undefined,
                                    })
                                }
                                size="sm"
                                fullWidth={false}
                                placeholder="All Modes"
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>From:</span>
                            <DatePicker
                                value={filters.startDate || ''}
                                onChange={(val) =>
                                    handleFilterChange({
                                        ...filters,
                                        startDate: val || undefined,
                                    })
                                }
                                size="sm"
                                placeholder="Start date"
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>To:</span>
                            <DatePicker
                                value={filters.endDate || ''}
                                onChange={(val) =>
                                    handleFilterChange({
                                        ...filters,
                                        endDate: val || undefined,
                                    })
                                }
                                minDate={filters.startDate}
                                size="sm"
                                placeholder="End date"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Expenses Table */}
            <div className={styles.tableWrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th
                                    className={styles.sortableTh}
                                    onClick={() => handleSort('date')}
                                    title="Click to sort by Date"
                                >
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        Date & Voucher
                                        <ArrowUpDown size={13} color="#94a3b8" />
                                    </div>
                                </th>
                                <th>Expense Title & Notes</th>
                                <th>Category</th>
                                <th>Payment Mode</th>
                                <th
                                    className={styles.sortableTh}
                                    onClick={() => handleSort('amount')}
                                    title="Click to sort by Amount"
                                >
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        Amount (₹)
                                        <ArrowUpDown size={13} color="#94a3b8" />
                                    </div>
                                </th>
                                <th>Recorded By</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => {
                                const catColor = expense.expense_categories?.color || '#0284c7';
                                return (
                                    <tr key={expense.id}>
                                        {/* Date */}
                                        <td>
                                            <div className={styles.dateCell}>
                                                <span className={styles.dateVal}>
                                                    {new Date(expense.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className={styles.voucherTag}>
                                                    #{expense.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Title & Notes */}
                                        <td>
                                            <div className={styles.titleCell}>
                                                <span className={styles.expenseTitle}>
                                                    {expense.title}
                                                    {expense.attachment_url && (
                                                        <button
                                                            className={styles.attachmentBadge}
                                                            onClick={() => setPreviewAttachment(expense.attachment_url!)}
                                                            title="View Receipt Attachment"
                                                        >
                                                            <Paperclip size={11} /> Receipt
                                                        </button>
                                                    )}
                                                </span>
                                                {expense.notes && (
                                                    <span className={styles.expenseNotes} title={expense.notes}>
                                                        {expense.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Category Badge */}
                                        <td>
                                            <span
                                                className={styles.categoryBadge}
                                                style={{
                                                    backgroundColor: `${catColor}15`,
                                                    color: catColor,
                                                }}
                                            >
                                                <span
                                                    className={styles.categoryDot}
                                                    style={{ backgroundColor: catColor }}
                                                />
                                                {expense.expense_categories?.name || 'General Operations'}
                                            </span>
                                        </td>

                                        {/* Payment Mode */}
                                        <td>
                                            <span className={styles.modeChip}>
                                                {getPaymentModeIcon(expense.payment_mode)}
                                                {expense.payment_mode}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td>
                                            <span className={styles.amountVal}>
                                                ₹{Number(expense.amount).toLocaleString('en-IN', {
                                                    minimumFractionDigits: 0,
                                                })}
                                            </span>
                                        </td>

                                        {/* Staff */}
                                        <td>
                                            <span className={styles.staffChip}>
                                                {expense.profiles?.full_name || 'Staff'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className={styles.actionCell} style={{ justifyContent: 'flex-end' }}>
                                                {expense.attachment_url && (
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="View Receipt"
                                                        onClick={() => setPreviewAttachment(expense.attachment_url!)}
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit Expense"
                                                    onClick={() => onEdit(expense)}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                                    title="Delete Expense"
                                                    onClick={() => handleDeleteClick(expense.id)}
                                                    disabled={deletingId === expense.id}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!isLoading && sortedExpenses.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconBox}>
                            <FileText size={28} />
                        </div>
                        <h3 className={styles.emptyTitle}>No Expenses Found</h3>
                        <p className={styles.emptySubtitle}>
                            {isFilterActive
                                ? 'No expense records match your active search or filter criteria.'
                                : 'No operational expenses recorded yet. Click "Add Expense" to log your first voucher.'}
                        </p>
                        {isFilterActive && (
                            <button className={styles.resetBtn} onClick={handleClearFilters}>
                                <RefreshCw size={12} /> Clear Filter Settings
                            </button>
                        )}
                    </div>
                )}

                {/* Table Footer */}
                <div className={styles.tableFooter}>
                    <span>
                        Showing <strong>{sortedExpenses.length}</strong> of <strong>{expenses.length}</strong> total expense vouchers
                    </span>
                    <span>
                        Total Filtered Sum: <strong>₹{sortedExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString('en-IN')}</strong>
                    </span>
                </div>
            </div>

            {/* Receipt Attachment Preview Modal */}
            {previewAttachment && (
                <div
                    className={styles.previewOverlay}
                    onClick={() => setPreviewAttachment(null)}
                >
                    <div
                        className={styles.previewModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.previewHeader}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                Expense Receipt Document
                            </span>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setPreviewAttachment(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '16px', overflow: 'auto' }}>
                            <img
                                src={previewAttachment}
                                alt="Expense Receipt Attachment"
                                className={styles.previewImg}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
