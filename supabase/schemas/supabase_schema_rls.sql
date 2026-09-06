-- Enable INSERT and UPDATE for authenticated users on key tables
-- Run this in Supabase SQL Editor

-- Guests Policies
create policy "Allow read access for all" on public.guests for select using (true);
create policy "Allow insert for authenticated users" on public.guests for insert with check (auth.role() = 'authenticated');
create policy "Allow update for authenticated users" on public.guests for update using (auth.role() = 'authenticated');

-- Bookings Policies
create policy "Allow read access for all" on public.bookings for select using (true);
create policy "Allow insert for authenticated users" on public.bookings for insert with check (auth.role() = 'authenticated');
create policy "Allow update for authenticated users" on public.bookings for update using (auth.role() = 'authenticated');

-- Rooms Policies (For status updates)
create policy "Allow read access for all" on public.rooms for select using (true);
create policy "Allow update for authenticated users" on public.rooms for update using (auth.role() = 'authenticated');
-- Typically admin only for Insert/Delete rooms, but let's allow authenticated for now for the Room Config page
create policy "Allow insert for authenticated users" on public.rooms for insert with check (auth.role() = 'authenticated');
create policy "Allow delete for authenticated users" on public.rooms for delete using (auth.role() = 'authenticated');

-- Invoices Policies (For future)
alter table public.invoices enable row level security;
create policy "Allow read access for all" on public.invoices for select using (true);
create policy "Allow insert for authenticated users" on public.invoices for insert with check (auth.role() = 'authenticated');
create policy "Allow update for authenticated users" on public.invoices for update using (auth.role() = 'authenticated');
