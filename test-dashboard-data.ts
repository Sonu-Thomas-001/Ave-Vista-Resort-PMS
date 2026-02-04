// Test script to verify dashboard data connectivity
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
    console.log('🔍 Testing Dashboard Data Connectivity...\n');

    // Test 1: Bookings Table
    console.log('1️⃣ Testing Bookings Table...');
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, check_in_date, check_out_date, status, total_amount, guests_count, source')
        .limit(5);

    if (bookingsError) {
        console.error('❌ Bookings Error:', bookingsError.message);
    } else {
        console.log(`✅ Bookings: Found ${bookings?.length || 0} records`);
        console.log('Sample:', bookings?.[0]);
    }

    // Test 2: Rooms Table
    console.log('\n2️⃣ Testing Rooms Table...');
    const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, room_number, status, price_per_night')
        .limit(5);

    if (roomsError) {
        console.error('❌ Rooms Error:', roomsError.message);
    } else {
        console.log(`✅ Rooms: Found ${rooms?.length || 0} records`);
        console.log('Sample:', rooms?.[0]);
    }

    // Test 3: Invoices Table
    console.log('\n3️⃣ Testing Invoices Table...');
    const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, paid_amount, status, created_at')
        .limit(5);

    if (invoicesError) {
        console.error('❌ Invoices Error:', invoicesError.message);
    } else {
        console.log(`✅ Invoices: Found ${invoices?.length || 0} records`);
        console.log('Sample:', invoices?.[0]);
    }

    // Test 4: Guests Table
    console.log('\n4️⃣ Testing Guests Table...');
    const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('id, first_name, last_name, email')
        .limit(5);

    if (guestsError) {
        console.error('❌ Guests Error:', guestsError.message);
    } else {
        console.log(`✅ Guests: Found ${guests?.length || 0} records`);
        console.log('Sample:', guests?.[0]);
    }

    // Test 5: Real-time Subscription
    console.log('\n5️⃣ Testing Real-time Subscription...');
    const channel = supabase
        .channel('test_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
            console.log('📡 Real-time event received:', payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Real-time subscription active');
            } else {
                console.log('⚠️ Subscription status:', status);
            }
        });

    // Wait a bit then cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    await supabase.removeChannel(channel);

    console.log('\n✨ Dashboard connectivity test complete!');
}

testDashboardData().catch(console.error);
