
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

async function checkRecentBookings() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString();

    console.log(`Checking bookings since: ${dateStr}`);

    const { data, error } = await supabase
        .from('bookings')
        .select('id, created_at, status, total_amount, advance_amount')
        .gte('created_at', dateStr)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }

    console.log(`Found ${data.length} bookings in the last 7 days.`);
    data.forEach((b, index) => {
        console.log(`${index + 1}. ID: ${b.id.substring(0, 8)}..., Created: ${b.created_at}, Status: ${b.status}, Total: ${b.total_amount}, Advance: ${b.advance_amount}`);
    });
}

checkRecentBookings();
