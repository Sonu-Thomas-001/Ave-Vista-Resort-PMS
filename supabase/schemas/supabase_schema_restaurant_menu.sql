-- Create table for Restaurant Menu Items
create table if not exists public.restaurant_menu_items (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    price numeric not null default 0,
    category text not null default 'Main Course',
    description text,
    is_available boolean default true,
    created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table public.restaurant_menu_items enable row level security;

-- Policy to allow all users to read menu items
create policy "Allow public read access"
    on public.restaurant_menu_items for select
    using (true);

-- Policy to allow authenticated users to insert/update/delete
create policy "Allow authenticated insert/update/delete"
    on public.restaurant_menu_items for all
    using (auth.role() = 'authenticated');
