
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

async function verifyFix() {
    console.log('Starting verification...');

    // 1. Insert Dummy Partial Invoice
    const dummyInvNum = `TEST-PARTIAL-${Date.now()}`;
    const { data: inserted, error: insertError } = await supabase
        .from('invoices')
        .insert([{
            invoice_number: dummyInvNum,
            guest_name: 'Test Guest',
            room_number: '101', // Assuming 101 exists or checking FK might fail if strict, but let's try. 
            // If strict FK on booking_id, we might need to be careful. 
            // Invoices usually don't enforce strict FK on room_number, but maybe booking_id? 
            // The schema showed booking_id is nullable.
            total_amount: 1000,
            paid_amount: 500,
            status: 'Partial',
            is_partial: true,
            payment_mode: 'Cash'
        }])
        .select()
        .single();

    if (insertError) {
        console.error('Failed to insert dummy invoice:', insertError);
        return;
    }
    console.log('Inserted dummy partial invoice:', inserted.id);

    // 2. Fetch using new logic (Paid OR Partial)
    const { data: fetched, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', inserted.id)
        .in('status', ['Paid', 'Partial']);

    if (fetchError) {
        console.error('Failed to fetch invoice:', fetchError);
    } else if (fetched && fetched.length > 0) {
        console.log('SUCCESS: Generated Partial invoice was successfully fetched with new logic.');
        console.log('Fetched Data:', fetched[0]);
    } else {
        console.error('FAILURE: Could not fetch the partial invoice with new logic.');
    }

    // 3. Cleanup
    const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', inserted.id);

    if (deleteError) {
        console.error('Failed to clean up dummy invoice:', deleteError);
    } else {
        console.log('Cleanup successful.');
    }
}

verifyFix();
