import { apiClient } from './client';
import { storageKeys } from '@/lib/token';
import type { SearchBusesResponse, SearchBusRequest, TripDetailsResponse, LockSeatsRequest, LockSeatsResponse } from '@/types/bus.type';
import type { SeatStatus } from '@/types/bus.type';

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
    const data = response.data;

    // Get current user ID from localStorage
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

    // Apply seat status logic
    data.seatMatrix = data.seatMatrix.map(row =>
      row.map(seat => {
        let status: SeatStatus = 'AVAILABLE';

        if (seat.isBooked) {
          status = 'UNAVAILABLE';
        } else if (seat.lockedUntil) {
          const lockedUntilDate = new Date(seat.lockedUntil);
          if (lockedUntilDate > now) {
            // Seat is locked
            if (seat.lockOwner === currentUserId) {
              status = 'AVAILABLE';
            } else {
              status = 'UNAVAILABLE';
            }
          } else {
            // Lock has expired
            status = 'AVAILABLE';
          }
        } else {
          // No lock, not booked
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

  /**
   * Lock seats temporarily for booking
   * @param request - Lock seats request with tripId and seats array
   * @returns Promise with lock confirmation and expiry time
   */
  lockSeats: async (request: LockSeatsRequest): Promise<LockSeatsResponse> => {
    const response = await apiClient.post<LockSeatsResponse>('/seats/lock', request);
    return response.data;
  },
};