/**
 * Ave Vista Resorts & Hotels - Modern Email Templates Repository
 * 
 * Includes all redesigned core templates and new hospitality templates.
 * Designed with a luxury hospitality design system:
 * - Mobile-first responsive layouts compatible with Gmail, Apple Mail, Outlook
 * - Brand palette: Deep Emerald Teal (#064e3b / #0f766e), Gold Accents (#d97706), Dark Slate (#0f172a)
 * - Clean metric cards, status badges, stay summaries, and detailed folios
 */

export interface EmailTemplateDefinition {
    slug: string;
    name: string;
    category: 'Guest Stays' | 'Billing & Dining' | 'Operations';
    description: string;
    subject_template: string;
    body_html: string;
    available_variables: string[];
    dummy_data: Record<string, string>;
}

// Brand Assets
const RESORT_LOGO_URL = "https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png";
const RESORT_WEBSITE = "https://www.avevistaresorts.com";
const RESORT_PHONE_1 = "+91 90615 54545";
const RESORT_PHONE_2 = "+91 94465 95722";
const RESORT_EMAIL = "avevistaresort@gmail.com";
const RESORT_LOCATION = "Balapuram, Vayattuparamba (Near Alakode), Kannur, Kerala - 670582";

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
    // =========================================================================
    // 1. GUEST WELCOME & CLUB PROFILE
    // =========================================================================
    {
        slug: 'guest-welcome',
        name: 'Welcome to Ave Vista Resort',
        category: 'Guest Stays',
        description: 'Sent when a new guest profile or account is created in the PMS.',
        subject_template: 'Welcome to Ave Vista Resort, {{first_name}} {{last_name}}!',
        available_variables: [
            '{{first_name}}', '{{last_name}}', '{{email}}', '{{phone}}',
            '{{company_name}}', '{{gst_number}}', '{{address}}'
        ],
        dummy_data: {
            first_name: 'Rahul',
            last_name: 'Menon',
            email: 'rahul.menon@example.com',
            phone: '+91 98470 12345',
            company_name: 'Menon & Associates',
            gst_number: '32AABCM1234F1Z8',
            address: 'Hill View Residency, Kakanad, Kochi, Kerala - 682030'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #0d9488 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #042f2e 0%, #0f766e 65%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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

          <!-- Overlapping Main Content Card -->
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

              <!-- Profile Details Card -->
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

              <!-- Resort Perks Highlight Banner -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 16px; border: 1px solid #bbf7d0; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
                      ✦ Your Guest Privileges
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding: 6px 8px 6px 0; font-size: 13px; color: #166534;">
                          ✓ Express Front Desk Check-in
                        </td>
                        <td width="50%" style="padding: 6px 0 6px 8px; font-size: 13px; color: #166534;">
                          ✓ High-Speed Resort-wide Wi-Fi
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 8px 6px 0; font-size: 13px; color: #166534;">
                          ✓ The Palm Dining Reservations
                        </td>
                        <td style="padding: 6px 0 6px 8px; font-size: 13px; color: #166534;">
                          ✓ Digital Folio & Tax Invoicing
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <div style="margin-top: 28px; text-align: center;">
                <a href="${RESORT_WEBSITE}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Explore Resort & Amenities
                </a>
              </div>
            </td>
          </tr>

          <!-- Elegant Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Concierge: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. All rights reserved. • This communication was dispatched by the Ave Vista PMS system.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 2. BOOKING CONFIRMATION
    // =========================================================================
    {
        slug: 'booking-confirmation',
        name: 'Booking Confirmation',
        category: 'Guest Stays',
        description: 'Sent automatically to the guest when a new booking is created or confirmed.',
        subject_template: 'Booking Confirmed: {{booking_id}} - {{booking_type}} - Ave Vista Resort',
        available_variables: [
            '{{booking_id}}', '{{booking_type}}', '{{guest_name}}', '{{room_number}}',
            '{{room_type}}', '{{check_in_date}}', '{{check_out_date}}', '{{guests}}',
            '{{total_amount}}', '{{advance_amount}}'
        ],
        dummy_data: {
            booking_id: 'AVBK-1042',
            booking_type: 'Standard Stay',
            guest_name: 'Ananya Sharma',
            room_number: 'Room 204',
            room_type: 'Luxury Pool Villa Suite',
            check_in_date: '2026-03-20',
            check_out_date: '2026-03-24',
            guests: '2 Adults, 1 Child',
            total_amount: '18,500',
            advance_amount: '5,000'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #10b981 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #022c22 0%, #0f766e 70%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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

          <!-- Overlapping Main Content Card -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Floating Guest Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; margin-bottom: 4px;">
                      Primary Guest
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a;">
                      {{guest_name}}
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="text-align: right;">
                      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Booking ID</div>
                      <div style="font-size: 16px; font-weight: 800; font-family: monospace; color: #0f766e;">{{booking_id}}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Stay Itinerary Timeline Tiles -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                      📅 Check-In Date
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
                      {{check_in_date}}
                    </div>
                    <div style="font-size: 12px; color: #0d9488; font-weight: 600; margin-top: 4px;">From 2:00 PM</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                      📅 Check-Out Date
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
                      {{check_out_date}}
                    </div>
                    <div style="font-size: 12px; color: #e11d48; font-weight: 600; margin-top: 4px;">Until 11:00 AM</div>
                  </td>
                </tr>
              </table>

              <!-- Booking Specifics Table -->
              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                    🏨 Accommodation Details
                  </span>
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

              <!-- Payment Breakdown Cards -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.08em;">
                      Advance Received
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #15803d; margin-top: 6px;">
                      ₹{{advance_amount}}
                    </div>
                    <div style="font-size: 12px; color: #166534; margin-top: 2px;">Receipt Confirmed</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">
                      Total Booking Value
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 6px;">
                      ₹{{total_amount}}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Inc. Applicable Taxes</div>
                  </td>
                </tr>
              </table>

              <!-- Guest Experience Perks -->
              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 22px; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
                  ✦ Included In Your Stay
                </div>
                <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  Complimentary high-speed Wi-Fi throughout the resort, access to the scenic Infinity Pool, and morning breakfast at The Palm Restaurant.
                </p>
                <div style="background-color: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #f8fafc;">
                  🛎️ <strong>Need Airport Transfer or Special Requests?</strong> Contact our concierge at <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; font-weight: 700; text-decoration: none;">${RESORT_PHONE_1}</a>.
                </div>
              </div>

              <!-- Action Link -->
              <div style="margin-top: 26px; text-align: center;">
                <a href="${RESORT_WEBSITE}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Get Directions to Ave Vista
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Concierge: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Booking ID: {{booking_id}}. • Generated via Ave Vista PMS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 3. CHECK-IN CONFIRMATION & STAY KEY GUIDE
    // =========================================================================
    {
        slug: 'checkin-confirmation',
        name: 'Welcome to Ave Vista Resort',
        category: 'Guest Stays',
        description: 'Sent upon successful physical check-in at the front desk with stay guide and Wi-Fi credentials.',
        subject_template: 'Welcome! Your Stay is Ready - Room {{room_number}} - Ave Vista Resort',
        available_variables: [
            '{{booking_id}}', '{{guest_name}}', '{{room_number}}', '{{room_type}}',
            '{{check_out_date}}'
        ],
        dummy_data: {
            booking_id: 'AVBK-1042',
            guest_name: 'Ananya Sharma',
            room_number: 'Room 204',
            room_type: 'Luxury Pool Villa Suite',
            check_out_date: '2026-03-24'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #10b981 0%, #0d9488 50%, #0284c7 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #0f766e 65%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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

          <!-- Overlapping Main Content Card -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Key Room Allocation Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; margin-bottom: 4px;">
                      Checked-In Guest
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a;">
                      {{guest_name}}
                    </div>
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

              <!-- Stay Snapshot Details -->
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
                    <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #0f766e;">Dial '9' from In-Room Phone</td>
                  </tr>
                </table>
              </div>

              <!-- Wi-Fi Credentials & Dining Timings -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.08em;">
                      📶 High-Speed Wi-Fi
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #0c4a6e; margin-top: 6px;">
                      avevista_guest
                    </div>
                    <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">Password: Not Required (Open Portal)</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid #fef08a; border-radius: 14px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.08em;">
                      🍽️ The Palm Dining
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #713f12; margin-top: 6px;">
                      Breakfast: 7:30 - 10:30 AM
                    </div>
                    <div style="font-size: 12px; color: #a16207; margin-top: 4px;">Lunch & Dinner Until 10:30 PM</div>
                  </td>
                </tr>
              </table>

              <!-- In-Room Services Banner -->
              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 22px; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
                  ✦ Resort Amenities at a Glance
                </div>
                <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  • <strong>Infinity Pool:</strong> 7:00 AM – 7:00 PM (Towels available poolside)<br/>
                  • <strong>In-Room Dining:</strong> Dial '102' for 24/7 Room Service<br/>
                  • <strong>Housekeeping:</strong> Daily service or upon request via front desk
                </p>
                <div style="background-color: rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #94a3b8;">
                  Please feel free to reach out to our team for any assistance during your stay.
                </div>
              </div>

              <!-- Button -->
              <div style="margin-top: 26px; text-align: center;">
                <a href="${RESORT_WEBSITE}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  View Resort Dining Menu
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Front Desk: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • In-House Guest Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 4. INVOICE EMAIL & TAX RECEIPT
    // =========================================================================
    {
        slug: 'invoice-email',
        name: 'Your Invoice from Ave Vista Resort',
        category: 'Billing & Dining',
        description: 'Sent to the guest with complete tax invoice breakdown and PDF invoice attachment.',
        subject_template: 'Invoice #{{invoice_number}} - {{guest_name}} - Ave Vista Resort',
        available_variables: [
            '{{invoice_number}}', '{{invoice_date}}', '{{guest_name}}', '{{company_name}}',
            '{{address}}', '{{gst_number}}', '{{booking_id}}', '{{booking_type}}',
            '{{room_number}}', '{{room_type}}', '{{check_in_date}}', '{{check_out_date}}',
            '{{email}}', '{{phone}}', '{{room_rate}}', '{{extra_pax}}', '{{extra_pax_rate}}',
            '{{payment_mode}}', '{{payment_status}}', '{{total_amount}}', '{{gst_amount}}',
            '{{paid_amount}}', '{{balance_due}}'
        ],
        dummy_data: {
            invoice_number: 'AV-INV-2026-088',
            invoice_date: '2026-03-24',
            guest_name: 'Ananya Sharma',
            company_name: 'Starlight Media Pvt Ltd',
            address: '14/B, Lavelle Road, Bangalore, Karnataka - 560001',
            gst_number: '29AAECS9876Q1ZG',
            booking_id: 'AVBK-1042',
            booking_type: 'Standard Stay',
            room_number: 'Room 204',
            room_type: 'Luxury Pool Villa Suite',
            check_in_date: '2026-03-20',
            check_out_date: '2026-03-24',
            email: 'ananya.sharma@example.com',
            phone: '+91 98450 67890',
            room_rate: '4,500 / night',
            extra_pax: '1',
            extra_pax_rate: '500',
            payment_mode: 'UPI / Card',
            payment_status: 'Fully Paid',
            total_amount: '18,500',
            gst_amount: '2,220',
            paid_amount: '18,500',
            balance_due: '0'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 660px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #0f766e 50%, #0284c7 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091e3a 0%, #0f766e 70%, #0284c7 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">
                  Folio & Billing Statement
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Invoice #{{invoice_number}}
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 500px;">
                  Thank you for staying with us. Below is the itemized summary of your stay charges, taxes, and payment confirmation.
                </p>
              </div>
            </td>
          </tr>

          <!-- Overlapping Main Content Card -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Billed To & Invoice Metadata Split Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); overflow: hidden;">
                <tr>
                  <td width="58%" style="padding: 22px; vertical-align: top; border-right: 1px solid #f1f5f9;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">
                      Billed To
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
                      {{guest_name}}
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                      {{company_name}}<br/>
                      {{address}}<br/>
                      <span style="color: #64748b;">GSTIN:</span> <strong style="font-family: monospace; color: #0f172a;">{{gst_number}}</strong>
                    </div>
                  </td>
                  <td width="42%" style="padding: 22px; vertical-align: top; background-color: #f8fafc;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">
                      Invoice Date
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
                      {{invoice_date}}
                    </div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">
                      Booking ID
                    </div>
                    <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #0f766e; margin-bottom: 12px;">
                      {{booking_id}}
                    </div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">
                      Payment Mode
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #334155;">
                      {{payment_mode}} ({{payment_status}})
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Detailed Stay & Billing Table -->
              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                    Stay & Tariff Breakdown
                  </span>
                  <span style="font-size: 12px; font-weight: 600; color: #0284c7;">
                    {{room_number}}
                  </span>
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
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">{{email}} &bull; {{phone}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 0 0; font-size: 13px; color: #64748b;">Payment Status</td>
                    <td style="padding: 10px 0 0 0; font-size: 13px; font-weight: 700; color: #059669;">{{payment_status}}</td>
                  </tr>
                </table>
              </div>

              <!-- Grand Totals 4-Column Grid -->
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

              <!-- Attachment Notification Card -->
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

              <!-- Questions Button -->
              <div style="margin-top: 26px; text-align: center;">
                <a href="mailto:${RESORT_EMAIL}?subject=Query%20Regarding%20Invoice%20{{invoice_number}}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);">
                  Billing Inquiries & Support
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Accounts: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Invoice Number: {{invoice_number}} • Tax Document
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 5. ADMIN ALERT & OPERATIONAL NOTIFICATION
    // =========================================================================
    {
        slug: 'admin-alert',
        name: 'New System Alert',
        category: 'Operations',
        description: 'Sent to resort managers and front-desk staff when system events, new reservations, or cancellations occur.',
        subject_template: '[Admin] {{event_type}} - {{booking_id}} - Ave Vista PMS',
        available_variables: [
            '{{event_type}}', '{{booking_id}}', '{{guest_name}}', '{{room_number}}',
            '{{booking_type}}', '{{total_amount}}', '{{timestamp}}', '{{description}}',
            '{{dashboard_link}}'
        ],
        dummy_data: {
            event_type: 'New Reservation Created',
            booking_id: 'AVBK-1042',
            guest_name: 'Ananya Sharma',
            room_number: 'Room 204',
            booking_type: 'Direct PMS',
            total_amount: '18,500',
            timestamp: '2026-03-20 11:45 AM',
            description: 'New direct reservation received for 4 nights in Luxury Pool Villa Suite. Advance received: Rs. 5,000.',
            dashboard_link: '/front-desk'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Notification - Ave Vista PMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b1120; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid #334155;">
          
          <!-- Top Operational Status Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #f59e0b 0%, #3b82f6 50%, #6366f1 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #1e3a8a 100%); padding: 36px 36px 44px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 8px 14px;">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista PMS" style="height: 36px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 12px; font-weight: 700; color: #93c5fd; letter-spacing: 0.08em; text-transform: uppercase;">
                  Front Desk & Management Dispatch
                </span>
                <h1 style="margin: 8px 0 6px 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  {{event_type}}
                </h1>
                <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Booking Ref: <strong style="color: #60a5fa; font-family: monospace;">{{booking_id}}</strong> &bull; {{timestamp}}
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              
              <!-- Description Box -->
              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; padding: 18px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                  Event Details & Summary
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #f8fafc;">
                  {{description}}
                </p>
              </div>

              <!-- Property Metrics Table -->
              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; overflow: hidden; margin-bottom: 24px;">
                <div style="background-color: #1e293b; padding: 12px 18px; border-bottom: 1px solid #334155;">
                  <span style="font-size: 12px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">
                    Stay Metadata
                  </span>
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

              <!-- Action Link -->
              <div style="text-align: center;">
                <a href="{{dashboard_link}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  Open in Ave Vista PMS
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1120; color: #64748b; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; line-height: 1.6;">
                Automated Internal Staff Alert • Ave Vista Property Management System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 6. [NEW] PRE-ARRIVAL REMINDER & TRAVEL GUIDE
    // =========================================================================
    {
        slug: 'checkin-reminder',
        name: 'Upcoming Stay Reminder',
        category: 'Guest Stays',
        description: 'Sent 24-48 hours before guest arrival with check-in instructions and travel directions.',
        subject_template: 'Upcoming Stay Reminder: We look forward to hosting you, {{guest_name}}!',
        available_variables: [
            '{{guest_name}}', '{{booking_id}}', '{{room_number}}', '{{room_type}}',
            '{{check_in_date}}', '{{check_out_date}}'
        ],
        dummy_data: {
            guest_name: 'Dr. Suresh Nair',
            booking_id: 'AVBK-1055',
            room_number: 'Room 302',
            room_type: 'Valley View Premium Chalet',
            check_in_date: 'Tomorrow, March 15',
            check_out_date: 'March 18'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Stay is Approaching - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0284c7 0%, #0d9488 50%, #d97706 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #082f49 0%, #0369a1 60%, #0f766e 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 13px; font-weight: 700; color: #bae6fd; letter-spacing: 0.08em; text-transform: uppercase;">
                  Countdown to Serenity
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  We are Preparing for Your Arrival!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Hello {{guest_name}}, our resort team is getting your villa ready for your stay on <strong>{{check_in_date}}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Floating Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0284c7; margin-bottom: 4px;">
                      Reservation Reference
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">
                      {{booking_id}} &bull; {{room_type}}
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 14px; font-weight: 700; color: #0284c7; background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 6px 14px; border-radius: 8px;">
                      {{room_number}}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Timeline Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                      Check-In Time
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
                      2:00 PM Onwards
                    </div>
                    <div style="font-size: 12px; color: #0284c7; margin-top: 2px;">{{check_in_date}}</div>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                      Check-Out Time
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
                      11:00 AM
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">{{check_out_date}}</div>
                  </td>
                </tr>
              </table>

              <!-- Pre-Arrival Helpful Checklist -->
              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;">
                  📋 Pre-Arrival Checklist
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom: 12px; font-size: 13px; color: #334155; line-height: 1.6;">
                      🪪 <strong>Government ID:</strong> Please present a valid original photo ID (Aadhaar, Passport, Voter ID) for all guests upon arrival.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; font-size: 13px; color: #334155; line-height: 1.6;">
                      🚗 <strong>Parking & Valet:</strong> Complimentary secure parking is available on-premise for all resident guests.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #334155; line-height: 1.6;">
                      🍽️ <strong>Dining Reservations:</strong> Traveling late? Let us know in advance so our kitchen at The Palm can hold dinner for you.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Location Guide -->
              <div style="margin-top: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 16px; border: 1px solid #bbf7d0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                  📍 How to Reach Ave Vista Resort
                </div>
                <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #166534;">
                  Located in peaceful Balapuram, near Alakode in Kannur district. Smooth scenic hill roads lead directly to our gate.
                </p>
                <div style="font-size: 12px; font-weight: 700; color: #047857;">
                  Need directions en-route? Call our front desk at ${RESORT_PHONE_1}.
                </div>
              </div>

              <!-- Button -->
              <div style="margin-top: 26px; text-align: center;">
                <a href="${RESORT_WEBSITE}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                  Get Google Maps Directions
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Concierge: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Automated Pre-Arrival Service
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 7. [NEW] POST-STAY FAREWELL & GUEST FEEDBACK
    // =========================================================================
    {
        slug: 'checkout-thankyou',
        name: 'Farewell & Thank You',
        category: 'Guest Stays',
        description: 'Sent shortly after checkout to thank the guest and invite them to leave a review.',
        subject_template: 'Thank You for Staying with Us, {{guest_name}}! - Ave Vista Resort',
        available_variables: [
            '{{guest_name}}', '{{booking_id}}', '{{room_number}}', '{{check_out_date}}'
        ],
        dummy_data: {
            guest_name: 'Ananya Sharma',
            booking_id: 'AVBK-1042',
            room_number: 'Room 204',
            check_out_date: '2026-03-24'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #ec4899 50%, #0f766e 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f766e 65%, #d97706 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">
                  It was an Honor Hosting You
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Thank You, {{guest_name}}!
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  We hope your time in {{room_number}} was relaxing and full of memorable moments amidst the hills of Kannur.
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Floating Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706; margin-bottom: 6px;">
                      Safe Travels Ahead
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569;">
                      Our entire team at Ave Vista Resort truly appreciates having you with us. As our valued guest, we want to ensure every aspect of your stay was nothing short of perfection.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Review & Feedback Request Card -->
              <div style="margin-top: 20px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; border: 1px solid #fde68a; padding: 24px; text-align: center;">
                <div style="font-size: 26px; margin-bottom: 8px;">⭐⭐⭐⭐⭐</div>
                <div style="font-size: 16px; font-weight: 800; color: #92400e; margin-bottom: 6px;">
                  How Was Your Experience?
                </div>
                <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #b45309; max-width: 440px; margin-left: auto; margin-right: auto;">
                  Your feedback shapes our hospitality. Would you take a moment to share a few words or rating about your stay?
                </p>
                <a href="${RESORT_WEBSITE}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);">
                  Share Your Feedback
                </a>
              </div>

              <!-- Returning Guest Privilege -->
              <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                  ✦ Direct Booking Privilege for Next Visit
                </div>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                  Planning your next visit to Ave Vista? Book directly with our reservations team at <strong style="color: #0f172a;">${RESORT_PHONE_1}</strong> and mention Booking Reference <strong style="color: #0f766e;">{{booking_id}}</strong> for complimentary room upgrades upon availability.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Front Desk: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Hospitality Follow-up
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 8. [NEW] BOOKING CANCELLATION & REFUND FOLIO
    // =========================================================================
    {
        slug: 'booking-cancellation',
        name: 'Booking Cancellation Notice',
        category: 'Guest Stays',
        description: 'Sent when a reservation is cancelled, confirming status and refund details.',
        subject_template: 'Booking Cancellation Notice: {{booking_id}} - Ave Vista Resort',
        available_variables: [
            '{{guest_name}}', '{{booking_id}}', '{{room_number}}', '{{cancellation_reason}}',
            '{{refund_amount}}', '{{total_amount}}'
        ],
        dummy_data: {
            guest_name: 'Karthik Varma',
            booking_id: 'AVBK-1038',
            room_number: 'Room 105',
            cancellation_reason: 'Change in personal travel itinerary',
            refund_amount: '4,000',
            total_amount: '8,000'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cancellation Notice - Ave Vista Resort</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #ef4444 0%, #f97316 50%, #d97706 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #3f3f46 65%, #71717a 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 13px; font-weight: 700; color: #fca5a5; letter-spacing: 0.08em; text-transform: uppercase;">
                  Reservation Update
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Cancellation Confirmation
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Hello {{guest_name}}, this confirms that your booking <strong style="color: #ffffff;">{{booking_id}}</strong> has been cancelled as requested.
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Floating Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px;">
                      Guest Name
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">
                      {{guest_name}}
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Booking ID</div>
                    <div style="font-size: 16px; font-weight: 800; font-family: monospace; color: #dc2626;">{{booking_id}}</div>
                  </td>
                </tr>
              </table>

              <!-- Cancellation Specifics -->
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

              <!-- Refund Policy Note -->
              <div style="margin-top: 20px; background-color: #fff7ed; border-radius: 14px; border: 1px solid #fed7aa; padding: 18px;">
                <div style="font-size: 12px; font-weight: 800; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                  💳 Refund Timeline
                </div>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #7c2d12;">
                  Any applicable refund amount will be credited back to your original source of payment within 5 to 7 banking working days in accordance with Ave Vista cancellation policy.
                </p>
              </div>

              <!-- Rebook Notice -->
              <div style="margin-top: 26px; text-align: center;">
                <a href="mailto:${RESORT_EMAIL}?subject=Query%20Regarding%20Cancellation%20{{booking_id}}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em;">
                  Contact Reservations Team
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Support: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. Booking ID: {{booking_id}} • Official Cancellation Folio
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },

    // =========================================================================
    // 9. [NEW] RESTAURANT DINING & POS BILL RECEIPT
    // =========================================================================
    {
        slug: 'restaurant-bill',
        name: 'The Palm Dining & POS Bill',
        category: 'Billing & Dining',
        description: 'Sent when dining or room service orders are billed at The Palm Restaurant.',
        subject_template: 'Dining Bill #{{bill_number}} - The Palm Restaurant - Ave Vista Resort',
        available_variables: [
            '{{bill_number}}', '{{guest_name}}', '{{room_number}}', '{{order_date}}',
            '{{items_summary}}', '{{subtotal}}', '{{tax_amount}}', '{{total_amount}}',
            '{{payment_mode}}'
        ],
        dummy_data: {
            bill_number: 'PALM-POS-412',
            guest_name: 'Ananya Sharma',
            room_number: 'Room 204 (In-Room Dining)',
            order_date: '2026-03-21 08:30 PM',
            items_summary: '2x Kerala Karimeen Fry, 1x Appam Basket, 1x Tender Coconut Souffle, 2x Fresh Lime Soda',
            subtotal: '1,850',
            tax_amount: '92.50',
            total_amount: '1,942.50',
            payment_mode: 'Billed to Room Folio'
        },
        body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dining Bill - The Palm Restaurant</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706 0%, #10b981 50%, #064e3b 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Hero Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #78350f 65%, #0f766e 100%); padding: 36px 36px 64px 36px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img src="${RESORT_LOGO_URL}" alt="Ave Vista Resorts" style="height: 42px; width: auto; display: block; border: 0;" />
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
                <span style="font-size: 13px; font-weight: 700; color: #fde68a; letter-spacing: 0.08em; text-transform: uppercase;">
                  The Palm Restaurant & Room Dining
                </span>
                <h1 style="margin: 8px 0 10px 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em;">
                  Dining Receipt #{{bill_number}}
                </h1>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 480px;">
                  Thank you for dining with us. Here is the receipt for your culinary experience at Ave Vista.
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              
              <!-- Floating Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: -36px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706; margin-bottom: 4px;">
                      Guest / Room
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">
                      {{guest_name}}
                    </div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
                      Location: <strong style="color: #0f766e;">{{room_number}}</strong>
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Bill Date</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">{{order_date}}</div>
                  </td>
                </tr>
              </table>

              <!-- Order Summary Items Card -->
              <div style="margin-top: 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                  🍴 Items Ordered
                </div>
                <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 14px 16px; font-size: 14px; line-height: 1.7; color: #334155;">
                  {{items_summary}}
                </div>
              </div>

              <!-- Price Breakdown Table -->
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
                    <td colspan="2" style="padding-top: 8px; font-size: 12px; font-weight: 600; color: #059669; text-align: right;">
                      Payment Settlement: {{payment_mode}}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Restaurant Timings Note -->
              <div style="margin-top: 20px; background-color: #0f172a; border-radius: 16px; padding: 20px; color: #ffffff; text-align: center;">
                <div style="font-size: 13px; font-weight: 800; color: #fde68a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                  The Palm Restaurant &middot; Ave Vista Resort
                </div>
                <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                  Open Daily 7:30 AM to 10:30 PM &bull; Dial '102' for In-Room Dining Service
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 28px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 0.05em;">
                AVE VISTA RESORTS & HOTELS
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                📍 ${RESORT_LOCATION}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #cbd5e1;">
                📞 Restaurant: <a href="tel:${RESORT_PHONE_1}" style="color: #38bdf8; text-decoration: none;">${RESORT_PHONE_1}</a> &nbsp;|&nbsp; 
                ✉️ <a href="mailto:${RESORT_EMAIL}" style="color: #38bdf8; text-decoration: none;">${RESORT_EMAIL}</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px auto; max-width: 420px;"></div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 Ave Vista Resorts. POS Bill Ref: {{bill_number}}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }
];

/**
 * Helper to get template by slug with fallback
 */
export function getDefaultTemplateBySlug(slug: string): EmailTemplateDefinition | undefined {
    return DEFAULT_EMAIL_TEMPLATES.find(t => t.slug === slug);
}

/**
 * Return preview HTML with dummy data replaced
 */
export function getInterpolatedTemplateHtml(slug: string, rawHtml?: string, customDummy?: Record<string, string>): string {
    const template = getDefaultTemplateBySlug(slug);
    let html = rawHtml || template?.body_html || '';
    const dummy = customDummy || template?.dummy_data || {};

    Object.keys(dummy).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, dummy[key]);
    });

    return html;
}
