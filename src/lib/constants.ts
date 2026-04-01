export const ROOM_STATUS = {
  OCCUPIED: 'Occupied',
  CLEAN: 'Clean',
  DIRTY: 'Dirty',
  MAINTENANCE: 'Maintenance',
  CLEANING: 'Cleaning',
} as const;

export type RoomStatusType = typeof ROOM_STATUS[keyof typeof ROOM_STATUS];

export const ROOM_STATUS_COLORS: Record<RoomStatusType, string> = {
  [ROOM_STATUS.OCCUPIED]: '#3b82f6', // blue
  [ROOM_STATUS.CLEAN]: '#10b981',    // green
  [ROOM_STATUS.DIRTY]: '#ef4444',    // red
  [ROOM_STATUS.MAINTENANCE]: '#f59e0b', // orange
  [ROOM_STATUS.CLEANING]: '#6366f1'  // indigo
};

export const BOOKING_STATUS = {
  CHECKED_IN: 'Checked In',
  CONFIRMED: 'Confirmed',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
} as const;

export type BookingStatusType = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const INVOICE_STATUS = {
  PAID: 'Paid',
  PARTIAL: 'Partial',
  UNPAID: 'Unpaid',
} as const;

export type InvoiceStatusType = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];
