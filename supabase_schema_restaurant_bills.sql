-- RESTAURANT BILLS
create table if not exists public.restaurant_bills (
  id uuid default uuid_generate_v4() primary key,
  bill_number text unique not null,
  guest_name text not null,
  room_number text,
  items jsonb not null default '[]'::jsonb, -- Array of { name, qty, price }
  subtotal numeric not null default 0,
  tax_amount numeric not null default 0,
  total_amount numeric not null default 0,
  payment_mode text check (payment_mode in ('Cash', 'Card', 'UPI')) default 'Cash',
  status text check (status in ('Paid', 'Pending', 'Partial')) default 'Pending',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.restaurant_bills enable row level security;

-- Allow read/write for authenticated users
create policy "Allow full access for authenticated users"
  on public.restaurant_bills
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
