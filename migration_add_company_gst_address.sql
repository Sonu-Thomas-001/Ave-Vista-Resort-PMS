-- Add company_name, gst_number, and address columns to the guests table

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the comments/documentation if necessary
COMMENT ON COLUMN guests.company_name IS 'Company name for corporate guests';
COMMENT ON COLUMN guests.gst_number IS 'GST Number for tax invoicing';
COMMENT ON COLUMN guests.address IS 'Full address of the guest';
