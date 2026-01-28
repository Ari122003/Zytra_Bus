import { apiClient } from './client';
import type { CreateBookingRequest, CreateBookingResponse, UserBooking, UserBookingsResponse, BookingDetail } from '@/types/booking.type';

export const bookingApi = {
  createBooking: async (request: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await apiClient.post<CreateBookingResponse>('/booking/create', request);
    return response.data;
  },

  getUserBookings: async (userId: number): Promise<UserBooking[]> => {
    const response = await apiClient.get<UserBookingsResponse>(`/booking/${userId}`);
    return response.data.bookings;
  },

  getBookingById: async (bookingId: number): Promise<BookingDetail> => {
    const response = await apiClient.get<BookingDetail>(`/booking/details/${bookingId}`);
    return response.data;
  },
};
