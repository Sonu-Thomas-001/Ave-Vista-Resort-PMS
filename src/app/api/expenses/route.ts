import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const categoryId = searchParams.get('categoryId');
        const paymentMode = searchParams.get('paymentMode');
        const search = searchParams.get('search');

        let query = supabase
            .from('expenses')
            .select(`
                *,
                expense_categories:category_id(id, name, color),
                profiles:created_by(full_name)
            `)
            .eq('is_deleted', false)
            .order('date', { ascending: false });

        if (startDate) {
            query = query.gte('date', startDate);
        }

        if (endDate) {
            query = query.lte('date', endDate);
        }

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (paymentMode) {
            query = query.eq('payment_mode', paymentMode);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Expense fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ expenses: data });
    } catch (error) {
        console.error('GET /api/expenses error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}

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

        // Check user role (Manager or Admin)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !['Admin', 'Manager'].includes(profile.role)) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { title, categoryId, amount, date, paymentMode, notes, attachmentUrl } = body;

        // Validation
        if (!title || !categoryId || !amount || !date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const { data: newExpense, error } = await supabase
            .from('expenses')
            .insert({
                title,
                category_id: categoryId,
                amount: parseFloat(amount),
                date,
                payment_mode: paymentMode || 'Cash',
                notes: notes || null,
                attachment_url: attachmentUrl || null,
                created_by: user.id,
            })
            .select(`
                *,
                expense_categories:category_id(id, name, color),
                profiles:created_by(full_name)
            `)
            .single();

        if (error) {
            console.error('Expense creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ expense: newExpense }, { status: 201 });
    } catch (error) {
        console.error('POST /api/expenses error:', error);
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        );
    }
}
