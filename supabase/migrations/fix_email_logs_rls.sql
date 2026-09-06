-- Fix RLS Policy for email_logs to allow API route access
-- The issue is that the API route uses the service role, not authenticated user role

-- Drop existing policy
DROP POLICY IF EXISTS "Allow all access to email_logs" ON public.email_logs;

-- Create new policy that allows service role (for API routes) and authenticated users
CREATE POLICY "Allow service and authenticated access to email_logs" 
ON public.email_logs 
FOR ALL 
USING (true);  -- Allow all reads

CREATE POLICY "Allow insert to email_logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);  -- Allow all inserts (API routes use service role)

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'email_logs'
ORDER BY ordinal_position;
