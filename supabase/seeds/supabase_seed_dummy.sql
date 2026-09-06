-- Insert Dummy Guests (if not exists)
INSERT INTO guests (first_name, last_name, email, phone, is_vip, notes)
VALUES
('Rahul', 'Sharma', 'rahul.s@example.com', '9876543210', false, 'Likes extra pillows'),
('Priya', 'Verma', 'priya.v@example.com', '9898989898', true, 'Anniversary trip'),
('Amit', 'Patel', 'amit.p@example.com', '9123456780', false, 'Late check-in expected'),
('Sneha', 'Reddy', 'sneha.r@example.com', '9000012345', false, 'Allergic to nuts'),
('John', 'Smith', 'john.smith@test.com', '8888888888', true, 'Corporate booking'),
('Vikram', 'Singh', 'vikram.s@example.com', '7777777777', false, 'Needs cab pickup'),
('Anjali', 'Devi', 'anjali.d@example.com', '6666666666', false, 'Travelling with kids');

-- 1. PAST Booking (Checked Out) - Room A1
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
SELECT g.id, r.id, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 'Checked Out', 15000, 2, 0, 'Walk-in'
FROM guests g, rooms r WHERE g.email = 'rahul.s@example.com' AND (r.room_number = 'A1' OR r.room_number LIKE 'A%') LIMIT 1;

-- 2. ACTIVE Booking (Checked In - Today) - Room A4
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
SELECT g.id, r.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'Checked In', 22000, 2, 1, 'OTA'
FROM guests g, rooms r WHERE g.email = 'priya.v@example.com' AND (r.room_number = 'A4' OR r.room_number LIKE 'B%') LIMIT 1;

-- 3. UPCOMING (Arriving Today but not Checked In yet) - Room A2 (fallback to A1 if A2 missing)
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
SELECT g.id, r.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'Confirmed', 18000, 2, 0, 'Website'
FROM guests g, rooms r WHERE g.email = 'amit.p@example.com' AND r.room_number = 'A2' LIMIT 1;

-- 4. UPCOMING (Arriving Tomorrow) - Room A3
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
SELECT g.id, r.id, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 'Confirmed', 12000, 1, 0, 'Agoda'
FROM guests g, rooms r WHERE g.email = 'sneha.r@example.com' AND r.room_number = 'A3' LIMIT 1;

-- 5. FUTURE Booking (Next Week) - Room A1
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
SELECT g.id, r.id, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 'Confirmed', 45000, 4, 2, 'Direct'
FROM guests g, rooms r WHERE g.email = 'john.smith@test.com' AND r.room_number = 'A1' LIMIT 1;

-- 6. FUTURE Booking (Next Month) - Room A4
INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, adults, children, source)
LIMIT 1;

-- 7. Fix Schema (if columns are missing due to early migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'guest_name') THEN
        ALTER TABLE invoices ADD COLUMN guest_name VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'room_number') THEN
        ALTER TABLE invoices ADD COLUMN room_number VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'total_amount') THEN
        ALTER TABLE invoices ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'paid_amount') THEN
        ALTER TABLE invoices ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'status') THEN
        ALTER TABLE invoices ADD COLUMN status VARCHAR DEFAULT 'Pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_date') THEN
        ALTER TABLE invoices ADD COLUMN invoice_date DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_mode') THEN
        ALTER TABLE invoices ADD COLUMN payment_mode VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'gst_rate') THEN
        ALTER TABLE invoices ADD COLUMN gst_rate NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'is_partial') THEN
        ALTER TABLE invoices ADD COLUMN is_partial BOOLEAN DEFAULT FALSE;
    END IF;

    -- Handle legacy amount column (drop not null to allow our inserts)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'amount') THEN
        ALTER TABLE invoices ALTER COLUMN amount DROP NOT NULL;
    END IF;
END $$;

-- 8. Generate Invoices from Bookings
INSERT INTO invoices (invoice_number, booking_id, guest_name, room_number, total_amount, paid_amount, status, invoice_date, payment_mode, gst_rate, is_partial)
SELECT
    'INV-2026-' || LPAD(ROW_NUMBER() OVER(ORDER BY b.id)::TEXT, 3, '0'),
    b.id,
    g.first_name || ' ' || g.last_name,
    r.room_number,
    b.total_amount,
    CASE WHEN b.status = 'Checked Out' THEN b.total_amount WHEN b.status = 'Checked In' THEN 5000 ELSE 0 END,
    CASE WHEN b.status = 'Checked Out' THEN 'Paid' WHEN b.status = 'Checked In' THEN 'Partial' ELSE 'Pending' END,
    b.check_in_date,
    CASE WHEN b.status = 'Checked Out' THEN 'Card' ELSE 'Cash' END,
    12,
    CASE WHEN b.status = 'Checked In' THEN TRUE ELSE FALSE END
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN rooms r ON b.room_id = r.id;
