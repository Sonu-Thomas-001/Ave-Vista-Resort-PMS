-- Function to fetch aggregated dashboard metrics in a single network request
CREATE OR REPLACE FUNCTION get_dashboard_metrics(target_date DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    check_ins INT;
    check_outs INT;
    total_rooms INT;
    occupied_rooms INT;
    available_rooms INT;
    calculated_occupancy INT;
    total_revenue NUMERIC;
    total_bookings INT;
    total_guests INT;
    avg_stay_duration INT;
    avg_daily_rate NUMERIC;
    room_status_counts JSON;
BEGIN
    -- 1. Today's Check-ins and Check-outs
    SELECT COUNT(*) INTO check_ins FROM bookings WHERE check_in_date = target_date;
    SELECT COUNT(*) INTO check_outs FROM bookings WHERE check_out_date = target_date;

    -- 2. Room Statistics
    SELECT COUNT(*) INTO total_rooms FROM rooms;
    SELECT COUNT(*) INTO occupied_rooms FROM rooms WHERE status = 'Occupied';
    SELECT COUNT(*) INTO available_rooms FROM rooms WHERE status = 'Clean';
    
    IF total_rooms > 0 THEN
        calculated_occupancy := ROUND((occupied_rooms::NUMERIC / total_rooms::NUMERIC) * 100);
    ELSE
        calculated_occupancy := 0;
    END IF;

    -- Room Status Distribution
    SELECT json_object_agg(status, count) INTO room_status_counts
    FROM (
        SELECT status, COUNT(*) as count FROM rooms GROUP BY status
    ) sub;

    -- 3. Total Current Revenue (Sum of Paid/Partial Invoices)
    SELECT COALESCE(SUM(paid_amount), 0) INTO total_revenue 
    FROM invoices 
    WHERE status IN ('Paid', 'Partial');

    -- 4. Quick Stats
    SELECT COUNT(*), COALESCE(SUM(guests_count), 0)
    INTO total_bookings, total_guests
    FROM bookings;

    -- Calculate Average Stay Duration (in days) and Average Daily Rate (ADR)
    SELECT 
        COALESCE(AVG(check_out_date - check_in_date), 0),
        COALESCE(AVG(total_amount / NULLIF((check_out_date - check_in_date), 0)), 0)
    INTO avg_stay_duration, avg_daily_rate
    FROM bookings 
    WHERE check_out_date > check_in_date;

    -- Build the JSON object to return
    result := json_build_object(
        'checkIns', check_ins,
        'checkOuts', check_outs,
        'occupancy', calculated_occupancy,
        'revenue', total_revenue,
        'availableRooms', available_rooms,
        'roomStatusCounts', COALESCE(room_status_counts, '{}'::json),
        'totalBookings', total_bookings,
        'totalGuests', total_guests,
        'avgStayDuration', ROUND(avg_stay_duration),
        'avgDailyRate', ROUND(avg_daily_rate)
    );

    RETURN result;
END;
$$;
