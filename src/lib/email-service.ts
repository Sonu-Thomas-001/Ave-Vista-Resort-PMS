import { supabase } from "@/lib/supabase";
import { DEFAULT_EMAIL_TEMPLATES, getDefaultTemplateBySlug } from "@/lib/default-email-templates";

export const EmailService = {

    /**
     * Trigger the Edge Function or API to send an email
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
        return data || [];
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

    /**
     * Reset a single template back to its modern default design
     */
    async resetTemplateToDefault(slug: string) {
        const defaultDef = getDefaultTemplateBySlug(slug);
        if (!defaultDef) throw new Error(`Default template not found for slug: ${slug}`);

        const { data, error } = await supabase
            .from('email_templates')
            .upsert({
                slug: defaultDef.slug,
                name: defaultDef.name,
                subject_template: defaultDef.subject_template,
                body_html: defaultDef.body_html,
                updated_at: new Date()
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Sync all modern default templates to the database (upserts all 9 templates)
     */
    async syncAllDefaultTemplates() {
        const upsertRows = DEFAULT_EMAIL_TEMPLATES.map(t => ({
            slug: t.slug,
            name: t.name,
            subject_template: t.subject_template,
            body_html: t.body_html,
            updated_at: new Date()
        }));

        const { data, error } = await supabase
            .from('email_templates')
            .upsert(upsertRows, { onConflict: 'slug' })
            .select();

        if (error) throw error;
        return data;
    },

    async getLogs(limit = 25) {
        const { data, error } = await supabase
            .from('email_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
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
    },

    /**
     * Dispatch a live test email directly from the template preview editor
     */
    async sendTestEmail(toEmail: string, slug: string, subjectTemplate: string, bodyHtml: string, testData: Record<string, string>) {
        const payload = {
            ...testData,
            email: toEmail,
            is_test: true,
            custom_subject: subjectTemplate,
            custom_html: bodyHtml
        };

        return this.triggerEmail(slug, payload);
    }
};
