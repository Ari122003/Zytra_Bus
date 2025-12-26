/**
 * Bus search result from the API
 */
export interface BusResult {
  tripId: number;
  busNumber: string;
  busDescription: string;
  source: string;
  destination: string;
  travelDate: string; // ISO date string (YYYY-MM-DD)
  departureTime: string; // Time string (HH:mm:ss)
  arrivalTime: string; // Time string (HH:mm:ss)
  availableSeats: number;
  fare: number;
}

/**
 * Response from search buses API
 */
export interface SearchBusesResponse {
  results: BusResult[];
}

/**
 * Request params for searching buses
 */
export interface SearchBusRequest {
  source: string;
  destination: string;
  travelDate: string;
  currentTime?: string;
}

/**
 * Seat status enum
 */
export type SeatStatus = 'AVAILABLE' | 'UNAVAILABLE';

/**
 * Seat information (SeatDTO from backend)
 */
export interface Seat {
  seatNumber: string;
  status?: SeatStatus; // Seat availability status
  lockOwner?: number;
  lockedUntil?: string;
  isBooked?: boolean;
}

/**
 * Trip details response from API
 */
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
  // Seat matrix: 12 rows (A-L), 4 columns per row (2x2 layout)
  seatMatrix: Seat[][];
  totalRows: number; // 12 rows (A-L)
  seatsPerRow: number; // 4 seats per row (2x2)
}

/**
 * Legacy Bus interface (for backward compatibility)
 * @deprecated Use BusResult instead
 */
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

/**
 * Request body for locking seats
 */
export interface LockSeatsRequest {
  tripId: number;
  seats: string[];
  // ID of the user locking the seats (maps to backend `lockOwner` Long field)
  lockOwner?: number;
}

/**
 * Response from lock seats API
 */
export interface LockSeatsResponse {
  message: string;
  lockedSeats: string[];
  lockExpiresAt: string; // ISO date string
}