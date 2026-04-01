'use client';

import { useState } from 'react';
import {
    Trash2,
    Edit2,
    Search,
    ChevronDown,
    Eye,
    Download,
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/expenseExport';
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
    const [exporting, setExporting] = useState(false);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDeleteClick = async (expenseId: string) => {
        if (
            confirm(
                'Are you sure you want to delete this expense? This action cannot be undone.'
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
        let comparison = 0;
        if (sortBy === 'date') {
            comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            comparison = b.amount - a.amount;
        }
        return sortOrder === 'desc' ? comparison : -comparison;
    });

    const handleExportPDF = async () => {
        try {
            setExporting(true);
            await exportToPDF(sortedExpenses, `expenses-${new Date().toISOString().split('T')[0]}`);
        } catch (error: any) {
            alert(error.message || 'Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            await exportToExcel(sortedExpenses, `expenses-${new Date().toISOString().split('T')[0]}`);
        } catch (error: any) {
            alert(error.message || 'Failed to export Excel');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Search & Filter & Export Bar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                <button
                    className={`${styles.filterBtn} ${
                        showFilters ? styles.active : ''
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <ChevronDown size={18} />
                    Filters
                </button>

                {sortedExpenses.length > 0 && (
                    <div className={styles.exportBtns}>
                        <button
                            className={styles.exportBtn}
                            onClick={handleExportPDF}
                            disabled={exporting}
                            title="Export as PDF"
                        >
                            <Download size={16} />
                            PDF
                        </button>
                        <button
                            className={styles.exportBtn}
                            onClick={handleExportExcel}
                            disabled={exporting}
                            title="Export as Excel"
                        >
                            <Download size={16} />
                            Excel
                        </button>
                    </div>
                )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filterGroup}>
                        <label>Date Range</label>
                        <div className={styles.dateRange}>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) =>
                                    handleFilterChange({
                                        ...filters,
                                        startDate: e.target.value || undefined,
                                    })
                                }
                                placeholder="From"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) =>
                                    handleFilterChange({
                                        ...filters,
                                        endDate: e.target.value || undefined,
                                    })
                                }
                                placeholder="To"
                            />
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Category</label>
                        <select
                            value={filters.categoryId || ''}
                            onChange={(e) =>
                                handleFilterChange({
                                    ...filters,
                                    categoryId: e.target.value || undefined,
                                })
                            }
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Payment Mode</label>
                        <select
                            value={filters.paymentMode || ''}
                            onChange={(e) =>
                                handleFilterChange({
                                    ...filters,
                                    paymentMode: e.target.value || undefined,
                                })
                            }
                        >
                            <option value="">All Modes</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Bank">Bank</option>
                        </select>
                    </div>

                    <button
                        className={styles.clearBtn}
                        onClick={() => {
                            setFilters({});
                            onFilterChange({});
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Sort Controls */}
            <div className={styles.sortControls}>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                </select>

                <button
                    className={styles.sortOrderBtn}
                    onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                >
                    {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                </button>
            </div>

            {/* Expenses Table/List */}
            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                </div>
            ) : sortedExpenses.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No expenses found</p>
                    <p className={styles.subtext}>
                        Start tracking expenses to see them here
                    </p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                                <th>Added By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => (
                                <tr key={expense.id} className={styles.row}>
                                    <td className={styles.date}>
                                        {new Date(
                                            expense.date
                                        ).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className={styles.title}>
                                        {expense.title}
                                        {expense.notes && (
                                            <div className={styles.notes}>
                                                {expense.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.categoryBadge}>
                                            <div
                                                className={styles.colorDot}
                                                style={{
                                                    backgroundColor:
                                                        expense
                                                            .expense_categories
                                                            ?.color || '#6B7280',
                                                }}
                                            />
                                            <span>
                                                {expense.expense_categories
                                                    ?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.amount}>
                                        ₹
                                        {expense.amount.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td>
                                        <span className={styles.paymentMode}>
                                            {expense.payment_mode}
                                        </span>
                                    </td>
                                    <td className={styles.addedBy}>
                                        {expense.profiles?.full_name ||
                                            'System'}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {expense.attachment_url && (
                                                <button
                                                    className={
                                                        styles.iconBtn
                                                    }
                                                    title="View attachment"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => onEdit(expense)}
                                                title="Edit expense"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        expense.id
                                                    )
                                                }
                                                disabled={deletingId === expense.id}
                                                title="Delete expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Result Count */}
            {!isLoading && sortedExpenses.length > 0 && (
                <div className={styles.resultCount}>
                    Showing {sortedExpenses.length} expense
                    {sortedExpenses.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
