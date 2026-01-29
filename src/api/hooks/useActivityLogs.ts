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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
