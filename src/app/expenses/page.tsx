'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import {
    Plus,
    AlertCircle,
    Check,
    Wallet,
    Layers,
    ListFilter,
    BarChart3,
    Receipt
} from 'lucide-react';
import AddExpenseModal, { ExpenseFormData } from '@/components/AddExpenseModal';
import ExpenseList from '@/components/ExpenseList';
import ExpenseSummary from '@/components/ExpenseSummary';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';
import styles from './expenses.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Expense {
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

interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
}

export default function ExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [viewMode, setViewMode] = useState<'Full' | 'LedgerOnly'>('Full');
    const { user } = useAuth();
    const userRole = user?.role;

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('expense_categories')
                    .select('*')
                    .order('is_default', { ascending: false })
                    .order('name', { ascending: true });

                if (error) throw error;
                setCategories(data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load expense categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch expenses
    const fetchExpenses = useCallback(
        async (filters?: Record<string, any>) => {
            try {
                setIsLoading(true);

                let query = supabase
                    .from('expenses')
                    .select('*, expense_categories:category_id(id, name, color), profiles:created_by(full_name)')
                    .eq('is_deleted', false)
                    .order('date', { ascending: false });

                if (filters?.startDate) query = query.gte('date', filters.startDate);
                if (filters?.endDate) query = query.lte('date', filters.endDate);
                if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
                if (filters?.paymentMode) query = query.eq('payment_mode', filters.paymentMode);
                if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

                const { data, error } = await query;
                if (error) throw error;

                setExpenses(data || []);
                setFilteredExpenses(data || []);
                setError('');
            } catch (err: any) {
                console.error('Error fetching expenses:', err);
                setError(err.message || 'Failed to load expenses');
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Initial fetch
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Handle add/update expense
    const handleSubmitExpense = async (formData: ExpenseFormData) => {
        try {
            setError('');

            const payload = {
                title: formData.title,
                categoryId: formData.categoryId,
                amount: parseFloat(formData.amount),
                date: formData.date,
                paymentMode: formData.paymentMode,
                notes: formData.notes || null,
                attachmentUrl: formData.attachmentUrl || null,
            };

            if (editingExpense) {
                const response = await fetch(`/api/expenses/${editingExpense.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to update expense');
                }

                setSuccessMessage('Expense voucher updated successfully!');
                setEditingExpense(null);
            } else {
                const response = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to record expense');
                }

                setSuccessMessage('New expense voucher recorded successfully!');
            }

            setTimeout(() => setSuccessMessage(''), 3500);
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense voucher');
        }
    };

    // Handle edit expense
    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    // Handle delete expense
    const handleDeleteExpense = async (expenseId: string) => {
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete expense');
            }

            setSuccessMessage('Expense record deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3500);
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to delete expense');
        }
    };

    // Handle search
    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredExpenses(expenses);
        } else {
            const q = query.toLowerCase().trim();
            const filtered = expenses.filter(
                (expense) =>
                    expense.title.toLowerCase().includes(q) ||
                    (expense.notes && expense.notes.toLowerCase().includes(q)) ||
                    (expense.expense_categories?.name &&
                        expense.expense_categories.name.toLowerCase().includes(q))
            );
            setFilteredExpenses(filtered);
        }
    };

    // Handle filter
    const handleFilter = async (filters: Record<string, any>) => {
        await fetchExpenses(filters);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const canAddExpenses = userRole === 'Admin' || userRole === 'Manager' || !userRole;

    return (
        <>
            <Header title="Expense Management" />

            <div className={styles.container}>
                {/* Executive Hero Toolbar */}
                <div className={styles.heroBar}>
                    <div className={styles.heroLeft}>
                        <h2 className={styles.pageHeading}>
                            <Wallet size={20} color="#0284c7" />
                            Operational Outflows & Procurement
                        </h2>

                        {/* View Switcher Tabs */}
                        <div className={styles.viewTabs}>
                            <button
                                className={`${styles.viewTabBtn} ${viewMode === 'Full' ? styles.active : ''}`}
                                onClick={() => setViewMode('Full')}
                            >
                                <BarChart3 size={14} /> Full Cost Analytics
                            </button>
                            <button
                                className={`${styles.viewTabBtn} ${viewMode === 'LedgerOnly' ? styles.active : ''}`}
                                onClick={() => setViewMode('LedgerOnly')}
                            >
                                <ListFilter size={14} /> Ledger Table Only
                            </button>
                        </div>
                    </div>

                    {canAddExpenses && (
                        <button
                            className={styles.addBtn}
                            onClick={() => {
                                setEditingExpense(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus size={16} /> Record Expense
                        </button>
                    )}
                </div>

                {/* Notifications & Feedback */}
                {error && (
                    <div className={styles.alertError}>
                        <AlertCircle size={17} />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className={styles.alertSuccess}>
                        <Check size={17} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {userRole && !canAddExpenses && (
                    <div className={styles.accessNotice}>
                        <AlertCircle size={15} />
                        <span>You currently have view-only access to operational expense records.</span>
                    </div>
                )}

                {/* 1. Executive Expense KPI Summary */}
                <div className={styles.sectionBlock}>
                    <ExpenseSummary expenses={expenses} isLoading={isLoading} />
                </div>

                {/* 2. Visual Expense Analytics & Charts (When in Full Mode) */}
                {viewMode === 'Full' && (
                    <div className={styles.sectionBlock}>
                        <ExpenseAnalytics expenses={expenses} isLoading={isLoading} />
                    </div>
                )}

                {/* 3. Detailed Expense Ledger Table */}
                <div className={styles.sectionBlock}>
                    <ExpenseList
                        expenses={filteredExpenses}
                        isLoading={isLoading}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                        onSearch={handleSearch}
                        onFilterChange={handleFilter}
                        categories={categories}
                    />
                </div>

                {/* Add/Edit Expense Modal */}
                {canAddExpenses && (
                    <AddExpenseModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSubmit={handleSubmitExpense}
                        categories={categories}
                    />
                )}
            </div>
        </>
    );
}
