import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: expense, error } = await supabase
            .from('expenses')
            .select(`
                *,
                expense_categories:category_id(id, name, color),
                profiles:created_by(full_name)
            `)
            .eq('id', id)
            .eq('is_deleted', false)
            .single();

        if (error || !expense) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ expense });
    } catch (error) {
        console.error('GET /api/expenses/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user created the expense or is admin
        const { data: expenseData } = await supabase
            .from('expenses')
            .select('created_by')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();

        if (!expenseData) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        // Check permissions
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const userRole = (profileData as any)?.role;
        const createdBy = (expenseData as any)?.created_by;

        if (userRole !== 'Admin' && createdBy !== user.id) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { title, categoryId, amount, date, paymentMode, notes, attachmentUrl } = body;

        // Validation
        if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const updateData: Record<string, any> = {};
        if (title) updateData.title = title;
        if (categoryId) updateData.category_id = categoryId;
        if (amount) updateData.amount = parseFloat(amount);
        if (date) updateData.date = date;
        if (paymentMode) updateData.payment_mode = paymentMode;
        if (notes !== undefined) updateData.notes = notes;
        if (attachmentUrl !== undefined) updateData.attachment_url = attachmentUrl;

        const { data: updatedExpense, error } = await supabase
            .from('expenses')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                expense_categories:category_id(id, name, color),
                profiles:created_by(full_name)
            `)
            .single();

        if (error) {
            console.error('Expense update error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ expense: updatedExpense });
    } catch (error) {
        console.error('PUT /api/expenses/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update expense' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user created the expense or is admin
        const { data: expenseData } = await supabase
            .from('expenses')
            .select('created_by')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();

        if (!expenseData) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        // Check permissions
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const userRole = (profileData as any)?.role;
        const createdBy = (expenseData as any)?.created_by;

        if (userRole !== 'Admin' && createdBy !== user.id) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Soft delete
        const { data: deletedExpense, error } = await supabase
            .from('expenses')
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Expense deletion error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ expense: deletedExpense });
    } catch (error) {
        console.error('DELETE /api/expenses/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete expense' },
            { status: 500 }
        );
    }
}
