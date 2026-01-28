export interface CreateBookingRequest {
  tripId: number;
  userId: number;
  amount: number;
  seatNumbers: string[];
}

export interface CreateBookingResponse {
  message: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface UserBooking {
  bookingId: number;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
}

export interface UserBookingsResponse {
  bookings: UserBooking[];
}

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

export interface BookingDetail {
  bookingId: number;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  amount: number;
  seatNumbers: string[];
  distance: number;
  travelTime: string;
  busType: string;
  busNumber: string;
  ticketQr: string;
  bookingStatus: string;
  driverName: string;
  driverContact: string;
}
