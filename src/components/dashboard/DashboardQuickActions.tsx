'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import AddExpenseModal, { ExpenseFormData } from '@/components/AddExpenseModal';
import styles from './DashboardQuickActions.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DashboardQuickActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const userRole = user?.role;

    // Only fetch categories if user is Admin or Manager
    useEffect(() => {
        if (userRole === 'Admin' || userRole === 'Manager') {
            const fetchCategories = async () => {
                try {
                    const { data, error } = await supabase
                        .from('expense_categories')
                        .select('*')
                        .order('name', { ascending: true });
                        
                    if (error) throw error;
                    setCategories(data || []);
                } catch (err) {
                    console.error('Error fetching categories:', err);
                }
            };
            fetchCategories();
        }
    }, [userRole]);

    const handleSubmit = async (formData: ExpenseFormData) => {
        const payload = {
            title: formData.title,
            categoryId: formData.categoryId,
            amount: parseFloat(formData.amount),
            date: formData.date,
            paymentMode: formData.paymentMode,
            notes: formData.notes || null,
            attachmentUrl: formData.attachmentUrl || null,
        };

        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create expense');
        }
        
        // Show success toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Refresh dashboard data
        router.refresh();
    };

    if (userRole !== 'Admin' && userRole !== 'Manager') return null;

    return (
        <div className={styles.container}>
            <button className={styles.quickActionBtn} onClick={() => setIsModalOpen(true)}>
                <Plus size={20} />
                Add Expense
            </button>
            
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                categories={categories}
            />

            {showToast && (
                <div className={styles.toast}>
                    <CheckCircle size={20} />
                    <span>Expense added successfully</span>
                </div>
            )}
        </div>
    );
}
