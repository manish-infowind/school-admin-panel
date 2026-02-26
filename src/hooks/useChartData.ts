import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { DashboardService, AnalyticsData, UserGrowthResponse, ActiveUsersResponse, ConversionAnalyticsResponse, ConversionDataPoint } from "@/api/services/dashboardService";
import { ChartConfig } from "@/components/admin/dashboard/ChartFilters";

// Generate mock analytics data based on date range
const generateMockAnalyticsData = (
  startDate: Date,
  endDate: Date,
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom',
  selectedYears?: number[]
): AnalyticsData => {
  const userGrowth: any[] = [];
  const activeUsers: any[] = [];
  const conversions: ConversionDataPoint[] = [];

  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const numPoints = timeRange === 'daily' ? days : timeRange === 'weekly' ? Math.ceil(days / 7) : timeRange === 'monthly' ? (selectedYears?.length || 1) * 12 : 10;

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    if (timeRange === 'daily') date.setDate(date.getDate() + i);
    else if (timeRange === 'weekly') date.setDate(date.getDate() + i * 7);
    else if (timeRange === 'monthly') date.setMonth(date.getMonth() + i);
    else date.setDate(date.getDate() + i * Math.floor(days / numPoints));

    const dateStr = date.toISOString();
    const metricStr = timeRange === 'daily' ? format(date, 'MMM dd, yyyy') :
      timeRange === 'weekly' ? `Week ${Math.ceil(date.getDate() / 7)} (${format(date, 'MMM yyyy')})` :
        format(date, 'MMM yyyy');

    userGrowth.push({
      date: metricStr,
      users: 1000 + i * 50 + Math.floor(Math.random() * 20),
      newUsers: 10 + Math.floor(Math.random() * 10),
    });

    activeUsers.push({
      date: metricStr,
      dailyActive: 500 + i * 20 + Math.floor(Math.random() * 15),
      monthlyActive: 800 + i * 30 + Math.floor(Math.random() * 25),
    });

    conversions.push({
      metric: metricStr,
      date: dateStr,
      value: 50 + Math.floor(Math.random() * 30),
      percentage: 2 + Math.random() * 5,
    });
  }

  return {
    userGrowth,
    activeUsers,
    conversions,
  };
};

// Load user growth data using the new dedicated API
const loadUserGrowthData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    const options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (chartConfig.timeRange === 'daily' || chartConfig.timeRange === 'weekly') {
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        options.month = chartConfig.selectedMonth;
        options.year = chartConfig.selectedYear;
      }
    } else if (chartConfig.timeRange === 'monthly') {
      if (chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        options.years = chartConfig.selectedYears;
      }
    } else if (chartConfig.timeRange === 'custom') {
      if (chartConfig.dateRange.from && chartConfig.dateRange.to) {
        options.startDate = chartConfig.dateRange.from;
        options.endDate = chartConfig.dateRange.to;
      }
    }

    const response = await DashboardService.getUserGrowth(chartConfig.timeRange, options);

    if (response.success && response.data) {
      return {
        userGrowth: response.data.userGrowth,
        activeUsers: [],
        conversions: [],
      };
    } else {
      // Fallback
      return generateMockAnalyticsData(
        chartConfig.dateRange.from || new Date(),
        chartConfig.dateRange.to || new Date(),
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    return generateMockAnalyticsData(
      chartConfig.dateRange.from || new Date(),
      chartConfig.dateRange.to || new Date(),
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

// Load active users data using the new dedicated API
const loadActiveUsersData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    const options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (chartConfig.timeRange === 'daily' || chartConfig.timeRange === 'weekly') {
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        options.month = chartConfig.selectedMonth;
        options.year = chartConfig.selectedYear;
      }
    } else if (chartConfig.timeRange === 'monthly') {
      if (chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        options.years = chartConfig.selectedYears;
      }
    } else if (chartConfig.timeRange === 'custom') {
      if (chartConfig.dateRange.from && chartConfig.dateRange.to) {
        options.startDate = chartConfig.dateRange.from;
        options.endDate = chartConfig.dateRange.to;
      }
    }

    const response = await DashboardService.getActiveUsers(chartConfig.timeRange, options);

    if (response.success && response.data) {
      return {
        userGrowth: [],
        activeUsers: response.data.activeUsers,
        conversions: [],
      };
    } else {
      return generateMockAnalyticsData(
        chartConfig.dateRange.from || new Date(),
        chartConfig.dateRange.to || new Date(),
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    return generateMockAnalyticsData(
      chartConfig.dateRange.from || new Date(),
      chartConfig.dateRange.to || new Date(),
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

// Load conversion analytics data using the new dedicated API
const loadConversionsData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    const options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (chartConfig.timeRange === 'daily' || chartConfig.timeRange === 'weekly') {
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        options.month = chartConfig.selectedMonth;
        options.year = chartConfig.selectedYear;
      }
    } else if (chartConfig.timeRange === 'monthly') {
      if (chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        options.years = chartConfig.selectedYears;
      }
    } else if (chartConfig.timeRange === 'custom') {
      if (chartConfig.dateRange.from && chartConfig.dateRange.to) {
        options.startDate = chartConfig.dateRange.from;
        options.endDate = chartConfig.dateRange.to;
      }
    }

    const response = await DashboardService.getConversions(
      chartConfig.timeRange,
      chartConfig.conversionType || 'subscription',
      options
    );

    if (response.success && response.data) {
      return {
        userGrowth: [],
        activeUsers: [],
        conversions: response.data.conversions,
      };
    } else {
      return generateMockAnalyticsData(
        chartConfig.dateRange.from || new Date(),
        chartConfig.dateRange.to || new Date(),
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    return generateMockAnalyticsData(
      chartConfig.dateRange.from || new Date(),
      chartConfig.dateRange.to || new Date(),
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

export function useChartData(
  chartConfig: ChartConfig,
  apiType: 'userGrowth' | 'activeUsers' | 'conversions' | 'default' = 'default'
) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setLoading(true);

    let loadData: (config: ChartConfig) => Promise<AnalyticsData | null>;
    if (apiType === 'userGrowth') {
      loadData = loadUserGrowthData;
    } else if (apiType === 'activeUsers') {
      loadData = loadActiveUsersData;
    } else {
      loadData = loadConversionsData;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadData(chartConfig).then(result => {
        if (result) {
          setData(result);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      loadData(chartConfig).then(result => {
        if (result) {
          setData(result);
        }
        setLoading(false);
        debounceTimerRef.current = null;
      }).catch(() => {
        setLoading(false);
        debounceTimerRef.current = null;
      });
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    chartConfig.timeRange,
    chartConfig.dateRange.from,
    chartConfig.dateRange.to,
    chartConfig.selectedYears?.join(','),
    chartConfig.selectedMonth,
    chartConfig.selectedYear,
    chartConfig.conversionType,
    apiType
  ]);

  return { data, loading };
}
