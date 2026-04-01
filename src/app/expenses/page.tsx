'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import AddExpenseModal, { ExpenseFormData } from '@/components/AddExpenseModal';
import ExpenseList from '@/components/ExpenseList';
import ExpenseSummary from '@/components/ExpenseSummary';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';
import styles from './expenses.module.css';

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
    const [userRole, setUserRole] = useState<string | null>(null);

    // Fetch user role
    useEffect(() => {
        const checkRole = async () => {
            try {
                const response = await fetch('/api/auth/user-role', {
                    cache: 'no-store',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserRole(data.role);
                }
            } catch (err) {
                console.error('Failed to fetch user role:', err);
            }
        };

        checkRole();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/expenses/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data.categories || []);
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
                const params = new URLSearchParams();

                if (filters?.startDate) params.append('startDate', filters.startDate);
                if (filters?.endDate) params.append('endDate', filters.endDate);
                if (filters?.categoryId) params.append('categoryId', filters.categoryId);
                if (filters?.paymentMode)
                    params.append('paymentMode', filters.paymentMode);
                if (filters?.search) params.append('search', filters.search);

                const response = await fetch(
                    `/api/expenses?${params.toString()}`,
                    { cache: 'no-store' }
                );
                if (!response.ok) throw new Error('Failed to fetch expenses');

                const data = await response.json();
                setExpenses(data.expenses || []);
                setFilteredExpenses(data.expenses || []);
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
                // Update existing expense
                const response = await fetch(
                    `/api/expenses/${editingExpense.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update expense');
                }

                setSuccessMessage('Expense updated successfully!');
                setEditingExpense(null);
            } else {
                // Create new expense
                const response = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create expense');
                }

                setSuccessMessage('Expense added successfully!');
            }

            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense');
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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete expense');
            }

            setSuccessMessage('Expense deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
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
            const filtered = expenses.filter((expense) =>
                expense.title.toLowerCase().includes(query.toLowerCase())
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

    // Check if user can add expenses (if not loaded yet, assume view-only or handled appropriately. We'll only show notice if loaded and not allowed)
    const canAddExpenses = userRole === 'Admin' || userRole === 'Manager';
    const hasRoleLoaded = userRole !== null;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Expense Tracking</h1>
                    <p className={styles.subtitle}>
                        Monitor and manage all operational expenses
                    </p>
                </div>

                {canAddExpenses && (
                    <button
                        className={styles.addBtn}
                        onClick={() => {
                            setEditingExpense(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={20} />
                        Add Expense
                    </button>
                )}
            </div>

            {/* Messages */}
            {error && (
                <div className={styles.message} data-type="error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className={styles.message} data-type="success">
                    <span>✓</span>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Role-Based Access Notice */}
            {hasRoleLoaded && !canAddExpenses && (
                <div className={styles.accessNotice}>
                    <AlertCircle size={16} />
                    <span>You have view-only access to expenses</span>
                </div>
            )}

            {/* Summary Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Overview</h2>
                <ExpenseSummary expenses={expenses} isLoading={isLoading} />
            </section>

            {/* Analytics Section */}
            <section className={styles.section}>
                <ExpenseAnalytics expenses={expenses} isLoading={isLoading} />
            </section>

            {/* Expense List Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>All Expenses</h2>
                <ExpenseList
                    expenses={filteredExpenses}
                    isLoading={isLoading}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    onSearch={handleSearch}
                    onFilterChange={handleFilter}
                    categories={categories}
                />
            </section>

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
    );
}
