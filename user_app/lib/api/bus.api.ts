import { apiClient } from './client';
import type { SearchBusesResponse, SearchBusRequest, TripDetailsResponse, LockSeatsRequest, LockSeatsResponse } from '@/types/bus.type';

export const busApi = {
  searchBuses: async (params: SearchBusRequest): Promise<SearchBusesResponse> => {
    const queryParams = new URLSearchParams({
      source: params.source,
      destination: params.destination,
      travelDate: params.travelDate,
    });

    if (params.currentTime) {
      queryParams.append('currentTime', params.currentTime);
    } else {
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];
      queryParams.append('currentTime', currentTime);
    }

    const response = await apiClient.get<SearchBusesResponse>(
      `/buses/search?${queryParams.toString()}`
    );
    return response.data;
  },

  getTripDetails: async (tripId: number): Promise<TripDetailsResponse> => {
    const response = await apiClient.get<TripDetailsResponse>(`/trips/${tripId}`);
    const data = response.data;

    // API no longer returns seat matrix - it will be received via WebSocket
    // Initialize seatMatrix as empty array
    data.seatMatrix = data.seatMatrix || [];

    return data;
  },

  lockSeats: async (request: LockSeatsRequest): Promise<LockSeatsResponse> => {
    const response = await apiClient.post<LockSeatsResponse>('/seats/lock', request);
    return response.data;
  },
};