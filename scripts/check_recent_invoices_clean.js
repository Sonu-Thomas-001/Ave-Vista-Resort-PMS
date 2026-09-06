
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.join(__dirname, '.env.local'))
    ? path.join(__dirname, '.env.local')
    : path.join(__dirname, '..', '.env.local');

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

async function checkRecentInvoices() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString();

    console.log(`Checking invoices since: ${dateStr}`);

    const { data, error } = await supabase
        .from('invoices')
        .select('id, created_at, status, paid_amount')
        .gte('created_at', dateStr)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return;
    }

    console.log(`Found ${data.length} invoices in the last 7 days.`);
    data.forEach((inv, index) => {
        console.log(`${index + 1}. ID: ${inv.id.substring(0, 8)}..., Created: ${inv.created_at}, Status: ${inv.status}, Amount: ${inv.paid_amount}`);
    });
}

checkRecentInvoices();
