-- Settings Table for Global Configuration
-- Run this in Supabase SQL Editor to update/create the table

-- Drop if exists to ensure schema update (CAUTION: Resets data)
-- drop table if exists public.app_settings;

create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  resort_name text default 'Ave Vista Resort',
  contact_email text default 'contact@avevista.com',
  contact_phone text default '+91 98765 43210',
  website text default 'www.avevista.com',
  address text default '123 Hill Top Road, Manali, HP',
  description text,
  gst_number text default '02AAAAA0000A1Z5',
  tax_rate numeric default 18.0,
  currency_symbol text default '₹',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table public.app_settings enable row level security;
create policy "Allow read access for authenticated users" on public.app_settings for select using (auth.role() = 'authenticated');
create policy "Allow update for authenticated users" on public.app_settings for update using (auth.role() = 'authenticated');

-- Insert default if not exists
insert into public.app_settings (id) values (1) on conflict (id) do nothing;
