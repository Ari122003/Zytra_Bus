import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import type { GetUserDetailsResponse } from '@/types/user.type';

/**
 * Query keys for user-related queries
 */
export const userQueryKeys = {
  all: ['user'] as const,
  details: (userId: number) => [...userQueryKeys.all, 'details', userId] as const,
};

/**
 * Hook to fetch user details
 * @param userId - The user ID to fetch details for
 * @param enabled - Whether the query should be enabled
 */
export const useUserDetails = (
  userId: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery<GetUserDetailsResponse, Error>({
    queryKey: userQueryKeys.details(userId!),
    queryFn: () => userApi.getUserDetails(userId!),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

interface UpdateProfileImageCallbacks {
  onSuccess?: (response: { message: string }, imageData: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update user profile image
 * @param userId - The user ID to update image for
 * @param callbacks - Optional callbacks (onSuccess, onError)
 */
export const useUpdateProfileImage = (
  userId: number | null | undefined,
  callbacks?: UpdateProfileImageCallbacks
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl: string) => userApi.updateProfileImage(userId!, imageUrl),
    onSuccess: (response, imageData) => {
      // Update React Query cache
      if (userId) {
        queryClient.setQueryData(
          userQueryKeys.details(userId),
          (prev: GetUserDetailsResponse | undefined) => ({
            ...(prev || {}),
            imageUrl: imageData,
          })
        );
        queryClient.invalidateQueries({ queryKey: userQueryKeys.details(userId) });
      }
      // Call custom onSuccess if provided
      callbacks?.onSuccess?.(response, imageData);
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
};

interface UpdateUserInfoCallbacks {
  onSuccess?: (response: { message: string }, variables: { name: string; dob: string }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update user info (name and DOB)
 * @param userId - The user ID to update info for
 * @param callbacks - Optional callbacks (onSuccess, onError)
 */
export const useUpdateUserInfo = (
  userId: number | null | undefined,
  callbacks?: UpdateUserInfoCallbacks
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; dob: string }) => userApi.updateUserInfo(userId!, data),
    onSuccess: (response, variables) => {
      const { name, dob } = variables;
      // Update React Query cache
      if (userId) {
        queryClient.setQueryData(
          userQueryKeys.details(userId),
          (prev: GetUserDetailsResponse | undefined) => ({
            ...(prev || {}),
            name,
            dob,
          })
        );
        queryClient.invalidateQueries({ queryKey: userQueryKeys.details(userId) });
      }
      // Call custom onSuccess if provided
      callbacks?.onSuccess?.(response, variables);
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
};
