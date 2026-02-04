-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. APP SETTINGS (Extend existing table)
-- We assume app_settings exists from supabase_schema_settings.sql with id=1
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'app_settings' and column_name = 'email_enabled') then
    alter table public.app_settings add column email_enabled boolean default true;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'app_settings' and column_name = 'admin_email') then
    alter table public.app_settings add column admin_email text default 'avevistaresort@gmail.com';
  end if;
end $$;

-- 2. EMAIL TEMPLATES
create table if not exists public.email_templates (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null, -- e.g., 'booking-confirmation'
  name text not null,
  subject_template text not null,
  body_html text not null, -- The HTML content with placeholders like {{guest_name}}
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert Default Templates
insert into public.email_templates (slug, name, subject_template, body_html)
values
(
  'guest-welcome',
  'Welcome to Ave Vista Resort',
  'Welcome to Ave Vista Resort, {{first_name}}!',
  '<html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
       <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Ave Vista Resort</h1>
          <p style="margin: 5px 0 0;">Welcome</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{first_name}} {{last_name}},</p>
          <p>Thank you for registering with Ave Vista Resort. We are delighted to have you!</p>
          
          <p>We look forward to hosting you soon.</p>
          
          <p><strong>Contact Us:</strong><br/>
          +91 98765 43210<br/>
          info@avevistaresort.com
          </p>
        </div>
         <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; 2026 Ave Vista Resort. All rights reserved.
        </div>
      </div>
    </body>
  </html>'
),
(
  'booking-confirmation',
  'Booking Confirmation',
  'Booking Confirmed: {{booking_id}} - Ave Vista Resort',
  '<html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Ave Vista Resort</h1>
          <p style="margin: 5px 0 0;">Booking Confirmation</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{guest_name}},</p>
          <p>Thank you for choosing Ave Vista Resort. Your booking has been confirmed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{booking_id}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Room Type:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{room_type}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{check_in_date}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{check_out_date}}</td>
            </tr>
             <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{guests_count}}</td>
            </tr>
          </table>

          <p><strong>Resort Address:</strong><br/>
          123 Coastal Road, Goa, India<br/>
          <a href="https://maps.google.com/?q=Ave+Vista+Resort" style="color: #0f172a;">View on Google Maps</a>
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Booking</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; 2026 Ave Vista Resort. All rights reserved.
        </div>
      </div>
    </body>
  </html>'
),
(
  'checkin-confirmation',
  'Welcome to Ave Vista Resort',
  'Welcome! Your Room is Ready - Ave Vista Resort',
  '<html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
       <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Ave Vista Resort</h1>
          <p style="margin: 5px 0 0;">Check-in Successful</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{guest_name}},</p>
          <p>Welcome to Ave Vista Resort! You have successfully checked in.</p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Room Number:</strong> {{room_number}}</p>
            <p style="margin: 5px 0 0;"><strong>WiFi Password:</strong> avevista_guest</p>
          </div>

          <p><strong>Reception:</strong> Dial 9 from your room.</p>
          <p><strong>Breakfast:</strong> 7:30 AM - 10:30 AM at The Palm Restaurant.</p>

          <p>Enjoy your stay!</p>
        </div>
         <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; 2026 Ave Vista Resort. All rights reserved.
        </div>
      </div>
    </body>
  </html>'
),
(
  'invoice-email',
  'Your Invoice from Ave Vista Resort',
  'Invoice #{{invoice_number}} - Ave Vista Resort',
  '<html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
       <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Ave Vista Resort</h1>
          <p style="margin: 5px 0 0;">Billing & Invoice</p>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{guest_name}},</p>
          <p>Thank you for staying with us. We hope you had a wonderful time!</p>
          
          <p>Please find attached your invoice <strong>#{{invoice_number}}</strong>.</p>
          
          <p><strong>Summary:</strong></p>
          <ul>
            <li>Total Amount: {{total_amount}}</li>
            <li>Status: {{payment_status}}</li>
          </ul>

          <p>We hope to see you again soon!</p>
        </div>
         <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; 2026 Ave Vista Resort. All rights reserved.
        </div>
      </div>
    </body>
  </html>'
),
(
  'admin-alert',
  'New System Alert',
  '[Admin] {{event_type}} - Ave Vista PMS',
  '<html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <h2 style="color: #d9534f;">Admin Notification</h2>
        <p><strong>Event:</strong> {{event_type}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <hr/>
        <a href="{{dashboard_link}}">Open Dashboard</a>
      </div>
    </body>
  </html>'
)
on conflict (slug) do nothing;

-- 3. EMAIL LOGS
create table if not exists public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  recipient text not null,
  template_slug text not null,
  status text check (status in ('Sent', 'Failed', 'Pending')) default 'Pending',
  error_message text,
  metadata jsonb, -- Stores extra info like booking_id, etc.
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table public.email_templates enable row level security;
alter table public.email_logs enable row level security;

-- Policies
-- Templates: Read for everyone (true), Write for Authenticated
drop policy if exists "Allow all access to email_templates" on public.email_templates;
create policy "Allow read access to email_templates" on public.email_templates for select using (true);
create policy "Allow write access to email_templates" on public.email_templates for insert with check (auth.role() = 'authenticated');
create policy "Allow update access to email_templates" on public.email_templates for update using (auth.role() = 'authenticated');

-- Logs: Read/Write for Authenticated
drop policy if exists "Allow all access to email_logs" on public.email_logs;
create policy "Allow all access to email_logs" on public.email_logs for all using (auth.role() = 'authenticated');
