-- Update Check-in Confirmation
UPDATE public.email_templates
SET 
  subject_template = 'Welcome! Your Room is Ready - Ave Vista Resort',
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
Check-in Successful
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Welcome, {{guest_name}}!
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
We are delighted to have you at <strong>Ave Vista Resorts & Hotels</strong>. 
You have successfully checked in, and your room is ready for you.
</p>

</td>
</tr>

<!-- ROOM DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<strong>Room Number:</strong> {{room_number}}<br>
<strong>WiFi Password:</strong> avevista_guest<br>
<strong>Reception:</strong> Dial 9<br>
<strong>Breakfast:</strong> 7:30 AM - 10:30 AM (The Palm Restaurant)

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
View Resort Services
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

<span style="color:#38bdf8;">📞</span> +91 90615 54545 &nbsp; | &nbsp;
<span style="color:#38bdf8;">🌐</span> www.avevistaresorts.com

<br><br>

<span style="font-size:12px;color:#64748b;">
Experience Calm. Comfort. Celebration.
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
  subject_template = 'Invoice #{{invoice_number}} - Ave Vista Resort',
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
Your Invoice
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
Thank you for staying with <strong>Ave Vista Resorts & Hotels</strong>. 
We hope you had a wonderful time. Please find your invoice details below.
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

<strong>Invoice Number:</strong> #{{invoice_number}}<br>
<strong>Total Amount:</strong> {{total_amount}}<br>
<strong>Status:</strong> {{payment_status}}

</td>
</tr>

</table>
</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;">
<p style="color:#9ca3af;font-size:13px;margin-bottom:15px;">A PDF copy is attached to this email.</p>
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

<span style="color:#38bdf8;">📞</span> +91 90615 54545 &nbsp; | &nbsp;
<span style="color:#38bdf8;">🌐</span> www.avevistaresorts.com

<br><br>

<span style="font-size:12px;color:#64748b;">
Experience Calm. Comfort. Celebration.
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
WHERE slug = 'invoice-email';

-- Update Admin Alert
UPDATE public.email_templates
SET 
  subject_template = '[Admin] {{event_type}} - Ave Vista PMS',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Ave Vista Resorts - Admin Alert</title>
</head>

<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px;background:#0b1220;">
<tr>
<td align="center">

<!-- MAIN CARD -->
<table width="620" cellpadding="0" cellspacing="0"
style="background:#111827;border-radius:14px;overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.5);border: 1px solid #ef4444;">

<!-- HEADER / LOGO AREA -->
<tr>
<td align="center" style="padding:30px 20px;background:#0f172a;">

<!-- LOGO -->
<img src="https://cdn.jsdelivr.net/gh/Sonu-Thomas-001/image-host@master/AVR%20PMS/Logo/logo-white.png"
style="max-width:160px;margin-bottom:10px;" alt="Ave Vista Resorts Logo"/>

<h2 style="margin:0;color:#ef4444;font-weight:600;letter-spacing:1px;">
Admin Notification
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Event: {{event_type}}
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
{{description}}
</p>

</td>
</tr>

<!-- DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<strong>Timestamp:</strong> {{timestamp}}<br>
<strong>System:</strong> Ave Vista PMS

</td>
</tr>

</table>
</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;">
<a href="{{dashboard_link}}"
style="
background:#ef4444;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:6px;
font-size:14px;
font-weight:600;
display:inline-block;
box-shadow:0 4px 14px rgba(239,68,68,0.4);
">
Open Dashboard
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
<span style="font-size:12px;color:#64748b;">
Internal System Alert
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
WHERE slug = 'admin-alert';
