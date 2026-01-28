export interface Booking {
  bookingId: number;
  passangerId: number;
  name: string;
  seatCount: number;
  ticketNumber: string;
  bookingStatus: string;
}

export type Passenger = Booking;

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

export interface UpcomingTripDTO {
  tripId: number;
  startLocation: string;
  endLocation: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
}

export interface GetUpcomingTripsResponse {
  driverId: number;
  upcomingTrips: UpcomingTripDTO[];
}

