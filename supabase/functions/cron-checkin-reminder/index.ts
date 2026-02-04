import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
    try {
        // 1. Calculate Tomorrow's Date (Simple date string match for 'check_in_date')
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`Checking for check-ins on: ${dateStr}`);

        // 2. Find Bookings
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select("*, guests(*)")
            .eq("check_in_date", dateStr)
            .eq("status", "Confirmed");

        if (error) throw error;

        console.log(`Found ${bookings?.length} bookings.`);

        const results = [];

        // 3. Iterate and Send
        for (const booking of bookings || []) {
            // Check if already sent
            const { data: existingLog } = await supabase
                .from("email_logs")
                .select("*")
                .eq("template_slug", "checkin-reminder")
                .contains("metadata", { booking_id: booking.id }) // specific checking
                .maybeSingle();

            if (existingLog) {
                console.log(`Reminder already sent for booking ${booking.id}`);
                continue;
            }

            const guestName = booking.guests?.first_name || "Guest";
            const email = booking.guests?.email;

            if (!email) {
                console.log(`No email for guest in booking ${booking.id}`);
                continue;
            }

            // Fetch Template
            const { data: template } = await supabase
                .from("email_templates")
                .select("*")
                .eq("slug", "checkin-reminder")
                .single();

            if (!template) {
                console.error("Template checkin-reminder not found");
                break;
            }

            // Prepare Content
            let subject = template.subject_template.replace("{{guest_name}}", guestName);
            let html = template.body_html.replace("{{guest_name}}", guestName);

            // Send
            const { error: sendError } = await resend.emails.send({
                from: "Ave Vista Resort <onboarding@resend.dev>",
                to: [email],
                subject: subject,
                html: html,
            });

            if (sendError) {
                console.error(`Failed to send to ${email}`, sendError);
                results.push({ booking_id: booking.id, status: "Failed", error: sendError.message });
            } else {
                // Log
                await supabase.from("email_logs").insert({
                    recipient: email,
                    template_slug: "checkin-reminder",
                    status: "Sent",
                    metadata: { booking_id: booking.id, check_in: dateStr },
                });
                results.push({ booking_id: booking.id, status: "Sent" });
            }
        }

        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
