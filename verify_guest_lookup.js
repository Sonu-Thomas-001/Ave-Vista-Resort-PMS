
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

async function verifySearch() {
    console.log('Verifying Guest Lookup...');

    const searchQuery = 'Test';

    try {
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
            .limit(1);

        if (error) {
            console.error('Search query failed:', error);
            if (error.code === '42703') { // Undefined column
                console.log('NOTE: If this error is about id_proof_number, the migration has not been run.');
            }
        } else {
            console.log('Search query successful. Found:', data?.length);
            if (data && data.length > 0) {
                console.log('Sample Guest:', data[0].first_name);
            }
        }
    } catch (e) {
        console.error('Exception during search:', e);
    }
}

verifySearch();
