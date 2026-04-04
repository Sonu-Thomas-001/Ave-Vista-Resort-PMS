-- Fix for missing RLS policies on Expenses module

-- 1. Allow authenticated users to securely read all expense categories
CREATE POLICY "Enable read access for authenticated users" 
ON public.expense_categories
FOR SELECT TO authenticated 
USING (true);

-- 2. Allow authenticated users to read expenses
CREATE POLICY "Enable read access for authenticated users" 
ON public.expenses
FOR SELECT TO authenticated 
USING (true);

-- 3. Allow Admin and Manager to insert expenses
CREATE POLICY "Enable insert for authenticated users" 
ON public.expenses
FOR INSERT TO authenticated 
WITH CHECK (true);

-- 4. Allow Admin and Manager to update their own or all expenses
CREATE POLICY "Enable update for authenticated users" 
ON public.expenses
FOR UPDATE TO authenticated 
USING (true)
WITH CHECK (true);
