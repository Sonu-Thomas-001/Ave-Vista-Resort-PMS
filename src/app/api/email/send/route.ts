import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request: Request) {
    try {
        const { type, payload } = await request.json();
        console.log(`[API] Processing email type: ${type}`, payload);

        // 1. Check if Emails are Global Enabled
        const { data: settings } = await supabase
            .from("app_settings")
            .select("email_enabled")
            .eq("id", 1)
            .single();

        if (settings && settings.email_enabled === false) {
            return NextResponse.json({ message: "Emails disabled globally" });
        }

        // 2. Fetch Template
        const { data: template, error: templateError } = await supabase
            .from("email_templates")
            .select("*")
            .eq("slug", type)
            .single();

        if (templateError || !template) {
            return NextResponse.json({ error: `Template not found for type: ${type}` }, { status: 404 });
        }

        // 3. Prepare Email Content
        let subject = template.subject_template;
        let html = template.body_html;
        const attachments: any[] = [];

        // Replace placeholders
        Object.keys(payload).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            const value = payload[key] || "";
            subject = subject.replace(regex, String(value));
            html = html.replace(regex, String(value));
        });

        // 4. Generate PDF if Invoice
        if (type === "invoice-email") {
            try {
                const pdfBytes = await generateInvoicePDF(payload);
                attachments.push({
                    filename: `Invoice-${payload.invoice_number || '001'}.pdf`,
                    content: Buffer.from(pdfBytes)
                });
            } catch (pdfErr) {
                console.error("Error generating PDF", pdfErr);
            }
        }

        // 5. Determine Recipient
        let to = payload.email;
        if (type === 'admin-alert') {
            const { data: adminSettings } = await supabase.from('app_settings').select('admin_email').eq('id', 1).single();
            to = adminSettings?.admin_email || process.env.SMTP_USER;
        }

        if (!to) {
            return NextResponse.json({ error: "No recipient email provided" }, { status: 400 });
        }

        // 6. Send Email via Nodemailer
        console.log(`Sending email to ${to} via ${process.env.SMTP_HOST}`);
        const info = await transporter.sendMail({
            from: `"Ave Vista Resort" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments
        });

        console.log("Message sent: %s", info.messageId);

        // 7. Log Success
        await supabase.from("email_logs").insert({
            recipient: to,
            template_slug: type,
            status: "Sent",
            metadata: { ...payload, messageId: info.messageId },
        });

        return NextResponse.json({ success: true, id: info.messageId });

    } catch (err: any) {
        console.error("Error sending email:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function generateInvoicePDF(data: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const primaryColor = rgb(0.01, 0.61, 0.90); // #039BE5
    const darkColor = rgb(0.15, 0.16, 0.22); // #263238
    const grayColor = rgb(0.33, 0.43, 0.48); // #546E7A
    const lightGray = rgb(0.81, 0.85, 0.86); // #CFD8DC

    let yPos = height - 50;

    // ===== HEADER SECTION =====
    // Brand Name
    page.drawText('Ave Vista Resorts & Hotels', {
        x: 50,
        y: yPos,
        size: 18,
        font: fontBold,
        color: primaryColor,
    });

    yPos -= 20;

    // Address
    page.drawText('Balapuram, Vayattuparamba, Kannur, Kerala – 670582', {
        x: 50,
        y: yPos,
        size: 9,
        font: fontRegular,
        color: grayColor,
    });

    yPos -= 15;

    // Contact Info
    page.drawText('+91 90615 54545  |  avevistaresort@gmail.com  |  www.avevistaresorts.com', {
        x: 50,
        y: yPos,
        size: 8,
        font: fontRegular,
        color: grayColor,
    });

    // TAX INVOICE Badge (right side)
    page.drawRectangle({
        x: width - 150,
        y: height - 60,
        width: 100,
        height: 25,
        color: primaryColor,
    });

    page.drawText('TAX INVOICE', {
        x: width - 140,
        y: height - 50,
        size: 10,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    yPos -= 30;

    // Horizontal line
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: lightGray,
    });

    yPos -= 30;

    // ===== INVOICE & STAY DETAILS (Two Columns) =====
    const col1X = 50;
    const col2X = 320;

    // Left Column - Invoice Information
    page.drawText('Invoice Information', {
        x: col1X,
        y: yPos,
        size: 11,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 20;

    const invoiceInfo = [
        ['Invoice No:', data.invoice_number || 'N/A'],
        ['Date:', new Date().toLocaleDateString('en-IN')],
        ['Booking ID:', data.booking_id?.slice(0, 8).toUpperCase() || 'N/A'],
        ['Mode:', data.payment_method || 'Direct'],
    ];

    invoiceInfo.forEach(([label, value]) => {
        page.drawText(label, {
            x: col1X,
            y: yPos,
            size: 9,
            font: fontRegular,
            color: grayColor,
        });

        page.drawText(String(value), {
            x: col1X + 80,
            y: yPos,
            size: 9,
            font: fontBold,
            color: darkColor,
        });

        yPos -= 15;
    });

    // Right Column - Stay Details
    yPos = height - 140; // Reset for right column

    page.drawText('Stay Details', {
        x: col2X,
        y: yPos,
        size: 11,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 20;

    const stayInfo = [
        ['Room No:', data.room_number || 'N/A'],
        ['Check-in:', data.check_in_date || 'N/A'],
        ['Check-out:', data.check_out_date || 'N/A'],
        ['Guests:', String(data.guests_count || 1)],
    ];

    stayInfo.forEach(([label, value]) => {
        page.drawText(label, {
            x: col2X,
            y: yPos,
            size: 9,
            font: fontRegular,
            color: grayColor,
        });

        page.drawText(String(value), {
            x: col2X + 70,
            y: yPos,
            size: 9,
            font: fontBold,
            color: darkColor,
        });

        yPos -= 15;
    });

    yPos -= 20;

    // ===== GUEST DETAILS =====
    page.drawText('Guest Details', {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 20;

    page.drawText(data.guest_name || 'Guest', {
        x: 50,
        y: yPos,
        size: 10,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 15;

    page.drawText(`Email: ${data.email || 'N/A'}`, {
        x: 50,
        y: yPos,
        size: 9,
        font: fontRegular,
        color: grayColor,
    });

    yPos -= 30;

    // ===== TARIFF TABLE =====
    page.drawText('Tariff & Charges', {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 25;

    // Table Header
    page.drawRectangle({
        x: 50,
        y: yPos - 5,
        width: width - 100,
        height: 20,
        color: rgb(0.97, 0.98, 0.99),
    });

    page.drawText('Description', { x: 60, y: yPos, size: 9, font: fontBold, color: darkColor });
    page.drawText('Qty', { x: 300, y: yPos, size: 9, font: fontBold, color: darkColor });
    page.drawText('Rate', { x: 380, y: yPos, size: 9, font: fontBold, color: darkColor });
    page.drawText('Amount', { x: 470, y: yPos, size: 9, font: fontBold, color: darkColor });

    yPos -= 25;

    // Table Row
    const amount = data.total_amount || data.amount || 0;
    const nights = data.nights || 1;
    const rate = amount / nights;

    page.drawText('Room Tariff', { x: 60, y: yPos, size: 9, font: fontRegular, color: darkColor });
    page.drawText(String(nights), { x: 300, y: yPos, size: 9, font: fontRegular, color: darkColor });
    page.drawText(`Rs.${rate.toFixed(2)}`, { x: 380, y: yPos, size: 9, font: fontRegular, color: darkColor });
    page.drawText(`Rs.${amount.toLocaleString()}`, { x: 470, y: yPos, size: 9, font: fontBold, color: darkColor });

    yPos -= 30;

    // ===== PAYMENT SUMMARY =====
    const summaryX = width - 220;
    const summaryWidth = 170;

    // Background box
    page.drawRectangle({
        x: summaryX - 10,
        y: yPos - 60,
        width: summaryWidth,
        height: 80,
        color: rgb(0.98, 0.99, 1),
        borderColor: lightGray,
        borderWidth: 1,
    });

    yPos -= 5;

    const gstRate = data.gst_rate || 0;
    const gstAmount = (amount * gstRate) / 100;
    const grandTotal = amount + gstAmount;

    // Sub Total
    page.drawText('Sub Total:', { x: summaryX, y: yPos, size: 9, font: fontRegular, color: grayColor });
    page.drawText(`Rs.${amount.toLocaleString()}`, { x: summaryX + 100, y: yPos, size: 9, font: fontRegular, color: darkColor });

    yPos -= 15;

    // GST
    if (gstRate > 0) {
        page.drawText(`CGST (${gstRate / 2}%):`, { x: summaryX, y: yPos, size: 9, font: fontRegular, color: grayColor });
        page.drawText(`Rs.${(gstAmount / 2).toFixed(2)}`, { x: summaryX + 100, y: yPos, size: 9, font: fontRegular, color: darkColor });

        yPos -= 15;

        page.drawText(`SGST (${gstRate / 2}%):`, { x: summaryX, y: yPos, size: 9, font: fontRegular, color: grayColor });
        page.drawText(`Rs.${(gstAmount / 2).toFixed(2)}`, { x: summaryX + 100, y: yPos, size: 9, font: fontRegular, color: darkColor });

        yPos -= 15;
    }

    // Grand Total
    page.drawLine({
        start: { x: summaryX, y: yPos + 5 },
        end: { x: summaryX + summaryWidth - 20, y: yPos + 5 },
        thickness: 1,
        color: lightGray,
    });

    yPos -= 10;

    page.drawText('Grand Total:', { x: summaryX, y: yPos, size: 10, font: fontBold, color: darkColor });
    page.drawText(`Rs.${grandTotal.toLocaleString()}`, { x: summaryX + 100, y: yPos, size: 10, font: fontBold, color: primaryColor });

    yPos -= 30;

    // ===== PAYMENT STATUS =====
    page.drawText('Payment Summary', {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: darkColor,
    });

    yPos -= 20;

    page.drawText(`Paid Amount: Rs.${(data.paid_amount || amount).toLocaleString()}`, {
        x: 50,
        y: yPos,
        size: 9,
        font: fontRegular,
        color: grayColor,
    });

    yPos -= 15;

    page.drawText(`Payment Status: ${data.payment_status || 'Paid'}`, {
        x: 50,
        y: yPos,
        size: 9,
        font: fontBold,
        color: rgb(0.04, 0.74, 0.51), // Green
    });

    yPos -= 40;

    // ===== FOOTER =====
    page.drawLine({
        start: { x: 50, y: yPos },
        end: { x: width - 50, y: yPos },
        thickness: 1,
        color: lightGray,
    });

    yPos -= 20;

    page.drawText('Thank you for choosing Ave Vista Resorts & Hotels', {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: primaryColor,
    });

    yPos -= 15;

    page.drawText('We hope you had a wonderful stay!', {
        x: 50,
        y: yPos,
        size: 9,
        font: fontRegular,
        color: grayColor,
    });

    yPos -= 25;

    page.drawText('Resort Policies: Check-in: 2:00 PM | Check-out: 12:00 PM | Pool: 6AM-11AM & 4PM-10PM', {
        x: 50,
        y: yPos,
        size: 7,
        font: fontRegular,
        color: grayColor,
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
