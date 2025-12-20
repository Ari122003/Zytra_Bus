import { apiClient } from './client';
import type { SearchBusesResponse, SearchBusRequest, TripDetailsResponse } from '@/types/bus.type';

/**
 * Bus API service
 */
export const busApi = {
  /**
   * Search for available buses
   * @param params - Search parameters (source, destination, travelDate)
   * @returns Promise with search results
   */
  searchBuses: async (params: SearchBusRequest): Promise<SearchBusesResponse> => {
    const queryParams = new URLSearchParams({
      source: params.source,
      destination: params.destination,
      travelDate: params.travelDate,
    });

    // Add current time if provided, otherwise use current time
    if (params.currentTime) {
      queryParams.append('currentTime', params.currentTime);
    } else {
      // Format current time as HH:mm:ss
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0]; // Gets HH:mm:ss
      queryParams.append('currentTime', currentTime);
    }

    const response = await apiClient.get<SearchBusesResponse>(
      `/buses/search?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get trip details by trip ID
   * @param tripId - The trip ID to fetch details for
   * @returns Promise with trip details including seats
   */
  getTripDetails: async (tripId: number): Promise<TripDetailsResponse> => {
    const response = await apiClient.get<TripDetailsResponse>(`/trips/${tripId}`);
    return response.data;
  },
};