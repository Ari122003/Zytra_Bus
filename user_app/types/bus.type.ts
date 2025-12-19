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