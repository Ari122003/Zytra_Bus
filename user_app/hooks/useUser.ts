import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import type { GetUserDetailsResponse } from '@/types/user.type';

export const userQueryKeys = {
  all: ['user'] as const,
  details: (userId: number) => [...userQueryKeys.all, 'details', userId] as const,
};

export const useUserDetails = (
  userId: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery<GetUserDetailsResponse, Error>({
    queryKey: userQueryKeys.details(userId!),
    queryFn: () => userApi.getUserDetails(userId!),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

interface UpdateProfileImageCallbacks {
  onSuccess?: (response: { message: string }, imageData: string) => void;
  onError?: (error: Error) => void;
}

export const useUpdateProfileImage = (
  userId: number | null | undefined,
  callbacks?: UpdateProfileImageCallbacks
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUrl: string) => userApi.updateProfileImage(userId!, imageUrl),
    onSuccess: (response, imageData) => {
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

export const useUpdateUserInfo = (
  userId: number | null | undefined,
  callbacks?: UpdateUserInfoCallbacks
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; dob: string }) => userApi.updateUserInfo(userId!, data),
    onSuccess: (response, variables) => {
      const { name, dob } = variables;
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
      callbacks?.onSuccess?.(response, variables);
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
};
