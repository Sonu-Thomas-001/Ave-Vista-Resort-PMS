-- Run this in your Supabase SQL Editor to fix the foreign key relationships
-- This allows the Next.js API to fetch user full names correctly from the profiles table

-- 1. Fix expense_categories table
ALTER TABLE IF EXISTS public.expense_categories 
    DROP CONSTRAINT IF EXISTS expense_categories_created_by_fkey;

ALTER TABLE IF EXISTS public.expense_categories
    ADD CONSTRAINT expense_categories_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Fix expenses table
ALTER TABLE IF EXISTS public.expenses 
    DROP CONSTRAINT IF EXISTS expenses_created_by_fkey,
    DROP CONSTRAINT IF EXISTS expenses_deleted_by_fkey;

ALTER TABLE IF EXISTS public.expenses
    ADD CONSTRAINT expenses_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE,
    ADD CONSTRAINT expenses_deleted_by_fkey 
    FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Fix daily_closing table (if applied)
ALTER TABLE IF EXISTS public.daily_closing 
    DROP CONSTRAINT IF EXISTS daily_closing_created_by_fkey;

ALTER TABLE IF EXISTS public.daily_closing
    ADD CONSTRAINT daily_closing_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
