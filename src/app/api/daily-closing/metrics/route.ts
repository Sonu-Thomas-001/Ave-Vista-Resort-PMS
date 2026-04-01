import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json(
                { error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        // Fetch daily closing record if exists
        const { data: closingRecord } = await supabase
            .from('daily_closing')
            .select('*')
            .eq('closing_date', date)
            .single();

        if (closingRecord) {
            // Return existing record
            return NextResponse.json({
                metrics: {
                    revenue: closingRecord.revenue_total || 0,
                    expenses: closingRecord.expenses_total || 0,
                    netProfit: closingRecord.net_profit || 0,
                    checkIns: closingRecord.check_ins_today || 0,
                    checkOuts: closingRecord.check_outs_today || 0,
                    roomsOccupied: closingRecord.rooms_occupied || 0,
                    roomsTotal: closingRecord.rooms_total || 0,
                    occupancyRate: closingRecord.occupancy_rate || 0,
                    bookingsCount: closingRecord.bookings_count || 0,
                },
                notes: closingRecord.notes || '',
                isLocked: closingRecord.is_locked || false,
            });
        }

        // Calculate metrics on the fly from invoices and expenses
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

        const { data: checkInsData } = await supabase
            .from('bookings')
            .select('id')
            .eq('check_in_date', date);

        const { data: checkOutsData } = await supabase
            .from('bookings')
            .select('id')
            .eq('check_out_date', date);

        const { data: rooms } = await supabase
            .from('rooms')
            .select('id, status');

        const revenue = (invoices || []).reduce(
            (sum, inv) => sum + (inv.paid_amount || 0),
            0
        );
        const totalExpenses = (expenses || []).reduce(
            (sum, exp) => sum + exp.amount,
            0
        );
        const netProfit = revenue - totalExpenses;

        const roomsTotal = (rooms || []).length;
        const roomsOccupied = (rooms || []).filter((r) => r.status === 'Occupied')
            .length;
        const occupancyRate =
            roomsTotal > 0 ? (roomsOccupied / roomsTotal) * 100 : 0;

        return NextResponse.json({
            metrics: {
                revenue,
                expenses: totalExpenses,
                netProfit,
                checkIns: (checkInsData || []).length,
                checkOuts: (checkOutsData || []).length,
                roomsOccupied,
                roomsTotal,
                occupancyRate,
                bookingsCount: 0, // Implement if needed
            },
            notes: '',
            isLocked: false,
        });
    } catch (error) {
        console.error('GET /api/daily-closing/metrics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}
