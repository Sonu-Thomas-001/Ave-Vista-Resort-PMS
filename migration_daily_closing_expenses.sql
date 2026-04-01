-- Daily Closing Integration with Expenses
-- This migration adds support for daily closing reports with expense tracking

-- Create daily_closing table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_closing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    closing_date DATE NOT NULL UNIQUE,
    revenue_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    expenses_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    check_ins_today INT NOT NULL DEFAULT 0,
    check_outs_today INT NOT NULL DEFAULT 0,
    rooms_occupied INT NOT NULL DEFAULT 0,
    rooms_total INT NOT NULL DEFAULT 0,
    occupancy_rate NUMERIC DEFAULT 0,
    bookings_count INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_locked BOOLEAN DEFAULT FALSE -- Prevent modifications after closing
);

-- Create daily_closing_expenses table for detailed expense tracking per closing
CREATE TABLE IF NOT EXISTS public.daily_closing_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_closing_id UUID NOT NULL REFERENCES public.daily_closing(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    payment_mode VARCHAR,
    category_name VARCHAR, -- Stored for historical accuracy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.daily_closing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closing_expenses ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_daily_closing_date ON public.daily_closing(closing_date DESC);
CREATE INDEX idx_daily_closing_created_by ON public.daily_closing(created_by);
CREATE INDEX idx_daily_closing_expenses_daily_closing_id ON public.daily_closing_expenses(daily_closing_id);
CREATE INDEX idx_daily_closing_expenses_category ON public.daily_closing_expenses(category_id);

-- Trigger to update daily_closing updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_daily_closing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_closing_update_timestamp
BEFORE UPDATE ON public.daily_closing
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_closing_timestamp();

-- Helper function to calculate daily metrics
CREATE OR REPLACE FUNCTION public.get_daily_closing_metrics(closing_date DATE)
RETURNS TABLE(
    revenue DECIMAL,
    expenses DECIMAL,
    net_profit DECIMAL,
    check_ins INT,
    check_outs INT,
    bookings_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN inv.status IN ('Paid', 'Partial') THEN inv.paid_amount ELSE 0 END), 0)::DECIMAL as revenue,
        COALESCE(SUM(e.amount), 0)::DECIMAL as expenses,
        COALESCE(SUM(CASE WHEN inv.status IN ('Paid', 'Partial') THEN inv.paid_amount ELSE 0 END), 0) -
        COALESCE(SUM(e.amount), 0) as net_profit,
        COUNT(DISTINCT CASE WHEN b.check_in_date = closing_date THEN b.id END)::INT as check_ins,
        COUNT(DISTINCT CASE WHEN b.check_out_date = closing_date THEN b.id END)::INT as check_outs,
        COUNT(DISTINCT b.id)::INT as bookings_count
    FROM public.invoices inv
    FULL JOIN public.bookings b ON inv.booking_id = b.id
    FULL JOIN public.expenses e ON DATE(e.created_at) = closing_date AND e.is_deleted = FALSE
    WHERE DATE(inv.created_at) = closing_date 
        OR DATE(b.check_in_date) = closing_date 
        OR DATE(b.check_out_date) = closing_date
        OR DATE(e.created_at) = closing_date;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for daily_closing
CREATE POLICY "daily_closing_admin_full" ON public.daily_closing
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        )
    );

CREATE POLICY "daily_closing_manager_read_create" ON public.daily_closing
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );

CREATE POLICY "daily_closing_manager_insert" ON public.daily_closing
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "daily_closing_manager_update" ON public.daily_closing
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        ) AND
        is_locked = FALSE
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        )
    );

CREATE POLICY "daily_closing_reception_read" ON public.daily_closing
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Reception'
        )
    );

-- RLS Policies for daily_closing_expenses
CREATE POLICY "daily_closing_expenses_admin_all" ON public.daily_closing_expenses
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        )
    );

CREATE POLICY "daily_closing_expenses_manager_read" ON public.daily_closing_expenses
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );

CREATE POLICY "daily_closing_expenses_reception_read" ON public.daily_closing_expenses
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Reception'
        )
    );
