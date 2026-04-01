import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
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

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            role: (profile as any).role,
            userId: user.id,
            email: user.email,
        });
    } catch (error) {
        console.error('GET /api/auth/user-role error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user role' },
            { status: 500 }
        );
    }
}
