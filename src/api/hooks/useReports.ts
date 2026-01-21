import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReportService, Report, ReportListResponse, CreateReportRequest, UpdateReportRequest, ReportQueryParams, ReportStats, ReportFilterOptions } from '../services/reportService';
import { useToast } from '@/hooks/use-toast';

interface UseReportsOptions extends ReportQueryParams {
  autoFetch?: boolean;
}

interface UseReportsReturn {
  // Data
  reports: Report[];
  selectedReport: Report | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: ReportStats | null;
  filterOptions: ReportFilterOptions | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingStats: boolean;
  isLoadingFilters: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchReports: (params?: UseReportsOptions) => Promise<void>;
  getReport: (id: string) => Promise<void>;
  createReport: (data: CreateReportRequest) => Promise<Report | null>;
  updateReport: (id: string, data: UpdateReportRequest) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  getStats: () => Promise<void>;
  getFilterOptions: () => Promise<void>;
  exportReports: (params?: ReportQueryParams) => Promise<boolean>;
  
  // State setters
  setSelectedReport: (report: Report | null) => void;
  clearError: () => void;
}

export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Stats and filter options
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<ReportFilterOptions | null>(null);

  // Loading states for stats and filters
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Ref to prevent multiple simultaneous API calls
  const isFetchingRef = useRef(false);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [
    options.page,
    options.limit,
    options.search,
    options.status,
    options.severity,
    options.category,
    options.parentCategory,
    options.startDate,
    options.endDate,
    options.sortBy,
    options.sortOrder,
    options.autoFetch
  ]);

  // Fetch reports
  const fetchReports = useCallback(async (params?: UseReportsOptions) => {
    // Prevent multiple simultaneous API calls
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const queryParams: ReportQueryParams = {
        page: params?.page || memoizedOptions.page || 1,
        limit: params?.limit || memoizedOptions.limit || 10,
        search: params?.search || memoizedOptions.search,
        status: params?.status || memoizedOptions.status,
        severity: params?.severity || memoizedOptions.severity,
        category: params?.category || memoizedOptions.category,
        parentCategory: params?.parentCategory || memoizedOptions.parentCategory,
        startDate: params?.startDate || memoizedOptions.startDate,
        endDate: params?.endDate || memoizedOptions.endDate,
        sortBy: params?.sortBy || memoizedOptions.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || memoizedOptions.sortOrder || 'desc',
      };
      
      const response = await ReportService.getReports(queryParams);
      
      if (response.success && response.data) {
        setReports(response.data.reports);
        setPagination({
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPrevPage: response.data.pagination.hasPrevPage,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [memoizedOptions, toast]);

  // Get single report
  const getReport = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ReportService.getReport(id);
      
      if (response.success && response.data) {
        setSelectedReport(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create report
  const createReport = useCallback(async (data: CreateReportRequest): Promise<Report | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await ReportService.createReport(data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Report created successfully",
        });
        // Refresh the list
        await fetchReports();
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [toast, fetchReports]);

  // Update report
  const updateReport = useCallback(async (id: string, data: UpdateReportRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await ReportService.updateReport(id, data);
      
      if (response.success && response.data) {
        // Update local state
        setReports(prev => prev.map(report => 
          report.id === id ? response.data : report
        ));
        
        if (selectedReport?.id === id) {
          setSelectedReport(response.data);
        }
        
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedReport, toast]);

  // Delete report
  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await ReportService.deleteReport(id);
      
      if (response.success) {
        // Remove from local state
        setReports(prev => prev.filter(report => report.id !== id));
        
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
        
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedReport, toast]);

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setError(null);
      
      const response = await ReportService.getReportStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Get filter options
  const getFilterOptions = useCallback(async () => {
    try {
      setIsLoadingFilters(true);
      setError(null);
      
      const response = await ReportService.getFilterOptions();
      
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter options';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingFilters(false);
    }
  }, [toast]);

  // Export reports
  const exportReports = useCallback(async (params?: ReportQueryParams): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const blob = await ReportService.exportReports(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Reports exported successfully",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export reports';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (memoizedOptions.autoFetch !== false) {
      fetchReports();
    }
  }, [fetchReports, memoizedOptions.autoFetch]);

  return {
    // Data
    reports,
    selectedReport,
    pagination,
    stats,
    filterOptions,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingStats,
    isLoadingFilters,
    
    // Error state
    error,
    
    // Actions
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    getStats,
    getFilterOptions,
    exportReports,
    
    // State setters
    setSelectedReport,
    clearError,
  };
}
