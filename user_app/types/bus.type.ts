export interface BusResult {
  tripId: number;
  busNumber: string;
  busDescription: string;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  fare: number;
}

export interface SearchBusesResponse {
  results: BusResult[];
}

export interface SearchBusRequest {
  source: string;
  destination: string;
  travelDate: string;
  currentTime?: string;
}

export type SeatStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface Seat {
  seatNumber: string;
  status?: SeatStatus;
  lockOwner?: number;
  lockedUntil?: string;
  isBooked?: boolean;
}

export interface TripDetailsResponse {
  tripId: number;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  busNumber: string;
  busType: string;
  distanceInKm: number;
  availableSeats: number;
  fare: number;
  seatMatrix: Seat[][];
  totalRows: number;
  seatsPerRow: number;
}

export interface Bus {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  busType: string;
}

export interface LockSeatsRequest {
  tripId: number;
  seats: string[];
  lockOwner?: number;
}

export interface LockSeatsResponse {
  message: string;
  lockedSeats: string[];
  lockExpiresAt: string;
}
