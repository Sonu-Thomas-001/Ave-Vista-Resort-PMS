'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    CalendarPlus,
    MonitorCheck,
    CreditCard,
    UtensilsCrossed,
    CheckCircle2,
    Sparkles,
    IndianRupee
} from 'lucide-react';
import AddExpenseModal, { ExpenseFormData } from '@/components/AddExpenseModal';
import NewBookingModal from '@/components/NewBookingModal';
import styles from './DashboardQuickActions.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { hasAccess } from '@/lib/permissions';

export default function DashboardQuickActions() {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();
    const userRole = user?.role;

    // Fetch expense categories for Admin / Manager / Reception
    useEffect(() => {
        if (userRole) {
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

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleExpenseSubmit = async (formData: ExpenseFormData) => {
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
            throw new Error(errorData.error || 'Failed to record expense');
        }

        showToast('Expense recorded successfully');
        router.refresh();
    };

    const handleBookingSuccess = () => {
        setIsBookingModalOpen(false);
        showToast('Reservation created successfully');
        router.refresh();
    };

    if (!user) return null;

    return (
        <section className={styles.wrapper}>
            <div className={styles.headerRow}>
                <div className={styles.sectionLabel}>
                    <Sparkles size={16} className={styles.sparkleIcon} />
                    <span>Quick Operations Hub</span>
                </div>
            </div>

            <div className={styles.actionGrid}>
                {/* Primary Action: New Booking */}
                <button
                    className={`${styles.actionBtn} ${styles.primaryBtn}`}
                    onClick={() => setIsBookingModalOpen(true)}
                >
                    <div className={styles.iconCirclePrimary}>
                        <CalendarPlus size={18} strokeWidth={2.2} />
                    </div>
                    <div className={styles.actionDetails}>
                        <span className={styles.actionTitle}>New Booking</span>
                        <span className={styles.actionSubtitle}>Create reservation</span>
                    </div>
                </button>

                {/* Primary Action: Add Expense */}
                <button
                    className={`${styles.actionBtn} ${styles.expenseBtn}`}
                    onClick={() => setIsExpenseModalOpen(true)}
                >
                    <div className={styles.iconCircleExpense}>
                        <IndianRupee size={18} strokeWidth={2.2} />
                    </div>
                    <div className={styles.actionDetails}>
                        <span className={styles.actionTitle}>Add Expense</span>
                        <span className={styles.actionSubtitle}>Log voucher</span>
                    </div>
                </button>

                {/* Quick Link: Front Desk */}
                {hasAccess(userRole, '/front-desk') && (
                    <button
                        className={styles.actionBtn}
                        onClick={() => router.push('/front-desk')}
                    >
                        <div className={`${styles.iconCircle} ${styles.iconSky}`}>
                            <MonitorCheck size={18} strokeWidth={2} />
                        </div>
                        <div className={styles.actionDetails}>
                            <span className={styles.actionTitle}>Front Desk</span>
                            <span className={styles.actionSubtitle}>Live arrivals & rooms</span>
                        </div>
                    </button>
                )}

                {/* Quick Link: Billing */}
                {hasAccess(userRole, '/billing') && (
                    <button
                        className={styles.actionBtn}
                        onClick={() => router.push('/billing')}
                    >
                        <div className={`${styles.iconCircle} ${styles.iconIndigo}`}>
                            <CreditCard size={18} strokeWidth={2} />
                        </div>
                        <div className={styles.actionDetails}>
                            <span className={styles.actionTitle}>Billing</span>
                            <span className={styles.actionSubtitle}>Invoices & payments</span>
                        </div>
                    </button>
                )}

                {/* Quick Link: Restaurant POS */}
                {hasAccess(userRole, '/restaurant-bill') && (
                    <button
                        className={styles.actionBtn}
                        onClick={() => router.push('/restaurant-bill')}
                    >
                        <div className={`${styles.iconCircle} ${styles.iconAmber}`}>
                            <UtensilsCrossed size={18} strokeWidth={2} />
                        </div>
                        <div className={styles.actionDetails}>
                            <span className={styles.actionTitle}>Restaurant POS</span>
                            <span className={styles.actionSubtitle}>Order & room service</span>
                        </div>
                    </button>
                )}
            </div>

            {/* Modals */}
            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSubmit={handleExpenseSubmit}
                categories={categories}
            />

            {isBookingModalOpen && (
                <NewBookingModal
                    onClose={() => setIsBookingModalOpen(false)}
                    onSuccess={handleBookingSuccess}
                />
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className={styles.toast}>
                    <CheckCircle2 size={18} className={styles.toastCheck} />
                    <span>{toastMessage}</span>
                </div>
            )}
        </section>
    );
}
