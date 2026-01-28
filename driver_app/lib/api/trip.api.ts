import { apiClient } from './client';
import type { CurrentTrip, GetUpcomingTripsResponse } from '@/types/trip.type';

export const getCurrentTrip = async (driverId: number): Promise<CurrentTrip | null> => {
  const response = await apiClient.get<CurrentTrip | null>(`/current-trip/${driverId}`);
  return response.data;
};

export const getUpcomingTrips = async (driverId: number): Promise<GetUpcomingTripsResponse> => {
  const response = await apiClient.get<GetUpcomingTripsResponse>(`/upcoming-trips/${driverId}`);
  return response.data;
};

export const verifyTicket = async (bookingId: number): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/verify-ticket/${bookingId}`);
  return response.data;
};
