-- Bulk insert rooms data
-- Run this in your Supabase SQL Editor

-- Clear existing rooms if needed (Optional: Remove comment to clear)
-- DELETE FROM public.rooms;

INSERT INTO public.rooms (room_number, type, price_per_night, max_occupancy, status, image_url)
VALUES 
  -- Single Cottages (4 Rooms)
  ('A1', 'Single Cottage', 5000, 2, 'Clean', null),
  ('A2', 'Single Cottage', 5000, 2, 'Clean', null),
  ('A3', 'Single Cottage', 5000, 2, 'Clean', null),
  ('A4', 'Single Cottage', 5000, 2, 'Clean', null),

  -- Family Cottages (1 Unit)
  ('FC1', 'Family Cottage', 8000, 4, 'Clean', null),

  -- Hut / Tree House (1 Unit)
  ('TH1', 'Tree House', 6000, 2, 'Clean', null),

  -- Dormitory Rooms (1 Unit)
  ('D1', 'Dormitory', 3000, 10, 'Clean', null),
  
  -- Mini Auditorium (1 Unit)
  ('MA1', 'Mini Auditorium', 15000, 50, 'Clean', null),
  
  -- Swimming Pool (1 Unit)
  ('SP1', 'Swimming Pool', 500, 20, 'Clean', null);
