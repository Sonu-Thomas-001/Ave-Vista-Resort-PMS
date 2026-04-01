import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data: categories, error } = await supabase
            .from('expense_categories')
            .select('*')
            .order('is_default', { ascending: false })
            .order('name', { ascending: true });

        if (error) {
            console.error('Categories fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('GET /api/expenses/categories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
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
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['Admin', 'Manager'].includes(profile.role as string)) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { name, color, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const { data: newCategory, error } = await supabase
            .from('expense_categories')
            .insert({
                name,
                color: color || '#6B7280',
                description: description || null,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Category creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error) {
        console.error('POST /api/expenses/categories error:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
