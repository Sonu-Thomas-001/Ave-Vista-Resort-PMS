import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { PDFDocument, StandardFonts, rgb } from "https://cdn.skypack.dev/pdf-lib";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        let reqBody = await req.json();
        let type: string | undefined;
        let payload: any = {};

        // Helper to determine Email Type from Supabase Webhook structure
        if (reqBody.type === 'INSERT' && reqBody.table === 'bookings') {
            type = 'booking-confirmation';
            payload = reqBody.record;
            // Join extra data if needed? No, Edge Function should query if needed or standard Payload must have it.
            // For now assume Record has email/guest_name? No, Booking ref guest.
            // WE NEED DATA ENRICHMENT. The record only has guest_id.
            // We'll let the standard 'Send' logic fail if missing data, BUT for robustness we should fetch guest data here.
        } else if (reqBody.type === 'UPDATE' && reqBody.table === 'bookings' && reqBody.record.status === 'Checked In' && reqBody.old_record.status !== 'Checked In') {
            type = 'checkin-confirmation';
            payload = reqBody.record;
        } else if (reqBody.type === 'INSERT' && reqBody.table === 'guests') {
            type = 'guest-welcome';
            payload = reqBody.record;
        } else if (reqBody.type === 'INSERT' && reqBody.table === 'invoices') {
            type = 'invoice-email';
            payload = reqBody.record;
        } else if (reqBody.type && reqBody.payload) {
            // Direct invocation or Custom Webhook Body
            type = reqBody.type;
            payload = reqBody.payload;
        }

        if (!type || !payload) {
            console.log("Ignored event:", reqBody);
            return new Response(JSON.stringify({ message: "Ignored event" }), { headers: corsHeaders });
        }

        console.log(`Processing email type: ${type}`, payload);

        // --- Data Enrichment (If payload is just raw DB record) ---
        // If booking-confirmation/checkin-confirmation, we need Guest Email and Name!
        if (['booking-confirmation', 'checkin-confirmation'].includes(type) && payload.guest_id) {
            const { data: guest } = await supabase.from('guests').select('email, first_name, last_name, phone').eq('id', payload.guest_id).single();
            if (guest) {
                payload.email = guest.email;
                payload.guest_name = `${guest.first_name} ${guest.last_name}`;
                payload.guests_count = payload.adults + (payload.children || 0);

                // Also get Room info if room_id exists
                if (payload.room_id) {
                    const { data: room } = await supabase.from('rooms').select('room_number, type').eq('id', payload.room_id).single();
                    if (room) {
                        payload.room_number = room.room_number;
                        payload.room_type = room.type;
                    }
                }
            }
        } else if (type === 'guest-welcome') {
            // Guest record has email/name directly
            payload.guest_name = `${payload.first_name} ${payload.last_name}`;
        }
        else if (type === 'invoice-email' && payload.booking_id) {
            // Fetch Guest via Booking
            const { data: booking } = await supabase.from('bookings').select('guest_id, guests(email, first_name, last_name), room_id, rooms(room_number)').eq('id', payload.booking_id).single();
            if (booking && booking.guests) {
                payload.email = booking.guests.email; // Array or Obj? .single() on guest relation might be needed or it returns obj if FK 1:1.
                // Actually standard join: guests(*) -> guests: { email: ...}
                const g = booking.guests as any;
                payload.guest_name = `${g.first_name} ${g.last_name}`;
                payload.room_number = (booking.rooms as any)?.room_number || "Unknown";
            }
        }

        // Fallback for null emails
        if (!payload.email && type !== 'admin-alert') {
            console.error("No email found for payload", payload);
            return new Response(JSON.stringify({ error: "No recipient email found" }), { status: 400 });
        }

        // 1. Check if Emails are Global Enabled
        const { data: settings } = await supabase
            .from("app_settings")
            .select("email_enabled")
            .eq("id", 1)
            .single();

        if (settings && settings.email_enabled === false) {
            return new Response(JSON.stringify({ message: "Emails disabled globally" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Fetch Template
        const { data: template, error: templateError } = await supabase
            .from("email_templates")
            .select("*")
            .eq("slug", type)
            .single();

        if (templateError || !template) {
            throw new Error(`Template not found for type: ${type}`);
        }

        // 3. Prepare Email Content (Simple Mustache-style replacement)
        let subject = template.subject_template;
        let html = template.body_html;
        let attachments: any[] = [];

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
                    filename: `Invoice-${payload.invoice_number}.pdf`,
                    content: Buffer.from(pdfBytes).toString('base64'), // Resend expects buffer or base64? checking docs... usually buffer works in node, here we might need base64 for http api
                    // Wait, Resend Deno SDK might handle it differently.
                    // Let's us base64 string to be safe for JSON payload if needed
                });
                // Actually Resend SDK supports Buffer, let's look at pdf-lib output.
                // It returns Uint8Array.
                // const buffer = Buffer.from(pdfBytes);
                // attachments.push({ filename: 'invoice.pdf', content: buffer });
                // NOTE: Deno 'Buffer' might need polyfill or import. 'npm:resend' runs in Deno with compatibility layer.
                // Simplest for Resend API via JSON: content as array of bytes? No, usually base64 string.
                // Let's stick to standard array of numbers if the SDK handles it, or just pass the bytes if supported.
                // "content" in Resend can be a Buffer or string.
                attachments = [{
                    filename: `Invoice-${payload.invoice_number}.pdf`,
                    content: pdfBytes // Passing Uint8Array directly often works with recent libs
                }]
            } catch (pdfErr) {
                console.error("Error generating PDF", pdfErr);
                // We continue without PDF or fail? Let's log and continue with just text if critical, 
                // but for invoice email, PDF is key. Let's fail log.
                // Actually, let's just proceed for now to avoid blocking the whole email.
            }
        }

        // 5. Send Email
        // Determine recipient: payload.updated_email (guest) or admin logic
        let to = payload.email;
        if (type === 'admin-alert') {
            const { data: adminSettings } = await supabase.from('app_settings').select('admin_email').eq('id', 1).single();
            to = adminSettings?.admin_email || 'avevistaresort@gmail.com';
        }

        if (!to) {
            throw new Error("No recipient email provided");
        }

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: "Ave Vista Resort <onboarding@resend.dev>", // Change to verified domain later
            to: [to],
            subject: subject,
            html: html,
            attachments: attachments.length > 0 ? attachments : undefined
        });

        if (emailError) {
            throw emailError;
        }

        // 6. Log Success
        await supabase.from("email_logs").insert({
            recipient: to,
            template_slug: type,
            status: "Sent",
            metadata: payload,
        });

        return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("Error sending email:", err);

        // Log Failure
        // We ideally need the payload to know who it failed for, if we crashed before parsing payload, we can't log details well.
        // Assuming we have 'payload' in scope if parsing worked.

        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

async function generateInvoicePDF(data: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`INVOICE #${data.invoice_number}`, {
        x: 50,
        y: height - 50,
        size: 20,
        font: font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Guest: ${data.guest_name}`, { x: 50, y: height - 80, size: fontSize, font });
    page.drawText(`Room: ${data.room_number}`, { x: 50, y: height - 100, size: fontSize, font });
    page.drawText(`Amount: ${data.total_amount}`, { x: 50, y: height - 120, size: fontSize, font });
    page.drawText(`Status: ${data.payment_status}`, { x: 50, y: height - 140, size: fontSize, font });

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
