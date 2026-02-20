import { useQuery } from '@tanstack/react-query';
import { InvestorsService } from '../services/investorsService';
import { 
  InvestorsListResponse,
  InvestorDetails,
  InvestorsQueryParams 
} from '../types';

/**
 * Hook to fetch paginated list of investors with filters
 */
export const useInvestors = (params?: InvestorsQueryParams) => {
  return useQuery({
    queryKey: ['investors', params],
    queryFn: () => InvestorsService.getInvestors(params),
    select: (response) => response.data,
  });
};

/**
 * Hook to fetch investor details by ID
 */
export const useInvestor = (id: string | null) => {
  return useQuery({
    queryKey: ['investor', id],
    queryFn: () => InvestorsService.getInvestorById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};
