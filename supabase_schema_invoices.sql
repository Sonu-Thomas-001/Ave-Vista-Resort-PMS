-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invoice_number VARCHAR NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    guest_name VARCHAR NOT NULL, -- Stored for historical accuracy even if booking changes
    room_number VARCHAR NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR CHECK (status IN ('Paid', 'Partial', 'Pending')) DEFAULT 'Pending',
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode VARCHAR CHECK (payment_mode IN ('Cash', 'Card', 'UPI')),
    gst_rate NUMERIC DEFAULT 0, -- 0, 12, 18
    is_partial BOOLEAN DEFAULT FALSE
);

-- RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for all users" ON invoices FOR ALL USING (true) WITH CHECK (true);
