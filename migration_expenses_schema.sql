-- Expense Tracking Module Schema
-- Creates tables for expenses and expense categories with proper relationships and constraints

-- EXPENSE_CATEGORIES Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    color VARCHAR DEFAULT '#6B7280', -- Default gray color
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE, -- Built-in categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- EXPENSES Table (Main)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode VARCHAR CHECK (payment_mode IN ('Cash', 'UPI', 'Bank', 'Card')) DEFAULT 'Cash',
    notes TEXT,
    attachment_url TEXT, -- Supabase Storage path
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_expenses_date ON public.expenses(date) WHERE is_deleted = FALSE;
CREATE INDEX idx_expenses_category ON public.expenses(category_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by) WHERE is_deleted = FALSE;
CREATE INDEX idx_expenses_created_at ON public.expenses(created_at) WHERE is_deleted = FALSE;
CREATE INDEX idx_expenses_payment_mode ON public.expenses(payment_mode) WHERE is_deleted = FALSE;
CREATE INDEX idx_expense_categories_name ON public.expense_categories(name);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, color, description, is_default) VALUES
    ('Maintenance', '#DC2626', 'Building and equipment repairs', TRUE),
    ('Staff Salary', '#7C3AED', 'Employee salaries and wages', TRUE),
    ('Utilities', '#0EA5E9', 'Electricity, water, and other utilities', TRUE),
    ('Food Supplies', '#F97316', 'Kitchen and F&B supplies', TRUE),
    ('Cleaning Supplies', '#10B981', 'Housekeeping and cleaning materials', TRUE),
    ('Marketing', '#8B5CF6', 'Advertising and promotional activities', TRUE),
    ('Miscellaneous', '#6B7280', 'Other operational expenses', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Helper function to get expense summary by date range
CREATE OR REPLACE FUNCTION public.get_expense_summary(
    start_date DATE,
    end_date DATE,
    category_filter UUID DEFAULT NULL
)
RETURNS TABLE(
    total_amount DECIMAL,
    transaction_count BIGINT,
    payment_mode VARCHAR,
    category_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(e.amount)::DECIMAL as total_amount,
        COUNT(*)::BIGINT as transaction_count,
        e.payment_mode,
        ec.name as category_name
    FROM public.expenses e
    JOIN public.expense_categories ec ON e.category_id = ec.id
    WHERE e.date BETWEEN start_date AND end_date
        AND e.is_deleted = FALSE
        AND (category_filter IS NULL OR e.category_id = category_filter)
    GROUP BY e.payment_mode, ec.name;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get daily expense totals
CREATE OR REPLACE FUNCTION public.get_daily_expenses(start_date DATE, end_date DATE)
RETURNS TABLE(
    expense_date DATE,
    total_amount DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.date as expense_date,
        SUM(e.amount)::DECIMAL as total_amount,
        COUNT(*)::BIGINT as transaction_count
    FROM public.expenses e
    WHERE e.date BETWEEN start_date AND end_date
        AND e.is_deleted = FALSE
    GROUP BY e.date
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get category-wise expenses
CREATE OR REPLACE FUNCTION public.get_category_expenses(start_date DATE, end_date DATE)
RETURNS TABLE(
    category_name VARCHAR,
    category_color VARCHAR,
    total_amount DECIMAL,
    transaction_count BIGINT,
    percentage_of_total DECIMAL
) AS $$
DECLARE
    grand_total DECIMAL;
BEGIN
    -- Calculate grand total first
    SELECT SUM(e.amount) INTO grand_total
    FROM public.expenses e
    WHERE e.date BETWEEN start_date AND end_date
        AND e.is_deleted = FALSE;

    RETURN QUERY
    SELECT
        ec.name,
        ec.color,
        SUM(e.amount)::DECIMAL as total_amount,
        COUNT(*)::BIGINT as transaction_count,
        CASE 
            WHEN grand_total > 0 THEN ROUND((SUM(e.amount) / grand_total * 100)::NUMERIC, 2)
            ELSE 0
        END as percentage_of_total
    FROM public.expenses e
    JOIN public.expense_categories ec ON e.category_id = ec.id
    WHERE e.date BETWEEN start_date AND end_date
        AND e.is_deleted = FALSE
    GROUP BY ec.id, ec.name, ec.color
    ORDER BY SUM(e.amount) DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_expense_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_update_timestamp
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_expense_timestamp();
