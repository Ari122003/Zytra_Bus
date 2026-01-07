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
 * User booking item from the API
 */
export interface UserBooking {
  bookingId: number;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
}

/**
 * Response wrapper for user bookings API
 */
export interface UserBookingsResponse {
  bookings: UserBooking[];
}

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
