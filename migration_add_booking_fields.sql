-- Migration to add manual rate and extra pax fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS room_rate NUMERIC,
ADD COLUMN IF NOT EXISTS extra_pax INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_pax_rate NUMERIC DEFAULT 600;

-- Update existing bookings to have a default room_rate from their total_amount (rough estimate)
UPDATE public.bookings 
SET room_rate = total_amount 
WHERE room_rate IS NULL;

-- Ensure RLS allows these new columns for authenticated users (should be covered by existing policy)
COMMENT ON COLUMN public.bookings.room_rate IS 'The actual rate charged for the room (manually editable)';
COMMENT ON COLUMN public.bookings.extra_pax IS 'Number of extra members/pax';
COMMENT ON COLUMN public.bookings.extra_pax_rate IS 'Rate charged per extra pax';
