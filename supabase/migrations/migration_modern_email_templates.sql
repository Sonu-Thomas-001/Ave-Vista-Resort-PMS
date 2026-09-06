-- =========================================================================
-- Ave Vista Resorts & Hotels - Modern Email Templates Migration
-- Redesigned luxury responsive email templates with modern styling,
-- complete variable coverage, and new templates for checkin-reminder,
-- checkout-thankyou, booking-cancellation, and restaurant-bill.
-- =========================================================================

-- Ensure table exists
create table if not exists public.email_templates (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  subject_template text not null,
  body_html text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert or update all 9 modern luxury templates
insert into public.email_templates (slug, name, subject_template, body_html)
values
-- 1. GUEST WELCOME
(
  'guest-welcome',
  'Welcome to Ave Vista Resort',
  'Welcome to Ave Vista Resort, {{first_name}} {{last_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #0d9488 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #042f2e 0%, #0f766e 65%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;">
                      ✦ Guest Profile
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 28px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                Welcome to Ave Vista Resort
              </h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                Where tranquil hill vistas meet world-class hospitality. Your guest profile is now active for expedited reservations and personalized service.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; margin-bottom: 6px;">
                      Guest Recognition
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                      Hello, {{first_name}} {{last_name}}
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569;">
                      Thank you for connecting with Ave Vista Resort. Whether you are visiting for leisure, an intimate getaway, or business, our dedicated concierge team is committed to making every stay seamless and unforgettable.
                    </p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                  <span style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                    📋 Registered Profile Details
                  </span>
                  <span style="font-size: 12px; font-weight: 600; color: #059669; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 999px;">
                    Verified
                  </span>
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 38%;">Full Name</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">{{first_name}} {{last_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Primary Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f766e;">{{email}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Phone Number</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a;">{{phone}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Company / Firm</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155;">{{company_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">GST Number</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-family: monospace; color: #334155;">{{gst_number}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #64748b; vertical-align: top;">Billing Address</td>
                    <td style="padding: 10px 0 0 0; font-size: 13px; line-height: 1.5; color: #334155;">{{address}}</td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 16px; border: 1px solid #bbf7d0; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
                      ✦ Your Guest Privileges
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding: 6px 8px 6px 0; font-size: 13px; color: #166534;">✓ Express Front Desk Check-in</td>
                        <td width="50%" style="padding: 6px 0 6px 8px; font-size: 13px; color: #166534;">✓ High-Speed Resort-wide Wi-Fi</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 8px 6px 0; font-size: 13px; color: #166534;">✓ The Palm Dining Reservations</td>
                        <td style="padding: 6px 0 6px 8px; font-size: 13px; color: #166534;">✓ Digital Folio & Tax Invoicing</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 28px; text-align: center;">
                <a href="https://www.avevistaresorts.com" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Explore Resort & Amenities
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Concierge: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. All rights reserved. • Ave Vista PMS</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 2. BOOKING CONFIRMATION
(
  'booking-confirmation',
  'Booking Confirmation',
  'Booking Confirmed: {{booking_id}} - {{booking_type}} - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #10b981 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #022c22 0%, #0f766e 70%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);">
                      ✓ Confirmed
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">
                  Reservation Summary
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Your Stay is Confirmed!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  We are delighted to host you at Ave Vista Resort. Your room and services have been reserved under Booking ID <strong style="color: #ffffff; text-decoration: underline;">{{booking_id}}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; margin-bottom: 4px;">Primary Guest</div>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a;">{{guest_name}}</div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Booking ID</div>
                    <div style="font-size: 16px; font-weight: 800; font-family: monospace; color: #0f766e;">{{booking_id}}</div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">📅 Check-In Date</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">{{check_in_date}}</div>
                    <div style="font-size: 12px; color: #0d9488; font-weight: 600; margin-top: 4px;">From 2:00 PM</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">📅 Check-Out Date</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">{{check_out_date}}</div>
                    <div style="font-size: 12px; color: #e11d48; font-weight: 600; margin-top: 4px;">Until 11:00 AM</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">🏨 Accommodation Details</span>
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 8px 20px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 40%;">Room Type</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">{{room_type}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Assigned Room(s)</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f766e;">{{room_number}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Booking Category</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">{{booking_type}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0 0; font-size: 13px; color: #64748b;">Party Size</td>
                    <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: 600; color: #334155;">{{guests}}</td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.08em;">Advance Received</div>
                    <div style="font-size: 24px; font-weight: 800; color: #15803d; margin-top: 6px;">₹{{advance_amount}}</div>
                    <div style="font-size: 12px; color: #166534; margin-top: 2px;">Receipt Confirmed</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Total Booking Value</div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 6px;">₹{{total_amount}}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Inc. Applicable Taxes</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 22px; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">✦ Included In Your Stay</div>
                <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">Complimentary high-speed Wi-Fi throughout the resort, access to the scenic Infinity Pool, and morning breakfast at The Palm Restaurant.</p>
                <div style="background-color: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #f8fafc;">
                  🛎️ <strong>Need Assistance?</strong> Call Concierge: <a href="tel:+919061554545" style="color: #38bdf8; font-weight: 700; text-decoration: none;">+91 90615 54545</a>
                </div>
              </div>

              <div style="margin-top: 26px; text-align: center;">
                <a href="https://www.avevistaresorts.com" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Get Directions to Ave Vista
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Concierge: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Generated via Ave Vista PMS</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 3. CHECK-IN CONFIRMATION
(
  'checkin-confirmation',
  'Welcome to Ave Vista Resort',
  'Welcome! Your Stay is Ready - Room {{room_number}} - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #10b981 0%, #0d9488 50%, #0284c7 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #0f766e 65%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);">
                      ✦ Checked In
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #a7f3d0; letter-spacing: 0.08em; text-transform: uppercase;">
                  Welcome to Paradise
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Your Room is Ready!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Check-in formalities are complete. Please find below your in-room stay details, Wi-Fi access, and dining timings.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; margin-bottom: 4px;">Checked-In Guest</div>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a;">{{guest_name}}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                      Booking Reference: <span style="font-family: monospace; font-weight: 700; color: #0f766e;">{{booking_id}}</span>
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; padding: 12px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Assigned</div>
                      <div style="font-size: 20px; font-weight: 800; margin-top: 2px;">{{room_number}}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 38%;">Room Category</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">{{room_type}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Scheduled Check-Out</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #e11d48;">{{check_out_date}} by 11:00 AM</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #64748b;">Front Desk & Concierge</td>
                    <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #0f766e;">Dial ''9'' from In-Room Phone</td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.08em;">📶 High-Speed Wi-Fi</div>
                    <div style="font-size: 16px; font-weight: 800; color: #0c4a6e; margin-top: 6px;">avevista_guest</div>
                    <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">Password: Open Access</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid #fef08a; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.08em;">🍽️ The Palm Dining</div>
                    <div style="font-size: 15px; font-weight: 800; color: #713f12; margin-top: 6px;">Breakfast: 7:30 - 10:30 AM</div>
                    <div style="font-size: 12px; color: #a16207; margin-top: 4px;">Dinner Until 10:30 PM</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 22px; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">✦ Resort Amenities</div>
                <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  • <strong>Infinity Pool:</strong> 7:00 AM – 7:00 PM<br/>
                  • <strong>In-Room Dining:</strong> Dial ''102'' for Room Service<br/>
                  • <strong>Housekeeping:</strong> Daily service or upon request via front desk
                </p>
                <div style="background-color: rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #94a3b8;">
                  Please feel free to reach out to our team for any assistance during your stay.
                </div>
              </div>

              <div style="margin-top: 26px; text-align: center;">
                <a href="https://www.avevistaresorts.com" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  View Resort Dining Menu
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Front Desk: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • In-House Guest Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 4. INVOICE EMAIL
(
  'invoice-email',
  'Your Invoice from Ave Vista Resort',
  'Invoice #{{invoice_number}} - {{guest_name}} - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 660px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #0f766e 50%, #0284c7 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #091e3a 0%, #0f766e 70%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);">
                      ✦ Tax Invoice
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">Folio & Billing Statement</span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Invoice #{{invoice_number}}
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 500px;">
                  Thank you for staying with us. Below is the itemized summary of your stay charges, taxes, and payment confirmation.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); overflow: hidden;">
                <tr>
                  <td width="58%" style="padding: 22px; vertical-align: top; border-right: 1px solid #f1f5f9;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">Billed To</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">{{guest_name}}</div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                      {{company_name}}<br/>
                      {{address}}<br/>
                      <span style="color: #64748b;">GSTIN:</span> <strong style="font-family: monospace; color: #0f172a;">{{gst_number}}</strong>
                    </div>
                  </td>
                  <td width="42%" style="padding: 22px; vertical-align: top; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">Invoice Date</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">{{invoice_date}}</div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">Booking ID</div>
                    <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #0f766e; margin-bottom: 12px;">{{booking_id}}</div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">Payment Mode</div>
                    <div style="font-size: 13px; font-weight: 700; color: #334155;">{{payment_mode}} ({{payment_status}})</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Stay & Tariff Breakdown</span>
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 6px 20px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; width: 40%;">Accommodation</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">{{room_type}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Stay Duration</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #334155;">{{check_in_date}} to {{check_out_date}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Room Tariff Rate</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">₹{{room_rate}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Extra Occupancy</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">{{extra_pax}} Pax @ ₹{{extra_pax_rate}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">Guest Contact</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">{{email}} • {{phone}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #64748b;">Payment Status</td>
                    <td style="padding: 10px 0 0 0; font-size: 13px; font-weight: 700; color: #059669;">{{payment_status}}</td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="23%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total</div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px;">₹{{total_amount}}</div>
                  </td>
                  <td width="2%">&nbsp;</td>
                  <td width="23%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">GST</div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px;">₹{{gst_amount}}</div>
                  </td>
                  <td width="2%">&nbsp;</td>
                  <td width="23%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">Paid</div>
                    <div style="font-size: 17px; font-weight: 800; color: #15803d; margin-top: 4px;">₹{{paid_amount}}</div>
                  </td>
                  <td width="2%">&nbsp;</td>
                  <td width="23%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Balance Due</div>
                    <div style="font-size: 17px; font-weight: 800; color: #dc2626; margin-top: 4px;">₹{{balance_due}}</div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 20px; color: #ffffff;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                      📎 Official PDF Tax Invoice Attached
                    </div>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                      A digitally generated, GST-compliant PDF copy of this invoice has been attached to this email for your accounting and reimbursement records.
                    </p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px; text-align: center;">
                <a href="mailto:avevistaresort@gmail.com?subject=Query%20Regarding%20Invoice%20{{invoice_number}}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Billing Inquiries & Support
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Accounts: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Invoice Number: {{invoice_number}} • Tax Document</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 5. ADMIN ALERT
(
  'admin-alert',
  'New System Alert',
  '[Admin] {{event_type}} - {{booking_id}} - Ave Vista PMS',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Notification - Ave Vista PMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b1120; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid #334155;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #f59e0b 0%, #3b82f6 50%, #6366f1 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #1e3a8a 100%); padding: 36px 36px 44px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 8px 14px;">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista PMS" style="height: 36px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);">
                      ⚡ Operational Alert
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px;">
                <span style="font-size: 12px; font-weight: 700; color: #93c5fd; letter-spacing: 0.08em; text-transform: uppercase;">Front Desk & Management Dispatch</span>
                <h1 style="margin: 8px 0 6px 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  {{event_type}}
                </h1>
                <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Booking Ref: <strong style="color: #60a5fa; font-family: monospace;">{{booking_id}}</strong> • {{timestamp}}
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; padding: 18px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Event Details & Summary</div>
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #f8fafc;">{{description}}</p>
              </div>

              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; overflow: hidden; margin-bottom: 24px;">
                <div style="background-color: #1e293b; padding: 12px 18px; border-bottom: 1px solid #334155;">
                  <span style="font-size: 12px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">Stay Metadata</span>
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 4px 18px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8; width: 40%;">Primary Guest</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 700; color: #f8fafc;">{{guest_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">Allocated Room</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 700; color: #38bdf8;">{{room_number}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">Channel / Source</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; color: #e2e8f0;">{{booking_type}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #94a3b8;">Financial Total</td>
                    <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: 800; color: #10b981;">₹{{total_amount}}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="{{dashboard_link}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  Open in Ave Vista PMS
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0b1120; color: #64748b; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; line-height: 1.6;">Automated Internal Staff Alert • Ave Vista Property Management System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 6. [NEW] CHECKIN REMINDER
(
  'checkin-reminder',
  'Upcoming Stay Reminder',
  'Upcoming Stay Reminder: We look forward to hosting you, {{guest_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Stay is Approaching - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0284c7 0%, #0d9488 50%, #d97706 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #082f49 0%, #0369a1 60%, #0f766e 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;">
                      ✦ Pre-Arrival Guide
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #bae6fd; letter-spacing: 0.08em; text-transform: uppercase;">Countdown to Serenity</span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  We are Preparing for Your Arrival!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Hello {{guest_name}}, our resort team is getting your room ready for your stay on <strong>{{check_in_date}}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0284c7; margin-bottom: 4px;">Reservation Reference</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">{{booking_id}} • {{room_type}}</div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 14px; font-weight: 700; color: #0284c7; background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 6px 14px; border-radius: 8px;">
                      {{room_number}}
                    </span>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Check-In Time</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">2:00 PM Onwards</div>
                    <div style="font-size: 12px; color: #0284c7; margin-top: 2px;">{{check_in_date}}</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Check-Out Time</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">11:00 AM</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">{{check_out_date}}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;">📋 Pre-Arrival Checklist</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding-bottom: 12px; font-size: 13px; color: #334155; line-height: 1.6;">🪪 <strong>Government ID:</strong> Please present a valid original photo ID for all adult guests upon arrival.</td></tr>
                  <tr><td style="padding-bottom: 12px; font-size: 13px; color: #334155; line-height: 1.6;">🚗 <strong>Parking & Valet:</strong> Complimentary secure parking is available on-premise.</td></tr>
                  <tr><td style="font-size: 13px; color: #334155; line-height: 1.6;">🍽️ <strong>Dining Reservations:</strong> Traveling late? Let us know in advance so our kitchen can prepare dinner.</td></tr>
                </table>
              </div>

              <div style="margin-top: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 16px; border: 1px solid #bbf7d0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">📍 How to Reach Ave Vista Resort</div>
                <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #166534;">Located in peaceful Balapuram, near Alakode in Kannur district. Smooth scenic hill roads lead directly to our gate.</p>
                <div style="font-size: 12px; font-weight: 700; color: #047857;">Need directions en-route? Call our front desk at +91 90615 54545.</div>
              </div>

              <div style="margin-top: 26px; text-align: center;">
                <a href="https://www.avevistaresorts.com" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                  Get Google Maps Directions
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Concierge: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Automated Pre-Arrival Service</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 7. [NEW] CHECKOUT FAREWELL & FEEDBACK
(
  'checkout-thankyou',
  'Farewell & Thank You',
  'Thank You for Staying with Us, {{guest_name}}! - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #ec4899 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f766e 65%, #d97706 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;">
                      ✦ Guest Farewell
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">It was an Honor Hosting You</span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Thank You, {{guest_name}}!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  We hope your time in {{room_number}} was relaxing and full of memorable moments amidst the hills of Kannur.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706; margin-bottom: 6px;">Safe Travels Ahead</div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569;">
                      Our entire team at Ave Vista Resort truly appreciates having you with us. As our valued guest, we want to ensure every aspect of your stay was nothing short of perfection.
                    </p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; border: 1px solid #fde68a; padding: 24px; text-align: center;">
                <div style="font-size: 26px; margin-bottom: 8px;">⭐⭐⭐⭐⭐</div>
                <div style="font-size: 16px; font-weight: 800; color: #92400e; margin-bottom: 6px;">How Was Your Experience?</div>
                <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #b45309; max-width: 440px; margin-left: auto; margin-right: auto;">
                  Your feedback shapes our hospitality. Would you take a moment to share a few words about your stay?
                </p>
                <a href="https://www.avevistaresorts.com" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);">
                  Share Your Feedback
                </a>
              </div>

              <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">✦ Returning Guest Privilege</div>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                  Planning your next visit to Ave Vista? Book directly with our reservations team at +91 90615 54545 and mention Booking Reference <strong style="color: #0f766e;">{{booking_id}}</strong> for complimentary room upgrades upon availability.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Front Desk: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Hospitality Follow-up</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 8. [NEW] BOOKING CANCELLATION
(
  'booking-cancellation',
  'Booking Cancellation Notice',
  'Booking Cancellation Notice: {{booking_id}} - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cancellation Notice - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #ef4444 0%, #f97316 50%, #d97706 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #3f3f46 65%, #71717a 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);">
                      Cancelled
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #fca5a5; letter-spacing: 0.08em; text-transform: uppercase;">Reservation Update</span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Cancellation Confirmation
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Hello {{guest_name}}, this confirms that your booking <strong style="color: #ffffff;">{{booking_id}}</strong> has been cancelled as requested.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">Guest Name</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">{{guest_name}}</div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Booking ID</div>
                    <div style="font-size: 16px; font-weight: 800; font-family: monospace; color: #dc2626;">{{booking_id}}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 40%;">Reason Recorded</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">{{cancellation_reason}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Previous Room Reserved</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">{{room_number}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Original Booking Value</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">₹{{total_amount}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #64748b;">Refund Processed / Due</td>
                    <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: 800; color: #15803d;">₹{{refund_amount}}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 20px; background-color: #fff7ed; border-radius: 14px; border: 1px solid #fed7aa; padding: 18px;">
                <div style="font-size: 12px; font-weight: 800; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">💳 Refund Timeline</div>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #7c2d12;">
                  Any applicable refund amount will be credited back to your original source of payment within 5 to 7 banking working days in accordance with Ave Vista cancellation policy.
                </p>
              </div>

              <div style="margin-top: 26px; text-align: center;">
                <a href="mailto:avevistaresort@gmail.com?subject=Query%20Regarding%20Cancellation%20{{booking_id}}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em;">
                  Contact Reservations Team
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Support: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Official Cancellation Folio</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
),

-- 9. [NEW] RESTAURANT DINING & POS BILL
(
  'restaurant-bill',
  'The Palm Dining & POS Bill',
  'Dining Bill #{{bill_number}} - The Palm Restaurant - Ave Vista Resort',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dining Bill - The Palm Restaurant</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #10b981 50%, #064e3b 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #78350f 65%, #0f766e 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);">
                      🍽️ Dining POS Bill
                    </span>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 26px;">
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">The Palm Restaurant & Room Dining</span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Dining Receipt #{{bill_number}}
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Thank you for dining with us. Here is the receipt for your culinary experience at Ave Vista.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706; margin-bottom: 4px;">Guest / Room</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">{{guest_name}}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Location: <strong style="color: #0f766e;">{{room_number}}</strong></div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Bill Date</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">{{order_date}}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">🍴 Items Ordered</div>
                <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 14px 16px; font-size: 14px; line-height: 1.7; color: #334155;">
                  {{items_summary}}
                </div>
              </div>

              <div style="margin-top: 18px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Subtotal</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">₹{{subtotal}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Taxes (GST 5%)</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">₹{{tax_amount}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: 800; color: #0f172a;">Grand Total</td>
                    <td style="padding: 12px 0 0 0; font-size: 20px; font-weight: 800; color: #0f766e; text-align: right;">₹{{total_amount}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 8px; font-size: 12px; font-weight: 600; color: #059669; text-align: right;">Payment Settlement: {{payment_mode}}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 20px; color: #ffffff; text-align: center;">
                <div style="font-size: 13px; font-weight: 800; color: #fde68a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">The Palm Restaurant • Ave Vista Resort</div>
                <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Open Daily 7:30 AM to 10:30 PM • Dial ''102'' for In-Room Dining Service</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">AVE VISTA RESORTS & HOTELS</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">📍 Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">📞 Restaurant: +91 90615 54545 &nbsp;|&nbsp; ✉️ avevistaresort@gmail.com</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">© 2026 Ave Vista Resorts. POS Bill Ref: {{bill_number}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
)

on conflict (slug) do update set
  name = excluded.name,
  subject_template = excluded.subject_template,
  body_html = excluded.body_html,
  updated_at = timezone('utc'::text, now());
