import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check permissions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['Admin', 'Manager'].includes((profile as any).role)) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { date, notes } = body;

        if (!date) {
            return NextResponse.json(
                { error: 'Date is required' },
                { status: 400 }
            );
        }

        // Try to update existing record, or create new one
        const { data: existing } = await supabase
            .from('daily_closing')
            .select('id')
            .eq('closing_date', date)
            .single();

        let result;
        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('daily_closing')
                .update({
                    notes: notes || null,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('closing_date', date)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new closing record with calculated metrics
            const { data: invoices } = await supabase
                .from('invoices')
                .select('paid_amount, status')
                .gte('created_at', `${date}T00:00:00Z`)
                .lt('created_at', `${date}T23:59:59Z`)
                .in('status', ['Paid', 'Partial']);

            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount')
                .eq('date', date)
                .eq('is_deleted', false);

            const revenue = (invoices || []).reduce(
                (sum: number, inv: any) => sum + (inv.paid_amount || 0),
                0
            );
            const totalExpenses = (expenses || []).reduce(
                (sum: number, exp: any) => sum + exp.amount,
                0
            );

            const { data, error } = await supabase
                .from('daily_closing')
                .insert({
                    closing_date: date,
                    revenue_total: revenue,
                    expenses_total: totalExpenses,
                    net_profit: revenue - totalExpenses,
                    notes: notes || null,
                    created_by: user.id,
                } as any)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json({ closing: result });
    } catch (error: any) {
        console.error('POST /api/daily-closing error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save daily closing' },
            { status: 500 }
        );
    }
}
