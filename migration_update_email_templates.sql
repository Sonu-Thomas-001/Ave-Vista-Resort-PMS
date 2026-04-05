update public.email_templates
set
  subject_template = 'Welcome to Ave Vista Resort, {{first_name}} {{last_name}}!',
  body_html = '<html>
    <body style="margin: 0; padding: 0; background: #eef4f8; font-family: Arial, sans-serif; color: #163047;">
      <div style="padding: 32px 16px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%); padding: 28px 40px 72px; color: #ffffff;">
            <div style="margin-bottom: 20px;"><img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 54px; width: auto; display: block; background: #ffffff; border-radius: 16px; padding: 10px 14px;" /></div>
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Guest Profile</div>
            <h1 style="margin: 18px 0 10px; font-size: 34px; line-height: 1.15;">Welcome to Ave Vista Resort</h1>
            <p style="margin: 0; font-size: 16px; line-height: 1.7; max-width: 460px; color: rgba(255, 255, 255, 0.88);">Your profile is ready and your future stays just became faster, smoother, and easier to manage.</p>
          </div>

          <div style="padding: 0 32px 32px; margin-top: -36px;">
            <div style="background: #ffffff; border: 1px solid #dbe7ef; border-radius: 22px; padding: 28px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);">
              <p style="margin: 0 0 12px; font-size: 15px; color: #4b6478;">Hello</p>
              <p style="margin: 0; font-size: 28px; font-weight: 700; color: #102a43;">{{first_name}} {{last_name}}</p>
              <p style="margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: #48627a;">Thank you for registering with Ave Vista Resort. We are delighted to have you with us and your guest details are now available for faster bookings and smoother check-ins.</p>
            </div>

            <div style="margin-top: 22px; background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; color: #102a43;">Profile Summary</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91; width: 42%;">Guest Name</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; font-weight: 700; color: #102a43;">{{first_name}} {{last_name}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{email}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{phone}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Company</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{company_name}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">GST Number</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{gst_number}}</td></tr>
                <tr><td style="padding: 12px 0 0; font-size: 13px; color: #6b7f91;">Address</td><td style="padding: 12px 0 0; font-size: 14px; color: #102a43;">{{address}}</td></tr>
              </table>
            </div>

            <div style="margin-top: 22px; background: linear-gradient(180deg, #f0f9ff 0%, #f8fffe 100%); border: 1px solid #cde9e7; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #102a43;">What Happens Next</h2>
              <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #48627a;">You can now book stays faster, receive smoother billing communication, and keep all your guest details ready for your next visit.</p>
            </div>

            <div style="margin-top: 24px; text-align: center;"><a href="mailto:avevistaresort@gmail.com" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-size: 14px; font-weight: 700;">Contact Ave Vista</a></div>
          </div>

          <div style="padding: 20px 32px 30px; background: #f8fbfd; border-top: 1px solid #e2edf3; text-align: center;"><p style="margin: 0; font-size: 12px; line-height: 1.7; color: #6b7f91;">&#x1F4CD; Balapuram, Vayattuparamba (Near Alakode)<br/>&#x1F4DE; 90615 54545 | 9446595722<br/>&#x1F310; www.avevistaresorts.com</p></div>
        </div>
      </div>
    </body>
  </html>',
  updated_at = timezone('utc'::text, now())
where slug = 'guest-welcome';

update public.email_templates
set
  subject_template = 'Booking Confirmed: {{booking_id}} - {{booking_type}} - Ave Vista Resort',
  body_html = '<html>
    <body style="margin: 0; padding: 0; background: #eef4f8; font-family: Arial, sans-serif; color: #163047;">
      <div style="padding: 32px 16px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%); padding: 28px 40px 72px; color: #ffffff;">
            <div style="margin-bottom: 20px;"><img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 54px; width: auto; display: block; background: #ffffff; border-radius: 16px; padding: 10px 14px;" /></div>
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Booking Confirmed</div>
            <h1 style="margin: 18px 0 10px; font-size: 34px; line-height: 1.15;">Your stay is locked in</h1>
            <p style="margin: 0; font-size: 16px; line-height: 1.7; max-width: 470px; color: rgba(255, 255, 255, 0.88);">We have reserved your stay at Ave Vista Resort. Here is a clean summary of your confirmed booking.</p>
          </div>

          <div style="padding: 0 32px 32px; margin-top: -36px;">
            <div style="background: #ffffff; border: 1px solid #dbe7ef; border-radius: 22px; padding: 28px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);">
              <p style="margin: 0 0 12px; font-size: 15px; color: #4b6478;">Guest</p>
              <p style="margin: 0; font-size: 28px; font-weight: 700; color: #102a43;">{{guest_name}}</p>
              <p style="margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: #48627a;">Thank you for choosing Ave Vista Resort. Your booking has been confirmed and is ready for arrival planning.</p>
            </div>

            <div style="margin-top: 22px; background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; color: #102a43;">Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91; width: 42%;">Booking ID</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; font-weight: 700; color: #102a43;">{{booking_id}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Booking Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{booking_type}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Number(s)</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_number}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_type}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Check-in</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{check_in_date}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Check-out</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{check_out_date}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Guests</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{guests}}</td></tr>
                <tr><td style="padding: 12px 0; font-size: 13px; color: #6b7f91;">Total Amount</td><td style="padding: 12px 0; font-size: 18px; font-weight: 700; color: #0f766e;">Rs. {{total_amount}}</td></tr>
              </table>
            </div>

            <div style="margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 20px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">Advance Received</p><p style="margin: 0; font-size: 24px; font-weight: 700; color: #102a43;">Rs. {{advance_amount}}</p></div>
              <div style="background: linear-gradient(180deg, #f0f9ff 0%, #f8fffe 100%); border: 1px solid #cde9e7; border-radius: 22px; padding: 20px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">Travel Note</p><p style="margin: 0; font-size: 14px; line-height: 1.8; color: #48627a;">If you selected multiple rooms, all room numbers above belong to the same booking group.</p></div>
            </div>

            <div style="margin-top: 22px; background: #102a43; color: #ffffff; border-radius: 22px; padding: 22px;"><p style="margin: 0 0 6px; font-size: 15px; font-weight: 700;">Need help before arrival?</p><p style="margin: 0; font-size: 14px; line-height: 1.8; color: rgba(255, 255, 255, 0.84);">Contact Ave Vista Resort at +91 90615 54545 or reply to this email for assistance with your stay.</p></div>
          </div>

          <div style="padding: 20px 32px 30px; background: #f8fbfd; border-top: 1px solid #e2edf3; text-align: center;"><p style="margin: 0; font-size: 12px; line-height: 1.7; color: #6b7f91;">&#x1F4CD; Balapuram, Vayattuparamba (Near Alakode)<br/>&#x1F4DE; 90615 54545 | 9446595722<br/>&#x1F310; www.avevistaresorts.com</p></div>
        </div>
      </div>
    </body>
  </html>',
  updated_at = timezone('utc'::text, now())
where slug = 'booking-confirmation';

update public.email_templates
set
  subject_template = 'Welcome! Your Stay is Ready - Ave Vista Resort',
  body_html = '<html>
    <body style="margin: 0; padding: 0; background: #eef4f8; font-family: Arial, sans-serif; color: #163047;">
      <div style="padding: 32px 16px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%); padding: 28px 40px 72px; color: #ffffff;">
            <div style="margin-bottom: 20px;"><img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 54px; width: auto; display: block; background: #ffffff; border-radius: 16px; padding: 10px 14px;" /></div>
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Check-in Successful</div>
            <h1 style="margin: 18px 0 10px; font-size: 34px; line-height: 1.15;">Welcome to your stay</h1>
            <p style="margin: 0; font-size: 16px; line-height: 1.7; max-width: 470px; color: rgba(255, 255, 255, 0.88);">You are checked in and your room is ready. Here is everything you need for a smooth arrival.</p>
          </div>

          <div style="padding: 0 32px 32px; margin-top: -36px;">
            <div style="background: #ffffff; border: 1px solid #dbe7ef; border-radius: 22px; padding: 28px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);">
              <p style="margin: 0 0 12px; font-size: 15px; color: #4b6478;">Checked In Guest</p>
              <p style="margin: 0; font-size: 28px; font-weight: 700; color: #102a43;">{{guest_name}}</p>
              <p style="margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: #48627a;">We are glad to welcome you to Ave Vista Resort. Your room access and stay details are now active.</p>
            </div>

            <div style="margin-top: 22px; background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; color: #102a43;">Stay Snapshot</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91; width: 42%;">Booking ID</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; font-weight: 700; color: #102a43;">{{booking_id}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Number</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_number}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_type}}</td></tr>
                <tr><td style="padding: 12px 0; font-size: 13px; color: #6b7f91;">Check-out</td><td style="padding: 12px 0; font-size: 14px; color: #102a43;">{{check_out_date}}</td></tr>
              </table>
            </div>

            <div style="margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="background: linear-gradient(180deg, #f0f9ff 0%, #f8fffe 100%); border: 1px solid #cde9e7; border-radius: 22px; padding: 20px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">WiFi Access</p><p style="margin: 0; font-size: 20px; font-weight: 700; color: #102a43;">avevista_guest</p></div>
            </div>

            <div style="margin-top: 22px; background: #102a43; color: #ffffff; border-radius: 22px; padding: 22px;"><p style="margin: 0 0 6px; font-size: 15px; font-weight: 700;">Breakfast Timing</p><p style="margin: 0; font-size: 14px; line-height: 1.8; color: rgba(255, 255, 255, 0.84);">7:30 AM to 10:30 AM at The Palm Restaurant.</p></div>
          </div>

          <div style="padding: 20px 32px 30px; background: #f8fbfd; border-top: 1px solid #e2edf3; text-align: center;"><p style="margin: 0; font-size: 12px; line-height: 1.7; color: #6b7f91;">&#x1F4CD; Balapuram, Vayattuparamba (Near Alakode)<br/>&#x1F4DE; 90615 54545 | 9446595722<br/>&#x1F310; www.avevistaresorts.com</p></div>
        </div>
      </div>
    </body>
  </html>',
  updated_at = timezone('utc'::text, now())
where slug = 'checkin-confirmation';

update public.email_templates
set
  subject_template = 'Invoice #{{invoice_number}} - {{guest_name}} - Ave Vista Resort',
  body_html = '<html>
    <body style="margin: 0; padding: 0; background: #eef4f8; font-family: Arial, sans-serif; color: #163047;">
      <div style="padding: 32px 16px;">
        <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%); padding: 28px 40px 76px; color: #ffffff;">
            <div style="margin-bottom: 20px;"><img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 54px; width: auto; display: block; background: #ffffff; border-radius: 16px; padding: 10px 14px;" /></div>
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Tax Invoice</div>
            <h1 style="margin: 18px 0 10px; font-size: 34px; line-height: 1.15;">Your billing summary</h1>
            <p style="margin: 0; font-size: 16px; line-height: 1.7; max-width: 500px; color: rgba(255, 255, 255, 0.88);">A polished copy of your invoice is attached. Here is a quick breakdown of the stay and payment details.</p>
          </div>

          <div style="padding: 0 28px 32px; margin-top: -40px;">
            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px;">
              <div style="background: #ffffff; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);">
                <p style="margin: 0 0 10px; font-size: 13px; color: #6b7f91;">Billed To</p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #102a43;">{{guest_name}}</p>
                <p style="margin: 14px 0 0; font-size: 14px; line-height: 1.8; color: #48627a;">{{company_name}}<br/>{{address}}<br/>GST: {{gst_number}}</p>
              </div>
              <div style="background: #102a43; border-radius: 22px; padding: 24px; color: #ffffff;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.7);">Invoice No</p>
                <p style="margin: 10px 0 18px; font-size: 24px; font-weight: 700;">{{invoice_number}}</p>
                <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.7);">Invoice Date</p>
                <p style="margin: 10px 0 0; font-size: 16px; font-weight: 700;">{{invoice_date}}</p>
              </div>
            </div>

            <div style="margin-top: 18px; background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; color: #102a43;">Stay & Invoice Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91; width: 35%;">Booking ID</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; font-weight: 700; color: #102a43;">{{booking_id}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Booking Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{booking_type}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Number</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_number}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_type}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Check-in / Check-out</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{check_in_date}} to {{check_out_date}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Guest Email</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{email}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Guest Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{phone}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room Rate</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">Rs. {{room_rate}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Extra Pax</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{extra_pax}} at Rs. {{extra_pax_rate}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Payment Mode</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{payment_mode}}</td></tr>
                <tr><td style="padding: 12px 0; font-size: 13px; color: #6b7f91;">Status</td><td style="padding: 12px 0; font-size: 14px; font-weight: 700; color: #102a43;">{{payment_status}}</td></tr>
              </table>
            </div>

            <div style="margin-top: 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
              <div style="background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 20px; padding: 18px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">Total</p><p style="margin: 0; font-size: 20px; font-weight: 700; color: #102a43;">Rs. {{total_amount}}</p></div>
              <div style="background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 20px; padding: 18px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">GST</p><p style="margin: 0; font-size: 20px; font-weight: 700; color: #102a43;">Rs. {{gst_amount}}</p></div>
              <div style="background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 20px; padding: 18px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">Paid</p><p style="margin: 0; font-size: 20px; font-weight: 700; color: #102a43;">Rs. {{paid_amount}}</p></div>
              <div style="background: linear-gradient(180deg, #f0fdf4 0%, #f7fff9 100%); border: 1px solid #cde9d8; border-radius: 20px; padding: 18px;"><p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7f91;">Balance Due</p><p style="margin: 0; font-size: 20px; font-weight: 700; color: #0f766e;">Rs. {{balance_due}}</p></div>
            </div>

            <div style="margin-top: 22px; background: #102a43; color: #ffffff; border-radius: 22px; padding: 22px;"><p style="margin: 0 0 6px; font-size: 15px; font-weight: 700;">Invoice Attached</p><p style="margin: 0; font-size: 14px; line-height: 1.8; color: rgba(255, 255, 255, 0.84);">This email reflects the latest edited guest, stay, and payment information. Please keep this invoice for your records.</p></div>
          </div>

          <div style="padding: 20px 32px 30px; background: #f8fbfd; border-top: 1px solid #e2edf3; text-align: center;"><p style="margin: 0; font-size: 12px; line-height: 1.7; color: #6b7f91;">&#x1F4CD; Balapuram, Vayattuparamba (Near Alakode)<br/>&#x1F4DE; 90615 54545 | 9446595722<br/>&#x1F310; www.avevistaresorts.com</p></div>
        </div>
      </div>
    </body>
  </html>',
  updated_at = timezone('utc'::text, now())
where slug = 'invoice-email';

update public.email_templates
set
  subject_template = '[Admin] {{event_type}} - {{booking_id}} - Ave Vista PMS',
  body_html = '<html>
    <body style="margin: 0; padding: 0; background: #eef4f8; font-family: Arial, sans-serif; color: #163047;">
      <div style="padding: 32px 16px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);">
          <div style="background: linear-gradient(135deg, #102a43 0%, #1d4ed8 100%); padding: 28px 40px 72px; color: #ffffff;">
            <div style="margin-bottom: 20px;"><img src="https://www.avevistaresorts.com/wp-content/uploads/2025/09/AveVistaLogoBlack-e1758994800877.png" alt="Ave Vista Resorts" style="height: 54px; width: auto; display: block; background: #ffffff; border-radius: 16px; padding: 10px 14px;" /></div>
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Admin Alert</div>
            <h1 style="margin: 18px 0 10px; font-size: 32px; line-height: 1.15;">System activity update</h1>
            <p style="margin: 0; font-size: 16px; line-height: 1.7; max-width: 500px; color: rgba(255, 255, 255, 0.88);">A recent event in Ave Vista PMS needs your attention. Review the details below and open the dashboard if action is required.</p>
          </div>

          <div style="padding: 0 32px 32px; margin-top: -36px;">
            <div style="background: #ffffff; border: 1px solid #dbe7ef; border-radius: 22px; padding: 28px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);">
              <p style="margin: 0 0 12px; font-size: 15px; color: #4b6478;">Event</p>
              <p style="margin: 0; font-size: 28px; font-weight: 700; color: #102a43;">{{event_type}}</p>
              <p style="margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: #48627a;">{{description}}</p>
            </div>

            <div style="margin-top: 22px; background: #f8fbfd; border: 1px solid #dbe7ef; border-radius: 22px; padding: 24px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; color: #102a43;">Event Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91; width: 42%;">Booking ID</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; font-weight: 700; color: #102a43;">{{booking_id}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Guest</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{guest_name}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Room</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{room_number}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Booking Type</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">{{booking_type}}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 13px; color: #6b7f91;">Amount</td><td style="padding: 12px 0; border-bottom: 1px solid #dbe7ef; font-size: 14px; color: #102a43;">Rs. {{total_amount}}</td></tr>
                <tr><td style="padding: 12px 0; font-size: 13px; color: #6b7f91;">Time</td><td style="padding: 12px 0; font-size: 14px; color: #102a43;">{{timestamp}}</td></tr>
              </table>
            </div>

            <div style="margin-top: 24px; text-align: center;"><a href="{{dashboard_link}}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-size: 14px; font-weight: 700;">Open Dashboard</a></div>
          </div>

          <div style="padding: 20px 32px 30px; background: #f8fbfd; border-top: 1px solid #e2edf3; text-align: center;"><p style="margin: 0; font-size: 12px; line-height: 1.7; color: #6b7f91;">&#x1F4CD; Balapuram, Vayattuparamba (Near Alakode)<br/>&#x1F4DE; 90615 54545 | 9446595722<br/>&#x1F310; www.avevistaresorts.com</p></div>
        </div>
      </div>
    </body>
  </html>',
  updated_at = timezone('utc'::text, now())
where slug = 'admin-alert';


