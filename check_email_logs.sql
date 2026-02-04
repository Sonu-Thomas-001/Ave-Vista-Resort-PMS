-- Check email_logs table
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;

-- Check if table exists and has correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'email_logs';
