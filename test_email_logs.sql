-- Test script to verify email_logs table is accessible and working

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_logs'
);

-- 2. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'email_logs';

-- 3. Try to insert a test log (this will help identify if RLS is blocking)
INSERT INTO email_logs (recipient, template_slug, status, metadata)
VALUES ('test@example.com', 'test-template', 'Sent', '{"test": true}');

-- 4. Check if the insert worked
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;

-- 5. Clean up test data
DELETE FROM email_logs WHERE recipient = 'test@example.com' AND template_slug = 'test-template';
