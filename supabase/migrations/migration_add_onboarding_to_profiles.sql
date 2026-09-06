-- Migration: Add onboarding tracking fields to public.profiles
-- Supports Ave Vista PMS First-Time User Onboarding Guide

-- 1. Add onboarding tracking columns if they do not already exist
alter table public.profiles
add column if not exists onboarding_completed boolean default false,
add column if not exists onboarding_skipped boolean default false,
add column if not exists onboarding_version text default '1.0',
add column if not exists onboarding_completed_at timestamp with time zone;

-- 2. Add an index for quick lookups on onboarding status
create index if not exists idx_profiles_onboarding_status 
on public.profiles (id, onboarding_completed, onboarding_version);

-- 3. Ensure authenticated users can update their own profile row (for onboarding and preferences)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles'
    and policyname = 'Allow users to update own profile'
  ) then
    create policy "Allow users to update own profile"
    on public.profiles
    for update
    using (auth.uid() = id);
  end if;
end $$;
