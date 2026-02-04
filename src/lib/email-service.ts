import { supabase } from "@/lib/supabase";

export const EmailService = {

    /**
     * Trigger the Edge Function to send an email
     */
    async triggerEmail(type: string, payload: any) {
        const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Email API Error:', data);
            throw new Error(data.error || 'Failed to send email');
        }

        return data;
    },

    async getTemplates() {
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async updateTemplate(id: string, subject: string, body: string) {
        const { data, error } = await supabase
            .from('email_templates')
            .update({ subject_template: subject, body_html: body, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getLogs(limit = 20) {
        const { data, error } = await supabase
            .from('email_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    async toggleSystemEmails(enabled: boolean) {
        const { data, error } = await supabase
            .from('app_settings')
            .update({ email_enabled: enabled })
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getSystemEmailStatus() {
        const { data } = await supabase
            .from('app_settings')
            .select('email_enabled')
            .eq('id', 1)
            .single();

        return data?.email_enabled ?? true; // Default true
    }
};
