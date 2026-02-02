-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text, -- Added for easier queries
  role text check (role in ('Admin', 'Manager', 'Reception')) default 'Reception',
  shift text check (shift in ('Morning', 'Evening', 'Night')) default 'Morning',
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ROOMS
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  room_number text unique not null,
  type text not null, -- 'Deluxe', 'Suite', etc.
  price_per_night numeric not null,
  status text check (status in ('Clean', 'Dirty', 'Maintenance', 'Occupied')) default 'Clean',
  max_occupancy int default 2,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- GUESTS
create table public.guests (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  id_proof_url text, -- Link to uploaded file
  is_vip boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- BOOKINGS
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  guest_id uuid references public.guests(id) not null,
  room_id uuid references public.rooms(id) not null,
  check_in_date date not null,
  check_out_date date not null,
  status text check (status in ('Confirmed', 'Checked In', 'Checked Out', 'Cancelled')) default 'Confirmed',
  total_amount numeric not null,
  adults int default 1,
  children int default 0,
  source text default 'Walk-in',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- INVOICES (Billing)
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id),
  invoice_number text unique not null,
  amount numeric not null,
  tax_amount numeric default 0,
  payment_status text check (payment_status in ('Paid', 'Pending', 'Partial')) default 'Pending',
  payment_method text, -- 'Cash', 'Card', 'UPI'
  generated_at timestamp with time zone default timezone('utc'::text, now())
);



-- RLS POLICIES (Simple for now)
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.guests enable row level security;
alter table public.bookings enable row level security;

-- Allow read access to authenticated users
create policy "Allow read access for authenticated users" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.rooms for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.guests for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on public.bookings for select using (auth.role() = 'authenticated');

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'Reception'), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
