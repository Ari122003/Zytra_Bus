/**
 * Request body for creating a booking
 */
export interface CreateBookingRequest {
  tripId: number;
  userId: number;
  amount: number;
  seatNumbers: string[];
}

/**
 * Response from create booking API
 */
export interface CreateBookingResponse {
  message: string;
}

/**
 * Booking status enum
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/**
 * Booking details
 */
export interface Booking {
  bookingId: number;
  tripId: number;
  userId: number;
  amount: number;
  seatNumbers: string[];
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
