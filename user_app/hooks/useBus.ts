import { useQuery, useMutation } from '@tanstack/react-query';
import { busApi } from '@/lib/api/bus.api';
import type { SearchBusRequest, SearchBusesResponse, TripDetailsResponse, LockSeatsRequest, LockSeatsResponse } from '@/types/bus.type';

export const busQueryKeys = {
  all: ['buses'] as const,
  search: (params: SearchBusRequest) => [...busQueryKeys.all, 'search', params] as const,
  tripDetails: (tripId: number) => [...busQueryKeys.all, 'trip', tripId] as const,
};

export const useSearchBuses = (
  params: SearchBusRequest,
  enabled: boolean = true
) => {
  return useQuery<SearchBusesResponse, Error>({
    queryKey: busQueryKeys.search(params),
    queryFn: () => busApi.searchBuses(params),
    enabled: enabled && !!params.source && !!params.destination && !!params.travelDate,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useTripDetails = (
  tripId: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery<TripDetailsResponse, Error>({
    queryKey: busQueryKeys.tripDetails(tripId!),
    queryFn: () => busApi.getTripDetails(tripId!),
    enabled: enabled && !!tripId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    retry: 2,
  });
};

export const useLockSeats = () => {
  return useMutation<LockSeatsResponse, Error, LockSeatsRequest>({
    mutationFn: (request: LockSeatsRequest) => busApi.lockSeats(request),
  });
};
