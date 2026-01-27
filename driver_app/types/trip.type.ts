// Booking information (previously Passenger)
export interface Booking {
  bookingId: number;
  passangerId: number;
  name: string;
  seatCount: number;
  ticketNumber: string;
  bookingStatus: string;
}

// For backward compatibility
export type Passenger = Booking;

// Current trip response
export interface CurrentTrip {
  tripId: number;
  driverId: number;
  busNumber: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  estimatedEndTime: string;
  passengerCount: number;
  bookings: Booking[];
}

