import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import type { CreateBookingRequest, CreateBookingResponse, UserBooking } from '@/types/booking.type';

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

/**
 * Hook to fetch all bookings for a user
 * @param userId - User ID to fetch bookings for
 */
export const useUserBookings = (userId: number | null | undefined) => {
  return useQuery<UserBooking[], Error>({
    queryKey: bookingQueryKeys.userBookings(userId || 0),
    queryFn: () => bookingApi.getUserBookings(userId!),
    enabled: !!userId,
  });
};
