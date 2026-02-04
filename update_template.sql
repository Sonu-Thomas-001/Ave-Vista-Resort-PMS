-- Update Booking Confirmation Template with new HTML
UPDATE public.email_templates
SET 
  subject_template = 'Booking Confirmed: {{booking_id}} - Ave Vista Resort',
  body_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Ave Vista Resorts - Booking Confirmation</title>
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
Booking Confirmation
</h2>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:30px;color:#e5e7eb;">

<h3 style="margin-top:0;color:#ffffff;">
Hello {{guest_name}},
</h3>

<p style="font-size:15px;line-height:1.7;color:#cbd5f5;">
Thank you for choosing <strong>Ave Vista Resorts & Hotels</strong>.
Your reservation has been successfully confirmed.  
We look forward to welcoming you for a peaceful and premium stay experience.
</p>

</td>
</tr>

<!-- BOOKING DETAILS GLASS CARD -->
<tr>
<td style="padding:0 30px 20px;">
<table width="100%" cellpadding="12"
style="background:#020617;border-radius:10px;border:1px solid #1e293b;">

<tr>
<td style="color:#93c5fd;font-size:14px;line-height:1.8;">

<strong>Guest Name:</strong> {{guest_name}}<br>
<strong>Room Type:</strong> {{room_type}}<br>
<strong>Guests:</strong> {{guests}}<br>
<strong>Check-in:</strong> {{check_in_date}}<br>
<strong>Check-out:</strong> {{check_out_date}}<br>
<strong>Total Amount:</strong> ₹{{total_amount}}<br>
<strong>Advance Received:</strong> ₹{{advance_amount}}

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
View Resort Details
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
WHERE slug = 'booking-confirmation';
