import { useQuery } from '@tanstack/react-query';
import { DashboardService, DashboardStatsSummary } from '@/api/services/dashboardService';

export const useDashboardStatsSummary = () => {
  return useQuery({
    queryKey: ['dashboard-stats-summary'],
    queryFn: async () => {
      const response = await DashboardService.getDashboardStatsSummary();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch dashboard stats');
    },
    staleTime: 60000, // 1 minute - stats don't change frequently
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};
