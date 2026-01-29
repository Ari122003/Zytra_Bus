import { apiClient } from './client';
import { storageKeys } from '@/lib/token';
import type { SearchBusesResponse, SearchBusRequest, TripDetailsResponse, LockSeatsRequest, LockSeatsResponse, SeatStatus } from '@/types/bus.type';

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

    let currentUserId: number | undefined;
    if (typeof window !== 'undefined') {
      try {
        const userProfile = localStorage.getItem(storageKeys.USER_PROFILE);
        if (userProfile) {
          const parsed = JSON.parse(userProfile);
          currentUserId = parsed?.id;
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
      }
    }

    const now = new Date();

    // Calculate seat availability status based on booking and lock state
    // Locked seats show as LOCKED_BY_OTHER unless owned by current user
    data.seatMatrix = data.seatMatrix.map(row =>
      row.map(seat => {
        let status: SeatStatus = 'AVAILABLE';

        if (seat.isBooked) {
          status = 'UNAVAILABLE';
        } else if (seat.lockedUntil) {
          const lockedUntilDate = new Date(seat.lockedUntil);
          if (lockedUntilDate > now) {
            if (seat.lockOwner === currentUserId) {
              status = 'AVAILABLE';
            } else {
              status = 'LOCKED_BY_OTHER';
            }
          } else {
            status = 'AVAILABLE';
          }
        } else {
          status = 'AVAILABLE';
        }

        return {
          ...seat,
          status,
        };
      })
    );

    return data;
  },

  lockSeats: async (request: LockSeatsRequest): Promise<LockSeatsResponse> => {
    const response = await apiClient.post<LockSeatsResponse>('/seats/lock', request);
    return response.data;
  },
};