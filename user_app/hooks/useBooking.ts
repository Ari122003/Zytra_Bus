import { useMutation } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import type { CreateBookingRequest, CreateBookingResponse } from '@/types/booking.type';

/**
 * Query keys for booking-related queries
 */
export const bookingQueryKeys = {
  all: ['bookings'] as const,
  detail: (bookingId: number) => [...bookingQueryKeys.all, 'detail', bookingId] as const,
  userBookings: (userId: number) => [...bookingQueryKeys.all, 'user', userId] as const,
};

/**
 * Hook to create a booking
 * Creates a booking after seats are locked
 */
export const useCreateBooking = () => {
  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: (request: CreateBookingRequest) => bookingApi.createBooking(request),
  });
};
