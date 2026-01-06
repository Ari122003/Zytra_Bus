import { apiClient } from './client';
import type { CreateBookingRequest, CreateBookingResponse } from '@/types/booking.type';

/**
 * Booking API service
 */
export const bookingApi = {
  /**
   * Create a booking for a trip with specified seats
   * @param request - Booking request with tripId, userId, amount, and seatNumbers
   * @returns Promise with booking confirmation
   */
  createBooking: async (request: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await apiClient.post<CreateBookingResponse>('/bookings/create', request);
    return response.data;
  },
};
