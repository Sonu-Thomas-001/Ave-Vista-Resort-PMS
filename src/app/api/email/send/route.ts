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
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    page.drawText(`INVOICE #${data.invoice_number || 'DRAFT'}`, {
        x: 50,
        y: height - 50,
        size: 20,
        font: font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Guest: ${data.guest_name || 'N/A'}`, { x: 50, y: height - 80, size: fontSize, font });
    page.drawText(`Room: ${data.room_number || 'N/A'}`, { x: 50, y: height - 100, size: fontSize, font });
    page.drawText(`Amount: ${data.total_amount || '0'}`, { x: 50, y: height - 120, size: fontSize, font });
    page.drawText(`Status: ${data.payment_status || 'Pending'}`, { x: 50, y: height - 140, size: fontSize, font });

    page.drawText(`Thank you for staying at Ave Vista Resort!`, {
        x: 50,
        y: height - 200,
        size: fontSize,
        font,
        color: rgb(0, 0.53, 0.71),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
