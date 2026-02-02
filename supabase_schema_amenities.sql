-- Add amenities column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}';

-- Populate existing rooms with default amenities based on type (Max 5 items)
-- Single Cottage
UPDATE rooms 
SET amenities = ARRAY['View', 'Air conditioning', 'Ensuite bathroom', 'Flat-screen TV', 'Free WiFi'] 
WHERE LOWER(type) LIKE '%single%';

-- Family Cottage
UPDATE rooms 
SET amenities = ARRAY['Private kitchen', 'Pool view', 'Air conditioning', 'Ensuite bathroom', 'Free WiFi'] 
WHERE LOWER(type) LIKE '%family%';

-- Tent / Tree House
UPDATE rooms 
SET amenities = ARRAY['Pool view', 'Air conditioning', 'Ensuite bathroom', 'Barbecue', 'Free WiFi']
WHERE LOWER(type) LIKE '%tent%' OR LOWER(type) LIKE '%tree%';

-- Fallback for others
UPDATE rooms 
SET amenities = ARRAY['Free Wifi', 'Coffee Maker'] 
WHERE (amenities = '{}' OR amenities IS NULL) AND LOWER(type) NOT LIKE '%single%' AND LOWER(type) NOT LIKE '%family%' AND LOWER(type) NOT LIKE '%tent%' AND LOWER(type) NOT LIKE '%tree%';
