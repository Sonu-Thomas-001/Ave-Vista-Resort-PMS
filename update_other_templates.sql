-- Update Check-in Confirmation
UPDATE public.email_templates
SET 
  subject_template = 'Welcome! You have checked in - Room {{room_number}}',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Ave Vista Resorts - Check-in Successful</title>
</head>

<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px;background:#0b1220;">
<tr>
<td align="center">

<!-- MAIN CARD -->
<table width="620" cellpadding="0" cellspacing="0"
style="background:#111827;border-radius:14px;overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.5);">

<!-- HEADER / LOGO AREA -->
<tr>
<td align="center" style="padding:30px 20px;background:#0f172a;">

<!-- LOGO -->
<img src="https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Logo/logo-white.png"
style="max-width:160px;margin-bottom:10px;" alt="Ave Vista Resorts Logo"/>

<h2 style="margin:0;color:#38bdf8;font-weight:600;letter-spacing:1px;">
Welcome Home
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Dear {{guest_name}},
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
Welcome to <strong>Ave Vista Resorts</strong>. We are thrilled to have you with us.
Your check-in is complete, and your room has been prepared with fresh linens and premium amenities to ensure your utmost comfort.
</p>
<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
Relax, unwind, and let us take care of the rest.
</p>

</td>
</tr>

<!-- ROOM & RESORT DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<div style="margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
<strong style="color:#ffffff;font-size:15px;">Your Stay Essentials</strong>
</div>

<strong>Room Number:</strong> <span style="color:#ffffff;">{{room_number}}</span><br>
<strong>WiFi Network:</strong> avevista_guest<br>
<strong>WiFi Password:</strong> <span style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#cbd5f5;">avevista_guest</span>

<div style="margin-top: 15px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
<strong style="color:#ffffff;font-size:15px;">Guest Services</strong>
</div>

<strong>🛎️ Reception:</strong> Dial 9<br>
<strong>🍽️ In-Room Dining:</strong> Dial 100<br>
<strong>🍳 Breakfast:</strong> 7:30 AM - 10:30 AM (The Palm Restaurant)<br>
<strong>🏊 Pool Hours:</strong> 6:00 AM - 8:00 PM

</td>
</tr>

</table>
</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;">
<a href="#"
style="
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:6px;
font-size:14px;
font-weight:600;
display:inline-block;
box-shadow:0 4px 14px rgba(37,99,235,0.4);
">
View Resort Guide
</a>
</td>
</tr>

<!-- MODERN FOOTER -->
<tr>
<td style="background:#020617;padding:25px;text-align:center;
color:#94a3b8;font-size:13px;line-height:1.7;">

<strong style="color:#38bdf8;font-size:15px;">
Ave Vista Resorts & Hotels
</strong><br>
Balapuram, Vayattuparamba, Kannur<br>
<span style="color:#38bdf8;">📞</span> +91 90615 54545
<br><br>
<span style="font-size:12px;color:#64748b;">
Need anything extra? Just ask our front desk team.
</span>

</td>
</tr>

</table>
<!-- END CARD -->

</td>
</tr>
</table>

</body>
</html>'
WHERE slug = 'checkin-confirmation';

-- Update Invoice Email
UPDATE public.email_templates
SET 
  subject_template = 'Your Invoice #{{invoice_number}} from Ave Vista Resort',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Ave Vista Resorts - Invoice</title>
</head>

<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px;background:#0b1220;">
<tr>
<td align="center">

<!-- MAIN CARD -->
<table width="620" cellpadding="0" cellspacing="0"
style="background:#111827;border-radius:14px;overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.5);">

<!-- HEADER / LOGO AREA -->
<tr>
<td align="center" style="padding:30px 20px;background:#0f172a;">

<!-- LOGO -->
<img src="https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Logo/logo-white.png"
style="max-width:160px;margin-bottom:10px;" alt="Ave Vista Resorts Logo"/>

<h2 style="margin:0;color:#38bdf8;font-weight:600;letter-spacing:1px;">
Thank You
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Dear {{guest_name}},
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
It was a pleasure hosting you at <strong>Ave Vista Resorts</strong>. We hope you created wonderful memories during your stay with us.
</p>
<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
Please find your final invoice attached to this email. If you have any questions regarding the charges, please reply to this email or contact our billing department.
</p>

</td>
</tr>

<!-- INVOICE DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<div style="margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
<strong style="color:#ffffff;font-size:15px;">Invoice Summary</strong>
</div>

<strong>Invoice Number:</strong> #{{invoice_number}}<br>
<strong>Payment Status:</strong> <span style="color:#4ade80;">{{payment_status}}</span><br>
<br>
<span style="font-size:18px;color:#ffffff;">Total Paid: <strong>{{total_amount}}</strong></span>

</td>
</tr>

</table>
</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;">
<p style="color:#9ca3af;font-size:13px;margin-bottom:15px;">
We look forward to welcoming you back soon.
</p>
<a href="https://www.avevistaresorts.com"
style="
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:6px;
font-size:14px;
font-weight:600;
display:inline-block;
box-shadow:0 4px 14px rgba(37,99,235,0.4);
">
Book Your Next Stay
</a>
</td>
</tr>

<!-- MODERN FOOTER -->
<tr>
<td style="background:#020617;padding:25px;text-align:center;
color:#94a3b8;font-size:13px;line-height:1.7;">

<strong style="color:#38bdf8;font-size:15px;">
Ave Vista Resorts & Hotels
</strong><br>
Experience Calm. Comfort. Celebration.

</td>
</tr>

</table>
<!-- END CARD -->

</td>
</tr>
</table>

</body>
</html>'
WHERE slug = 'invoice-email';

-- Update Admin Alert
UPDATE public.email_templates
SET 
  subject_template = '🚨 [Admin] {{event_type}}',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>System Alert</title>
</head>

<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px;background:#0b1220;">
<tr>
<td align="center">

<!-- MAIN CARD -->
<table width="620" cellpadding="0" cellspacing="0"
style="background:#111827;border-radius:14px;overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.5);border-top: 4px solid #ef4444;">

<!-- HEADER -->
<tr>
<td align="center" style="padding:20px;background:#0f172a;">
<h2 style="margin:0;color:#ef4444;font-weight:700;letter-spacing:0.5px;font-size:18px;">
SYSTEM NOTIFICATION
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;font-size:20px;">
Event: {{event_type}}
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
A new event has been triggered in the Ave Vista PMS. Please review the details below.
</p>

<!-- DETAILS BOX -->
<div style="background:#1e293b;border-left:4px solid #38bdf8;padding:15px;margin:20px 0;border-radius:4px;">
<p style="margin:0;color:#e2e8f0;font-family:monospace;font-size:14px;">
{{description}}
</p>
</div>

<p style="font-size:13px;color:#94a3b8;">
Timestamp: {{timestamp}}
</p>

</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;border-top:1px solid #1e293b;">
<a href="{{dashboard_link}}"
style="
background:#ef4444;
color:#ffffff;
text-decoration:none;
padding:12px 24px;
border-radius:6px;
font-size:14px;
font-weight:600;
display:inline-block;
">
View in Dashboard
</a>
</td>
</tr>

</table>
<!-- END CARD -->

</td>
</tr>
</table>

</body>
</html>'
WHERE slug = 'admin-alert';
