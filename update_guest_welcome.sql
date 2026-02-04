-- Update Guest Welcome Template
UPDATE public.email_templates
SET 
  subject_template = 'Welcome to the Family! - Ave Vista Resort',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to Ave Vista Resorts</title>
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
The Journey Begins
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Hello {{first_name}} {{last_name}},
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
Thank you for joining the <strong>Ave Vista Resorts</strong> family. 
We are more than just a place to stay—we are a sanctuary where calm meets celebration.
</p>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
As a registered guest, you will enjoy seamless bookings, exclusive offers, and personalized concierge services.
</p>

</td>
</tr>

<!-- FEATURES GRID -->
<tr>
<td style="padding:0 30px 20px;">
<div style="margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
<strong style="color:#ffffff;font-size:15px;">Discover Our World</strong>
</div>

<table width="100%" cellpadding="10" cellspacing="0">
<tr>
<td width="33%" align="center" style="border:1px solid #1e293b;border-radius:8px;background:#0f172a;">
<div style="font-size:24px;margin-bottom:5px;">🏊</div>
<div style="font-size:13px;color:#93c5fd;font-weight:600;">Infinity Pool</div>
</td>
<td width="33%" align="center" style="border:1px solid #1e293b;border-radius:8px;background:#0f172a;">
<div style="font-size:24px;margin-bottom:5px;">🍽️</div>
<div style="font-size:13px;color:#93c5fd;font-weight:600;">Fine Dining</div>
</td>
<td width="33%" align="center" style="border:1px solid #1e293b;border-radius:8px;background:#0f172a;">
<div style="font-size:24px;margin-bottom:5px;">🧘</div>
<div style="font-size:13px;color:#93c5fd;font-weight:600;">Spa & Yoga</div>
</td>
</tr>
</table>

</td>
</tr>

<!-- CONTACT DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<strong>Need Assistance?</strong><br>
We are here for you 24/7.<br>
<span style="color:#ffffff;">📞 +91 90615 54545</span><br>
<span style="color:#ffffff;">📧 info@avevistaresorts.com</span>

</td>
</tr>

</table>
</td>
</tr>

<!-- CTA BUTTON -->
<tr>
<td align="center" style="padding:20px;">
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
Plan Your Stay
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
WHERE slug = 'guest-welcome';
