import { apiClient } from './client';
import type { CurrentTrip } from '@/types/trip.type';

/**
 * Fetch current trip for a driver
 * @param driverId - The ID of the driver
 * @returns Current trip data or null if no active trip
 */
export const getCurrentTrip = async (driverId: number): Promise<CurrentTrip | null> => {
  const response = await apiClient.get<CurrentTrip | null>(`/current-trip/${driverId}`);
  return response.data;
};

/**
 * Verify passenger ticket via QR code
 * @param bookingId - The booking ID to verify
 * @returns Verification message
 */
export const verifyTicket = async (bookingId: number): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/verify-ticket/${bookingId}`);
  return response.data;
};
