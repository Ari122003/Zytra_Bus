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
 * Seat information (SeatDTO from backend)
 * Note: Seats returned in seatMatrix are all available seats
 */
export interface Seat {
  seatNumber: string;
  price: number;
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