import { apiClient } from './client';
import type { CreateBookingRequest, CreateBookingResponse, UserBooking, UserBookingsResponse } from '@/types/booking.type';

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
    const response = await apiClient.post<CreateBookingResponse>('/booking/create', request);
    return response.data;
  },

  /**
   * Get all bookings for a user
   * @param userId - User ID to fetch bookings for
   * @returns Promise with list of user bookings
   */
  getUserBookings: async (userId: number): Promise<UserBooking[]> => {
    const response = await apiClient.get<UserBookingsResponse>(`/booking/${userId}`);
    return response.data.bookings;
  },
};
