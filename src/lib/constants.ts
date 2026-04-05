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

// Special room types with non-standard pricing
export const SPECIAL_ROOM_TYPES = {
  AUDITORIUM: 'Mini Auditorium',
  SWIMMING_POOL: 'Swimming Pool',
} as const;

/**
 * Returns the pricing unit label for a room type.
 * Mini Auditorium = /hour, Swimming Pool = /person, others = /night
 */
export function getPricingUnit(roomType: string): string {
  const typeLower = roomType.toLowerCase();
  if (typeLower.includes('auditorium')) return '/hour';
  if (typeLower.includes('pool') || typeLower.includes('swimming')) return '/person';
  return '/night';
}

/**
 * Returns the quantity label for a room type.
 * Mini Auditorium = "Hours", Swimming Pool = "Persons", others = "Nights"
 */
export function getQuantityLabel(roomType: string): string {
  const typeLower = roomType.toLowerCase();
  if (typeLower.includes('auditorium')) return 'Hours';
  if (typeLower.includes('pool') || typeLower.includes('swimming')) return 'Persons';
  return 'Nights';
}

/**
 * Check if a room type is a special (non-night-based) room
 */
export function isSpecialRoomType(roomType: string): boolean {
  const typeLower = roomType.toLowerCase();
  return typeLower.includes('auditorium') || typeLower.includes('pool') || typeLower.includes('swimming');
}
