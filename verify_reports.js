
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
        }
    });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyReports() {
    console.log('Verifying Reports Data Logic...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const startStr = startDate.toISOString();

    // 1. Revenue Breakdown
    console.log('\n--- Revenue Breakdown ---');
    const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startStr);

    if (invError) console.error('Invoice Error:', invError);
    else {
        const byMethod = {};
        let total = 0;
        invoices.forEach(inv => {
            const method = inv.payment_mode || 'Cash';
            byMethod[method] = (byMethod[method] || 0) + (Number(inv.paid_amount) || 0);
            total += (Number(inv.paid_amount) || 0);
        });
        console.log('Total Revenue (30d):', total);
        console.log('By Method:', byMethod);
    }

    // 2. Occupancy
    console.log('\n--- Occupancy ---');
    const { data: bookings, error: bookError } = await supabase
        .from('bookings')
        .select('*, rooms(type)')
        .gte('check_in_date', startStr);

    if (bookError) console.error('Booking Error:', bookError);
    else {
        const roomTypeCount = {};
        bookings.forEach(b => {
            const type = b.rooms?.type || 'Standard';
            roomTypeCount[type] = (roomTypeCount[type] || 0) + 1;
        });
        console.log('Bookings (30d):', bookings.length);
        console.log('By Room Type:', roomTypeCount);
    }

    // 3. Guests
    console.log('\n--- Guests ---');
    const uniqueGuestIds = [...new Set(bookings?.map(b => b.guest_id) || [])];
    if (uniqueGuestIds.length > 0) {
        const { data: guests, error: guestError } = await supabase
            .from('guests')
            .select('id, created_at, is_vip')
            .in('id', uniqueGuestIds);

        if (guestError) console.error('Guest Error:', guestError);
        else {
            let newGuests = 0;
            let vipGuests = 0;
            guests.forEach(g => {
                if (g.is_vip) vipGuests++;
                if (new Date(g.created_at) >= startDate) newGuests++;
            });
            console.log('Total Unique Guests:', guests.length);
            console.log('New Guests (created in period):', newGuests);
            console.log('VIP Guests:', vipGuests);
        }
    } else {
        console.log('No guests found in period.');
    }
}

verifyReports();
