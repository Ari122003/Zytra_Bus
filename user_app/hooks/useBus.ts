import { useQuery } from '@tanstack/react-query';
import { busApi } from '@/lib/api/bus.api';
import type { SearchBusRequest, SearchBusesResponse } from '@/types/bus.type';

/**
 * Query keys for bus-related queries
 */
export const busQueryKeys = {
  all: ['buses'] as const,
  search: (params: SearchBusRequest) => [...busQueryKeys.all, 'search', params] as const,
};

/**
 * Hook to search for available buses
 * @param params - Search parameters (source, destination, travelDate)
 * @param enabled - Whether the query should be enabled
 */
export const useSearchBuses = (
  params: SearchBusRequest,
  enabled: boolean = true
) => {
  return useQuery<SearchBusesResponse, Error>({
    queryKey: busQueryKeys.search(params),
    queryFn: () => busApi.searchBuses(params),
    enabled: enabled && !!params.source && !!params.destination && !!params.travelDate,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    retry: 2,
  });
};
