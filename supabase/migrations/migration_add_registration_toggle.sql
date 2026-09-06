-- Migration: Add allow_registration to app_settings
-- Enables administrators to pause or resume new staff self-registrations

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'app_settings' and column_name = 'allow_registration') then
    alter table public.app_settings add column allow_registration boolean default true;
  end if;
end $$;

-- Ensure public read access is enabled so the unauthenticated login/signup screens can check the status
drop policy if exists "Allow read access for all" on public.app_settings;
create policy "Allow read access for all" on public.app_settings for select using (true);
