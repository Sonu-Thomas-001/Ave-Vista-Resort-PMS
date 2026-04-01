import { supabase } from '@/lib/supabase';

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
    deleted_at?: string;
    deleted_by?: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
    description?: string;
    is_default: boolean;
    created_at: string;
    created_by: string;
}

export interface ExpenseWithRelations extends Expense {
    expense_categories?: ExpenseCategory;
    profiles?: { full_name: string };
}

export const expenseService = {
    async getExpenses(filters?: {
        startDate?: string;
        endDate?: string;
        categoryId?: string;
        paymentMode?: string;
        search?: string;
    }) {
        try {
            let query = supabase
                .from('expenses')
                .select(
                    `*,
                    expense_categories:category_id(*),
                    profiles:created_by(full_name)`
                )
                .eq('is_deleted', false)
                .order('date', { ascending: false });

            if (filters?.startDate) {
                query = query.gte('date', filters.startDate);
            }
            if (filters?.endDate) {
                query = query.lte('date', filters.endDate);
            }
            if (filters?.categoryId) {
                query = query.eq('category_id', filters.categoryId);
            }
            if (filters?.paymentMode) {
                query = query.eq('payment_mode', filters.paymentMode);
            }
            if (filters?.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data as ExpenseWithRelations[], error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async getExpense(id: string) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select(
                    `*,
                    expense_categories:category_id(*),
                    profiles:created_by(full_name)`
                )
                .eq('id', id)
                .eq('is_deleted', false)
                .single();

            if (error) throw error;
            return { data: data as ExpenseWithRelations, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async createExpense(expense: Partial<Expense>) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([expense as any])
                .select(
                    `*,
                    expense_categories:category_id(*),
                    profiles:created_by(full_name)`
                )
                .single();

            if (error) throw error;
            return { data: data as ExpenseWithRelations, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async updateExpense(id: string, updates: Partial<Expense>) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .update(updates as any)
                .eq('id', id)
                .select(
                    `*,
                    expense_categories:category_id(*),
                    profiles:created_by(full_name)`
                )
                .single();

            if (error) throw error;
            return { data: data as ExpenseWithRelations, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async softDeleteExpense(id: string, deletedBy: string) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    deleted_by: deletedBy,
                } as any)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data: data as Expense, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async getCategories() {
        try {
            const { data, error } = await supabase
                .from('expense_categories')
                .select('*')
                .order('is_default', { ascending: false })
                .order('name', { ascending: true });

            if (error) throw error;
            return { data: data as ExpenseCategory[], error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async createCategory(category: Partial<ExpenseCategory>) {
        try {
            const { data, error } = await supabase
                .from('expense_categories')
                .insert([category as any])
                .select()
                .single();

            if (error) throw error;
            return { data: data as ExpenseCategory, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async getExpenseSummary(startDate: string, endDate: string, categoryId?: string) {
        try {
            const { data, error } = await supabase
                .rpc('get_category_expenses', {
                    start_date: startDate,
                    end_date: endDate,
                });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    async getDailyExpenses(startDate: string, endDate: string) {
        try {
            const { data, error } = await supabase
                .rpc('get_daily_expenses', {
                    start_date: startDate,
                    end_date: endDate,
                });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },
};
