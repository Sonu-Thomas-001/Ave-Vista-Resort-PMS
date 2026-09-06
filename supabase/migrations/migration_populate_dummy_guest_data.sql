-- Populate existing guests with dummy data for testing invoice

-- Update Guest 1 (Corporate)
UPDATE guests
SET 
  company_name = 'Tech Solutions Pvt Ltd',
  gst_number = '29ABCDE1234F1Z5',
  address = '456, Cyber City, Bangalore, Karnataka - 560001'
WHERE id IN (
  SELECT id FROM guests 
  WHERE email IS NOT NULL AND company_name IS NULL
  ORDER BY created_at DESC 
  LIMIT 2
);

-- Update Guest 2 (Individual with address)
UPDATE guests
SET 
  address = 'Flat 101, Palm Grove Apts, Kochi, Kerala - 682001'
WHERE id IN (
  SELECT id FROM guests 
  WHERE email IS NOT NULL AND address IS NULL
  ORDER BY created_at DESC 
  LIMIT 3
);

-- Update Guest 3 (Another Corporate)
UPDATE guests
SET 
  company_name = 'Global Ventures',
  gst_number = '32HGHYT6789L2Z1',
  address = '789, MG Road, Mumbai, Maharashtra - 400001'
WHERE id IN (
  SELECT id FROM guests 
  WHERE email IS NOT NULL AND company_name IS NULL
  ORDER BY created_at DESC 
  LIMIT 2
);
