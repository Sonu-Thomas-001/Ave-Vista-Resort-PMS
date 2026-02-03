export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    role: 'Admin' | 'Manager' | 'Reception'
                    shift: 'Morning' | 'Evening' | 'Night'
                    status: string | null
                    created_at: string
                    email: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    role?: 'Admin' | 'Manager' | 'Reception'
                    shift?: 'Morning' | 'Evening' | 'Night'
                    status?: string | null
                    created_at?: string
                    email?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    role?: 'Admin' | 'Manager' | 'Reception'
                    shift?: 'Morning' | 'Evening' | 'Night'
                    status?: string | null
                    created_at?: string
                    email?: string | null
                }
            }
            rooms: {
                Row: {
                    created_at: string
                    id: string
                    image_url: string | null
                    max_occupancy: number
                    price_per_night: number
                    room_number: string
                    status: "Clean" | "Dirty" | "Maintenance" | "Occupied"
                    type: string
                    amenities: string[] | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    max_occupancy?: number
                    price_per_night: number
                    room_number: string
                    status?: "Clean" | "Dirty" | "Maintenance" | "Occupied"
                    type: string
                    amenities?: string[] | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    max_occupancy?: number
                    price_per_night?: number
                    room_number?: string
                    status?: "Clean" | "Dirty" | "Maintenance" | "Occupied"
                    type?: string
                    amenities?: string[] | null
                }
            }
            guests: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string
                    email: string | null
                    phone: string | null
                    id_proof_url: string | null
                    is_vip: boolean
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    first_name: string
                    last_name: string
                    email?: string | null
                    phone?: string | null
                    id_proof_url?: string | null
                    is_vip?: boolean
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string
                    email?: string | null
                    phone?: string | null
                    id_proof_url?: string | null
                    is_vip?: boolean
                    notes?: string | null
                    created_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    guest_id: string
                    room_id: string
                    check_in_date: string
                    check_out_date: string
                    status: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
                    total_amount: number
                    adults: number
                    children: number
                    source: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    guest_id: string
                    room_id: string
                    check_in_date: string
                    check_out_date: string
                    status?: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
                    total_amount: number
                    adults?: number
                    children?: number
                    source?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    guest_id?: string
                    room_id?: string
                    check_in_date?: string
                    check_out_date?: string
                    status?: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
                    total_amount?: number
                    adults?: number
                    children?: number
                    source?: string | null
                    created_at?: string
                }
            }

            app_settings: {
                Row: {
                    id: number
                    resort_name: string | null
                    contact_email: string | null
                    address: string | null
                    gst_number: string | null
                    tax_rate: number | null
                    updated_at: string
                }
                Update: {
                    resort_name?: string | null
                    contact_email?: string | null
                    address?: string | null
                    gst_number?: string | null
                    tax_rate?: number | null
                }
            }
            invoices: {
                Row: {
                    id: string
                    created_at: string
                    invoice_number: string
                    booking_id: string | null
                    guest_name: string
                    room_number: string
                    total_amount: number
                    paid_amount: number
                    status: 'Paid' | 'Partial' | 'Pending'
                    invoice_date: string
                    payment_mode: 'Cash' | 'Card' | 'UPI' | null
                    gst_rate: number | null
                    is_partial: boolean | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    invoice_number: string
                    booking_id?: string | null
                    guest_name: string
                    room_number: string
                    total_amount?: number
                    paid_amount?: number
                    status?: 'Paid' | 'Partial' | 'Pending'
                    invoice_date?: string
                    payment_mode?: 'Cash' | 'Card' | 'UPI' | null
                    gst_rate?: number | null
                    is_partial?: boolean | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    invoice_number?: string
                    booking_id?: string | null
                    guest_name?: string
                    room_number?: string
                    total_amount?: number
                    paid_amount?: number
                    status?: 'Paid' | 'Partial' | 'Pending'
                    invoice_date?: string
                    payment_mode?: 'Cash' | 'Card' | 'UPI' | null
                    gst_rate?: number | null
                    is_partial?: boolean | null
                }
            }
        }
    }
}

