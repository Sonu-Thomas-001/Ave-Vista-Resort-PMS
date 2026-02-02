-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.invoices;

-- Create the new permissive policy
CREATE POLICY "Allow read access for all" ON public.invoices FOR SELECT USING (true);
