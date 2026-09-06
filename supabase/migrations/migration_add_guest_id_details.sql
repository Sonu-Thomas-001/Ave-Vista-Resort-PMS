-- Run this in your Supabase SQL Editor
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS id_proof_type text;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS id_proof_number text;
