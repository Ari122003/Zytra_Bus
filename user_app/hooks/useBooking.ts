import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import type { CreateBookingRequest, CreateBookingResponse, UserBooking, BookingDetail } from '@/types/booking.type';

export const bookingQueryKeys = {
  all: ['bookings'] as const,
  detail: (bookingId: number) => [...bookingQueryKeys.all, 'detail', bookingId] as const,
  userBookings: (userId: number) => [...bookingQueryKeys.all, 'user', userId] as const,
};

export const useCreateBooking = () => {
  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: (request: CreateBookingRequest) => bookingApi.createBooking(request),
  });
};

export const useUserBookings = (userId: number | null | undefined) => {
  return useQuery<UserBooking[], Error>({
    queryKey: bookingQueryKeys.userBookings(userId || 0),
    queryFn: () => bookingApi.getUserBookings(userId!),
    enabled: !!userId,
  });
};

export const useBookingDetail = (bookingId: number | null | undefined) => {
  return useQuery<BookingDetail, Error>({
    queryKey: bookingQueryKeys.detail(bookingId || 0),
    queryFn: () => bookingApi.getBookingById(bookingId!),
    enabled: !!bookingId,
  });
};
