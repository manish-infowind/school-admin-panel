import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { DashboardService, AnalyticsData, UserGrowthResponse, ActiveUsersResponse, ConversionAnalyticsResponse, ConversionDataPoint, RevenueAnalyticsResponse } from "@/api/services/dashboardService";
import { ChartConfig } from "@/components/admin/dashboard/ChartFilters";

// Generate mock analytics data based on date range
const generateMockAnalyticsData = (
  startDate: Date,
  endDate: Date,
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom',
  selectedYears?: number[]
): AnalyticsData => {
  const userGrowth = [];
  const activeUsers = [];
  const conversions = [];

  // Handle monthly multi-year comparison
  if (timeRange === 'monthly' && selectedYears && selectedYears.length > 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    months.forEach((month, monthIndex) => {
      // For each month, create data points for each selected year
      selectedYears.forEach((year) => {
        // Skip future months in current year
        if (year === currentYear && monthIndex > currentMonth) return;

        const dateStr = `${month} ${year}`;
        const yearOffset = selectedYears.length > 1 ? year - Math.min(...selectedYears) : 0;
        
        userGrowth.push({
          date: dateStr,
          users: Math.floor(Math.random() * 500) + 1000 + (yearOffset * 200) + (monthIndex * 10),
          newUsers: Math.floor(Math.random() * 50) + 20 + (yearOffset * 5),
        });

        activeUsers.push({
          date: dateStr,
          dailyActive: Math.floor(Math.random() * 300) + 500 + (yearOffset * 100),
          monthlyActive: Math.floor(Math.random() * 200) + 1200 + (yearOffset * 150),
        });

        // Conversions per month/year (date-wise)
        conversions.push({
          metric: dateStr,
          date: dateStr,
          value: Math.floor(Math.random() * 400) + 200 + (yearOffset * 50),
          percentage: Math.floor(Math.random() * 60) + 20,
        });
      });
    });

    return {
      userGrowth,
      activeUsers,
      conversions,
      performance: {
        averageResponseTime: 120,
        uptime: 99.8,
        errorRate: 0.2,
        throughput: 1250,
      },
    };
  }

  // Standard date range generation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let interval = 1;
  if (timeRange === 'weekly') interval = 7;
  else if (timeRange === 'monthly') interval = 30;

  let currentDate = new Date(start);
  let dataPointIndex = 0;

  while (currentDate <= end) {
    let dateStr = '';
    
    if (timeRange === 'daily' || (timeRange === 'custom' && diffDays <= 31)) {
      dateStr = format(currentDate, 'MMM dd, yyyy');
    } else if (timeRange === 'weekly' || (timeRange === 'custom' && diffDays <= 90)) {
      const weekNum = Math.ceil((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
      dateStr = `Week ${weekNum} (${format(currentDate, 'MMM yyyy')})`;
    } else {
      dateStr = format(currentDate, 'MMM yyyy');
    }

    userGrowth.push({
      date: dateStr,
      users: Math.floor(Math.random() * 500) + 1000 + dataPointIndex * 10,
      newUsers: Math.floor(Math.random() * 50) + 20,
    });

    activeUsers.push({
      date: dateStr,
      dailyActive: Math.floor(Math.random() * 300) + 500,
      monthlyActive: Math.floor(Math.random() * 200) + 1200,
    });

    // Conversions per date (date-wise)
    conversions.push({
      metric: dateStr,
      date: dateStr,
      value: Math.floor(Math.random() * 400) + 200,
      percentage: Math.floor(Math.random() * 60) + 20,
    });

    if (timeRange === 'daily' || (timeRange === 'custom' && diffDays <= 31)) {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (timeRange === 'weekly' || (timeRange === 'custom' && diffDays <= 90)) {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    dataPointIndex++;
    if (dataPointIndex > 100) break;
  }

  return {
    userGrowth,
    activeUsers,
    conversions,
    performance: {
      averageResponseTime: 120,
      uptime: 99.8,
      errorRate: 0.2,
      throughput: 1250,
    },
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
      gender?: 'm' | 'f';
    } = {};

    // Build options based on timeRange
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

    if (chartConfig.gender && chartConfig.gender !== 'all') {
      options.gender = chartConfig.gender;
    }

    const response = await DashboardService.getUserGrowth(chartConfig.timeRange, options);
    
    if (response.success && response.data) {
      // Transform UserGrowthResponse to AnalyticsData format
      return {
        userGrowth: response.data.userGrowth,
        activeUsers: [], // Will be loaded separately
        conversions: [], // Will be loaded separately
        performance: {
          averageResponseTime: 0,
          uptime: 0,
          errorRate: 0,
          throughput: 0,
        },
      };
    } else {
      // Fallback to mock data
      let calculatedStartDate: Date;
      let calculatedEndDate: Date = new Date();
      
      if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        const minYear = Math.min(...chartConfig.selectedYears);
        calculatedStartDate = new Date(minYear, 0, 1);
        const maxYear = Math.max(...chartConfig.selectedYears);
        calculatedEndDate = new Date(maxYear, 11, 31);
      } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      }
      
      return generateMockAnalyticsData(
        calculatedStartDate, 
        calculatedEndDate, 
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    // Fallback to mock data on error
    let calculatedStartDate: Date;
    let calculatedEndDate: Date = new Date();
    
    if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
      const minYear = Math.min(...chartConfig.selectedYears);
      calculatedStartDate = new Date(minYear, 0, 1);
      const maxYear = Math.max(...chartConfig.selectedYears);
      calculatedEndDate = new Date(maxYear, 11, 31);
    } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else {
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
    }
    
    return generateMockAnalyticsData(
      calculatedStartDate, 
      calculatedEndDate, 
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
      gender?: 'm' | 'f';
    } = {};

    // Build options based on timeRange
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

    if (chartConfig.gender && chartConfig.gender !== 'all') {
      options.gender = chartConfig.gender;
    }

    const response = await DashboardService.getActiveUsers(chartConfig.timeRange, options);
    
    if (response.success && response.data) {
      // Transform ActiveUsersResponse to AnalyticsData format
      return {
        userGrowth: [], // Will be loaded separately
        activeUsers: response.data.activeUsers,
        conversions: [], // Will be loaded separately
        performance: {
          averageResponseTime: 0,
          uptime: 0,
          errorRate: 0,
          throughput: 0,
        },
      };
    } else {
      // Fallback to mock data
      let calculatedStartDate: Date;
      let calculatedEndDate: Date = new Date();
      
      if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        const minYear = Math.min(...chartConfig.selectedYears);
        calculatedStartDate = new Date(minYear, 0, 1);
        const maxYear = Math.max(...chartConfig.selectedYears);
        calculatedEndDate = new Date(maxYear, 11, 31);
      } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      }
      
      return generateMockAnalyticsData(
        calculatedStartDate, 
        calculatedEndDate, 
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    // Fallback to mock data on error
    let calculatedStartDate: Date;
    let calculatedEndDate: Date = new Date();
    
    if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
      const minYear = Math.min(...chartConfig.selectedYears);
      calculatedStartDate = new Date(minYear, 0, 1);
      const maxYear = Math.max(...chartConfig.selectedYears);
      calculatedEndDate = new Date(maxYear, 11, 31);
    } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else {
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
    }
    
    return generateMockAnalyticsData(
      calculatedStartDate, 
      calculatedEndDate, 
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

// Load revenue analytics data using the new dedicated API
const loadRevenueData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    const options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
      gender?: 'm' | 'f';
    } = {};

    // Build options based on timeRange
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

    if (chartConfig.gender && chartConfig.gender !== 'all') {
      options.gender = chartConfig.gender;
    }

    const response = await DashboardService.getRevenue(chartConfig.timeRange, options);
    
    if (response.success && response.data) {
      // Transform RevenueAnalyticsResponse to AnalyticsData format
      // Sort by date to ensure chronological order
      const sortedRevenue = [...response.data.revenueAnalytics].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        userGrowth: [], // Will be loaded separately
        activeUsers: [], // Will be loaded separately
        conversions: [], // Not used for revenue
        revenueAnalytics: sortedRevenue, // Store revenue data
        performance: {
          averageResponseTime: 0,
          uptime: 0,
          errorRate: 0,
          throughput: 0,
        },
      };
    } else {
      // Fallback to mock data
      let calculatedStartDate: Date;
      let calculatedEndDate: Date = new Date();
      
      if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        const minYear = Math.min(...chartConfig.selectedYears);
        calculatedStartDate = new Date(minYear, 0, 1);
        const maxYear = Math.max(...chartConfig.selectedYears);
        calculatedEndDate = new Date(maxYear, 11, 31);
      } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      }
      
      return generateMockAnalyticsData(
        calculatedStartDate, 
        calculatedEndDate, 
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    console.error('Error loading revenue analytics:', error);
    // Fallback to mock data on error
    let calculatedStartDate: Date;
    let calculatedEndDate: Date = new Date();
    
    if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
      const minYear = Math.min(...chartConfig.selectedYears);
      calculatedStartDate = new Date(minYear, 0, 1);
      const maxYear = Math.max(...chartConfig.selectedYears);
      calculatedEndDate = new Date(maxYear, 11, 31);
    } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else {
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
    }
    
    return generateMockAnalyticsData(
      calculatedStartDate, 
      calculatedEndDate, 
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

// Load conversion analytics data using the new dedicated API
const loadConversionsData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    // Validate conversion type is present
    if (!chartConfig.conversionType) {
      console.warn('Conversion type is required for conversion analytics');
      return null;
    }

    const options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
      gender?: 'm' | 'f';
    } = {};

    // Build options based on timeRange
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

    // Gender filter (only for likes and gifts)
    if (chartConfig.gender && chartConfig.gender !== 'all' && 
        (chartConfig.conversionType === 'likes' || chartConfig.conversionType === 'gifts')) {
      options.gender = chartConfig.gender;
    }

    const response = await DashboardService.getConversions(
      chartConfig.timeRange,
      chartConfig.conversionType,
      options
    );
    
    if (response.success && response.data) {
      // Transform ConversionAnalyticsResponse to AnalyticsData format
      // Sort by date to ensure chronological order (as per API documentation best practices)
      const sortedConversions = [...response.data.conversions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Map ConversionDataPoint to ConversionData format for compatibility
      const conversions: AnalyticsData['conversions'] = sortedConversions.map(point => ({
        metric: point.metric,
        date: point.date,
        value: point.value,
        percentage: point.percentage,
      }));

      return {
        userGrowth: [], // Will be loaded separately
        activeUsers: [], // Will be loaded separately
        conversions,
        performance: {
          averageResponseTime: 0,
          uptime: 0,
          errorRate: 0,
          throughput: 0,
        },
      };
    } else {
      // Fallback to mock data
      let calculatedStartDate: Date;
      let calculatedEndDate: Date = new Date();
      
      if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
        const minYear = Math.min(...chartConfig.selectedYears);
        calculatedStartDate = new Date(minYear, 0, 1);
        const maxYear = Math.max(...chartConfig.selectedYears);
        calculatedEndDate = new Date(maxYear, 11, 31);
      } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
        calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
        calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      }
      
      return generateMockAnalyticsData(
        calculatedStartDate, 
        calculatedEndDate, 
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    console.error('Error loading conversion analytics:', error);
    // Fallback to mock data on error
    let calculatedStartDate: Date;
    let calculatedEndDate: Date = new Date();
    
    if (chartConfig.timeRange === 'monthly' && chartConfig.selectedYears && chartConfig.selectedYears.length > 0) {
      const minYear = Math.min(...chartConfig.selectedYears);
      calculatedStartDate = new Date(minYear, 0, 1);
      const maxYear = Math.max(...chartConfig.selectedYears);
      calculatedEndDate = new Date(maxYear, 11, 31);
    } else if (chartConfig.timeRange === 'custom' && chartConfig.dateRange.from && chartConfig.dateRange.to) {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else if (chartConfig.timeRange === 'weekly' && chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined) {
      calculatedStartDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth, 1);
      calculatedEndDate = new Date(chartConfig.selectedYear, chartConfig.selectedMonth + 1, 0);
    } else {
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
    }
    
    return generateMockAnalyticsData(
      calculatedStartDate, 
      calculatedEndDate, 
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

const loadChartData = async (chartConfig: ChartConfig): Promise<AnalyticsData | null> => {
  try {
    let calculatedStartDate: Date | undefined;
    let calculatedEndDate: Date | undefined;
    
    // For monthly with multi-year selection, use the dateRange from config
    if (chartConfig.timeRange === 'monthly') {
      if (chartConfig.selectedYears && chartConfig.selectedYears.length > 0 && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        // Fallback: use current year if selectedYears not set
        const currentYear = new Date().getFullYear();
        calculatedStartDate = new Date(currentYear, 0, 1);
        calculatedEndDate = new Date();
      }
    } else if (chartConfig.timeRange === 'custom') {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily') {
      // For daily, use dateRange if month/year are selected, otherwise use default (last 7 days)
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })();
        calculatedEndDate = new Date();
      }
    } else if (chartConfig.timeRange === 'weekly') {
      // For weekly, use dateRange if month/year are selected
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
        calculatedEndDate = new Date();
      }
    } else {
      // Default monthly (single year)
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      calculatedEndDate = new Date();
    }
    
    if (!calculatedStartDate || !calculatedEndDate) return null;

    const response = await DashboardService.getAnalytics(
      chartConfig.timeRange,
      calculatedStartDate,
      calculatedEndDate
    );
    
    if (response.success && response.data) {
      return response.data;
    } else {
      return generateMockAnalyticsData(
        calculatedStartDate, 
        calculatedEndDate, 
        chartConfig.timeRange,
        chartConfig.selectedYears
      );
    }
  } catch (error) {
    let calculatedStartDate: Date | undefined;
    let calculatedEndDate: Date | undefined;
    
    // For monthly with multi-year selection, use the dateRange from config
    if (chartConfig.timeRange === 'monthly') {
      if (chartConfig.selectedYears && chartConfig.selectedYears.length > 0 && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        // Fallback: use current year if selectedYears not set
        const currentYear = new Date().getFullYear();
        calculatedStartDate = new Date(currentYear, 0, 1);
        calculatedEndDate = new Date();
      }
    } else if (chartConfig.timeRange === 'custom') {
      calculatedStartDate = chartConfig.dateRange.from;
      calculatedEndDate = chartConfig.dateRange.to;
    } else if (chartConfig.timeRange === 'daily') {
      // For daily, use dateRange if month/year are selected, otherwise use default (last 7 days)
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })();
        calculatedEndDate = new Date();
      }
    } else if (chartConfig.timeRange === 'weekly') {
      // For weekly, use dateRange if month/year are selected
      if (chartConfig.selectedMonth !== undefined && chartConfig.selectedYear !== undefined && chartConfig.dateRange.from && chartConfig.dateRange.to) {
        calculatedStartDate = chartConfig.dateRange.from;
        calculatedEndDate = chartConfig.dateRange.to;
      } else {
        calculatedStartDate = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
        calculatedEndDate = new Date();
      }
    } else {
      calculatedStartDate = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
      calculatedEndDate = new Date();
    }
    
    if (!calculatedStartDate || !calculatedEndDate) return null;
    
    return generateMockAnalyticsData(
      calculatedStartDate, 
      calculatedEndDate, 
      chartConfig.timeRange,
      chartConfig.selectedYears
    );
  }
};

export function useChartData(
  chartConfig: ChartConfig, 
  apiType: 'userGrowth' | 'activeUsers' | 'conversions' | 'revenue' | 'default' = 'default'
) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Show loader immediately when filters change (before debounce)
    setLoading(true);

    // Determine which loader function to use
    let loadData: (config: ChartConfig) => Promise<AnalyticsData | null>;
    if (apiType === 'userGrowth') {
      loadData = loadUserGrowthData;
    } else if (apiType === 'activeUsers') {
      loadData = loadActiveUsersData;
    } else if (apiType === 'conversions') {
      loadData = loadConversionsData;
    } else if (apiType === 'revenue') {
      loadData = loadRevenueData;
    } else {
      loadData = loadChartData;
    }

    // On initial mount, load data immediately
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadData(chartConfig).then(result => {
        if (result) {
          setData(result);
        }
        setLoading(false);
      }).catch((error) => {
        console.error('Error loading chart data:', error);
        setLoading(false);
      });
      return;
    }

    // For subsequent changes, debounce the API call but loader is already showing
    debounceTimerRef.current = setTimeout(() => {
      loadData(chartConfig).then(result => {
        if (result) {
          setData(result);
        }
        setLoading(false);
        debounceTimerRef.current = null;
      }).catch((error) => {
        console.error('Error loading chart data:', error);
        setLoading(false);
        debounceTimerRef.current = null;
      });
    }, 800); // Wait 800ms after user stops interacting

    // Cleanup function to clear timer on unmount or dependency change
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
    chartConfig.selectedYears?.join(','), // Include selected years in dependencies
    chartConfig.selectedMonth, // Include selected month for daily/weekly
    chartConfig.selectedYear, // Include selected year for daily/weekly
    chartConfig.gender, // Include gender in dependencies
    chartConfig.conversionType, // Include conversion type in dependencies
    apiType // Include this in dependencies
  ]);

  return { data, loading };
}

