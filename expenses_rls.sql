-- Row Level Security Policies for Expenses Module

-- EXPENSE_CATEGORIES RLS Policies

-- Allow all authenticated users to read categories
CREATE POLICY "expense_categories_read_authenticated" ON public.expense_categories
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow Admin and Manager to create categories
CREATE POLICY "expense_categories_create_admin_manager" ON public.expense_categories
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );

-- Allow Admin and Manager to update categories
CREATE POLICY "expense_categories_update_admin_manager" ON public.expense_categories
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );

-- Allow Admin to delete categories (soft delete recommended via app)
CREATE POLICY "expense_categories_delete_admin" ON public.expense_categories
    FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Admin'
        ) AND
        is_default = FALSE -- Prevent deletion of default categories
    );

-- EXPENSES RLS Policies

-- Admin: Full access to all expenses
CREATE POLICY "expenses_admin_all" ON public.expenses
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

-- Manager: Can create, read, and update expenses
CREATE POLICY "expenses_manager_read_create_update" ON public.expenses
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );

CREATE POLICY "expenses_manager_insert" ON public.expenses
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

CREATE POLICY "expenses_manager_update_own" ON public.expenses
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        ) AND
        created_by = auth.uid()
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        ) AND
        created_by = auth.uid()
    );

-- Reception: Read-only access
CREATE POLICY "expenses_reception_read" ON public.expenses
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'Reception'
        )
    );

-- Soft delete (is_deleted flag is managed via app logic)
CREATE POLICY "expenses_soft_delete" ON public.expenses
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        ) AND
        created_by = auth.uid()
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Admin', 'Manager')
        )
    );
