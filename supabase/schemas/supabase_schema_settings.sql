-- Settings Table for Global Configuration
-- Run this in Supabase SQL Editor to update/create the table

create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  resort_name text default 'Ave Vista Resort & Hotels',
  contact_email text default 'avevistaresort@gmail.com',
  address text default 'Near Old Toll Gate, Kumarakom Road, Kottayam, Kerala 686001',
  gst_number text default '32AAAAA0000A1Z5',
  tax_rate numeric default 18.0,
  gst_enabled boolean default true,
  allow_registration boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure gst_enabled and allow_registration columns exist if table was created previously
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'app_settings' and column_name = 'gst_enabled') then
    alter table public.app_settings add column gst_enabled boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'app_settings' and column_name = 'allow_registration') then
    alter table public.app_settings add column allow_registration boolean default true;
  end if;
end $$;

-- Enable RLS
alter table public.app_settings enable row level security;

-- Policies
drop policy if exists "Allow read access for all" on public.app_settings;
drop policy if exists "Allow insert for all" on public.app_settings;
drop policy if exists "Allow update for all" on public.app_settings;
drop policy if exists "Allow read access for authenticated users" on public.app_settings;
drop policy if exists "Allow update for authenticated users" on public.app_settings;

create policy "Allow read access for all" on public.app_settings for select using (true);
create policy "Allow insert for all" on public.app_settings for insert with check (true);
create policy "Allow update for all" on public.app_settings for update using (true);

-- Insert default if not exists
insert into public.app_settings (id, resort_name, gst_number, tax_rate, gst_enabled) 
values (1, 'Ave Vista Resort & Hotels', '32AAAAA0000A1Z5', 18.0, true) 
on conflict (id) do nothing;

