import { useQuery } from '@tanstack/react-query';
import { ActivityLogsService } from '../services/activityLogsService';
import { ActivityLogQueryParams, ActivityLogsResponse, AdminUsersResponse } from '../types';

export const activityLogKeys = {
  all: ['activityLogs'] as const,
  lists: () => [...activityLogKeys.all, 'list'] as const,
  list: (params?: ActivityLogQueryParams) => [...activityLogKeys.lists(), params] as const,
  users: () => [...activityLogKeys.all, 'users'] as const,
};

export const useActivityLogs = (params?: ActivityLogQueryParams) => {
  const {
    data: activityLogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: activityLogKeys.list(params || {}),
    queryFn: () => ActivityLogsService.getActivityLogs(params),
    staleTime: 0, // Data is immediately stale, always fetch fresh
    gcTime: 5 * 60 * 1000, // 5 minutes (keep in cache for 5 min but always refetch on mount)
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
  });

  // Extract logs and pagination from response
  const logs = activityLogsData?.data?.data || [];
  const pagination = activityLogsData?.data ? {
    total: activityLogsData.data.total,
    page: activityLogsData.data.page,
    limit: activityLogsData.data.limit,
    totalPages: activityLogsData.data.totalPages,
  } : undefined;

  return {
    logs,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useAdminUsers = () => {
  const {
    data: adminUsersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: activityLogKeys.users(),
    queryFn: () => ActivityLogsService.getAdminUsers(),
    staleTime: 10 * 60 * 1000, // 10 minutes (admin users don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const users = adminUsersData?.data?.users || [];

  return {
    users,
    isLoading,
    error,
    refetch,
  };
};
