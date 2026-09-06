-- Update existing invoice numbers to new format AVE-INV-XXXX

-- First, let's see the current invoices
SELECT id, invoice_number, invoice_date 
FROM invoices 
ORDER BY invoice_date;

-- Update all existing invoices to new format using CTE
WITH numbered_invoices AS (
    SELECT 
        id,
        'AVE-INV-' || LPAD((ROW_NUMBER() OVER (ORDER BY invoice_date) + 1000)::TEXT, 4, '0') AS new_invoice_number
    FROM invoices
)
UPDATE invoices
SET invoice_number = numbered_invoices.new_invoice_number
FROM numbered_invoices
WHERE invoices.id = numbered_invoices.id;

-- Verify the changes
SELECT id, invoice_number, invoice_date 
FROM invoices 
ORDER BY invoice_date;
