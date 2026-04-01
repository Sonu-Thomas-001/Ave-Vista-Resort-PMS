import { Database } from '@/lib/database.types';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Guest = Database['public']['Tables']['guests']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];

export interface DashboardMetrics {
  checkIns: number;
  checkOuts: number;
  occupancy: number;
  revenue: number;
  availableRooms: number;
  roomStatusCounts: Record<string, number>;
  totalBookings: number;
  totalGuests: number;
  avgStayDuration: number;
  avgDailyRate: number;
}

export type BookingWithGuest = Booking & {
  guests: Pick<Guest, 'first_name' | 'last_name'> | null;
};

export interface Activity {
  id: string;
  text: string;
  time: string;
  type: 'guest' | 'task' | 'payment' | 'booking' | 'system';
  timestamp: Date;
}
