-- Run this in your Supabase SQL Editor
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS advance_amount numeric DEFAULT 0;
