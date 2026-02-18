import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { productStore } from "@/lib/productStore";
import { DashboardService } from "@/api/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import { ChartConfig } from "@/components/admin/dashboard/ChartFilters";
import { useChartData } from "@/hooks/useChartData";
import { useDashboardStatsSummary } from "@/hooks/useDashboardStatsSummary";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Helper function to create initial chart config
const createChartConfig = (): ChartConfig => {
  const today = new Date();
  return {
    chartType: 'bar',
    timeRange: 'monthly',
    gender: 'all',
    dateRange: {
      from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })(),
      to: today,
    },
    isDatePickerOpen: false,
    calendarMonth: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; })(),
    selectedMonth: today.getMonth(),
    selectedYear: today.getFullYear(),
    selectedYears: [today.getFullYear()],
  };
};

// Helper function to format dates using UTC to avoid timezone shifts
const formatDateUTC = (date: Date, format: 'daily' | 'weekly' | 'monthly'): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (format === 'daily') {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${month} ${day}, ${year}`;
  } else if (format === 'weekly') {
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    // Calculate week number: get the day of the month and divide by 7, rounding up
    // Week 1 is days 1-7, Week 2 is days 8-14, etc.
    const dayOfMonth = date.getUTCDate();
    const weekNum = Math.ceil(dayOfMonth / 7);
    return `Week ${weekNum} (${month} ${year})`;
  } else {
    // Monthly format
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${month} ${year}`;
  }
};

export default function Dashboard() {
  const { toast } = useToast();

  const [products, setProducts] = useState(productStore.getProducts());
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Separate state for each chart
  const [userGrowthChart, setUserGrowthChart] = useState<ChartConfig>(createChartConfig());
  const [activeUsersChart, setActiveUsersChart] = useState<ChartConfig>(createChartConfig());
  const [conversionChart, setConversionChart] = useState<ChartConfig>({
    ...createChartConfig(),
    conversionType: 'subscription', // Default conversion type
  });
  // Use custom hook for chart data
  // Fetch stats independently (NO FILTERS - stats remain static)
  const { data: statsSummary, isLoading: statsLoading, refetch: refetchStatsSummary } = useDashboardStatsSummary();
  
  // Use the new dedicated User Growth API for user growth chart
  const { data: userGrowthData, loading: userGrowthLoading } = useChartData(userGrowthChart, 'userGrowth');
  // Use the new dedicated Active Users API for active users chart
  const { data: activeUsersData, loading: activeUsersLoading } = useChartData(activeUsersChart, 'activeUsers');
  // Use the new dedicated Conversions API for conversion insights chart
  const { data: conversionData, loading: conversionLoading } = useChartData(conversionChart, 'conversions');

  useEffect(() => {
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });
    return unsubscribe;
  }, []);

  // Handle sync user growth data
  const handleSyncUserGrowth = async () => {
    try {
      setSyncing(true);
      const response = await DashboardService.syncUserGrowth();

      if (response.success && response.data) {
        toast({
          title: "Sync Successful",
          description: `User growth analytics synced successfully for ${response.data.date}`,
        });

        // Force refresh user growth data by updating the chart config
        // This will trigger the useChartData hook to refetch
        setUserGrowthChart(prev => ({
          ...prev,
          // Update dateRange to trigger refresh
          dateRange: {
            from: prev.dateRange.from,
            to: new Date(), // Update to current date to trigger refresh
          },
        }));
      } else {
        toast({
          title: "Sync Failed",
          description: response.message || "Failed to sync user growth analytics",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error syncing user growth:', error);
      toast({
        title: "Sync Error",
        description: error.message || "An error occurred while syncing data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Handle refresh analytics data for a specific date (defaults to current date)
  const handleRefreshAnalytics = async (date?: string) => {
    try {
      setRefreshing(true);
      
      // Format date as YYYY-MM-DD if provided, otherwise use current date
      const dateToRefresh = date || new Date().toISOString().split('T')[0];
      
      const response = await DashboardService.refreshAnalytics(dateToRefresh);

      if (response.success && response.data) {
        const { userGrowth, activeUsers, duration_ms } = response.data;
        
        toast({
          title: "Refresh Successful",
          description: `Analytics data refreshed successfully for ${response.data.date} (${duration_ms}ms)`,
        });

        // Force refresh all chart data by updating the chart configs
        // This will trigger the useChartData hooks to refetch
        const now = new Date();
        
        setUserGrowthChart(prev => ({
          ...prev,
          dateRange: {
            from: prev.dateRange.from,
            to: now,
          },
        }));
        
        setActiveUsersChart(prev => ({
          ...prev,
          dateRange: {
            from: prev.dateRange.from,
            to: now,
          },
        }));
        
        setConversionChart(prev => ({
          ...prev,
          dateRange: {
            from: prev.dateRange.from,
            to: now,
          },
        }));

        // Refetch dashboard stats summary after analytics refresh
        await refetchStatsSummary();
      } else {
        toast({
          title: "Refresh Failed",
          description: response.message || "Failed to refresh analytics data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error refreshing analytics:', error);
      toast({
        title: "Refresh Error",
        description: error.message || "An error occurred while refreshing analytics data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };


  // Create stats cards from API data (independent from filters)

  const stats = statsSummary ? [
    {
      title: "Total Users",
      value: statsSummary.totalUsers.toLocaleString(),
      change: "All time",
      icon: Users,
      color: "bg-brand-green",
    },
    {
      title: "Daily Active Users",
      value: statsSummary.dailyActiveUsers.toLocaleString(),
      change: "Last 24 hours",
      icon: TrendingUp,
      color: "bg-brand-teal",
    },
    {
      title: "Monthly Active Users",
      value: statsSummary.monthlyActiveUsers.toLocaleString(),
      change: "Last 30 days",
      icon: Users,
      color: "bg-brand-teal",
    },
    {
      title: "User Growth",
      value: statsSummary.newUsersThisMonth.toString(),
      change: "New users this month",
      icon: TrendingUp,
      color: "bg-brand-green",
    }
  ] : [];

  // Prepare chart data for each chart
  const userGrowthChartData = useMemo(() => {
    if (!userGrowthData) return [];

    // Handle multi-year monthly comparison
    if (userGrowthChart.timeRange === 'monthly' && userGrowthChart.selectedYears && userGrowthChart.selectedYears.length > 1) {
      // Group data by month and create year-based keys
      const monthDataMap = new Map<string, Record<string, string | number>>();

      userGrowthData.userGrowth.forEach(item => {
        // Parse "Jan 2024" format
        const parts = item.date.split(' ');
        if (parts.length === 2) {
          const month = parts[0]; // "Jan"
          const year = parts[1]; // "2024"

          if (!monthDataMap.has(month)) {
            monthDataMap.set(month, { name: month });
          }

          const monthData = monthDataMap.get(month)!;
          monthData[`${year} - Total Users`] = item.users;
          monthData[`${year} - New Users`] = item.newUsers;
        }
      });

      // Convert map to array and sort by month order
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return Array.from(monthDataMap.values()).sort((a, b) => {
        const aName = typeof a.name === 'string' ? a.name : '';
        const bName = typeof b.name === 'string' ? b.name : '';
        return months.indexOf(aName) - months.indexOf(bName);
      }) as Array<{ name: string; [key: string]: string | number }>;
    }

    // Standard format for single year or other time ranges
    return userGrowthData.userGrowth.map(item => ({
      name: item.date,
      'Total Users': item.users,
      'New Users': item.newUsers,
    }));
  }, [userGrowthData, userGrowthChart.timeRange, userGrowthChart.selectedYears]);

  const activeUsersChartData = useMemo(() => {
    if (!activeUsersData) return [];

    // Handle multi-year monthly comparison
    if (activeUsersChart.timeRange === 'monthly' && activeUsersChart.selectedYears && activeUsersChart.selectedYears.length > 1) {
      const monthDataMap = new Map<string, Record<string, string | number>>();

      activeUsersData.activeUsers.forEach(item => {
        const parts = item.date.split(' ');
        if (parts.length === 2) {
          const month = parts[0];
          const year = parts[1];

          if (!monthDataMap.has(month)) {
            monthDataMap.set(month, { name: month });
          }

          const monthData = monthDataMap.get(month)!;
          monthData[`${year} - Daily Active`] = item.dailyActive;
          monthData[`${year} - Monthly Active`] = item.monthlyActive;
        }
      });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return Array.from(monthDataMap.values()).sort((a, b) => {
        const aName = typeof a.name === 'string' ? a.name : '';
        const bName = typeof b.name === 'string' ? b.name : '';
        return months.indexOf(aName) - months.indexOf(bName);
      }) as Array<{ name: string; [key: string]: string | number }>;
    }

    return activeUsersData.activeUsers.map(item => ({
      name: item.date,
      'Daily Active': item.dailyActive,
      'Monthly Active': item.monthlyActive,
    }));
  }, [activeUsersData, activeUsersChart.timeRange, activeUsersChart.selectedYears]);

  // here i need to change to align the months in correct order
  const conversionChartData = useMemo(() => {
    if (!conversionData) return [];

    // For monthly multi-year comparison (bar, line, or pie), show grouped by month
    // with months on the X-axis (Jan, Feb, ...) and one series per year.
    if (
      conversionChart.timeRange === 'monthly' &&
      conversionChart.selectedYears &&
      conversionChart.selectedYears.length > 1
    ) {
      const monthDataMap = new Map<string, { name: string; [key: string]: number | string }>();

      const conversions = conversionData.conversions || [];

      conversions.forEach((item) => {
        const raw = item.metric;
        if (!raw) return;
        
        const parts = raw.split(' ');
        if(parts.length !==2 ) return;

        let monthLabel = parts[0];
        let yearNum = Number(parts[1]);

        if(isNaN(yearNum)) return;
        //removed the ISO parsing of date when we already have months name comming in API response so I used that 
        if (
          conversionChart.selectedYears &&
          !conversionChart.selectedYears.includes(yearNum)
        ) {
          return;
        }

        const monthKey = monthLabel;
        const yearKey = `${yearNum} - value`;

        const existing = monthDataMap.get(monthKey) || { name: monthLabel };
        const currentValue =
          typeof existing[yearKey] === 'number'
            ? (existing[yearKey] as number)
            : Number(existing[yearKey]) || 0;

        existing[yearKey] = currentValue + (item.value || 0);
        monthDataMap.set(monthKey, existing);
      });

      const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return Array.from(monthDataMap.values()).sort((a, b) => {
        const aIndex = monthsOrder.indexOf(String(a.name));
        const bIndex = monthsOrder.indexOf(String(b.name));
        return aIndex - bIndex;
      });
    }

    // Default: single series using value over date/metric
    const items = conversionData.conversions || [];

    // Sort by actual date (if available) so months are always in proper sequence
    const withTime = items.map(item => {
      const raw = item.date || item.metric;
      const parsed = raw ? new Date(raw) : null;
      const time = parsed && !isNaN(parsed.getTime()) ? parsed.getTime() : 0;
      return { item, time };
    });

    withTime.sort((a, b) => a.time - b.time);

    return withTime.map(({ item }) => ({
      // Use metric for X-axis label (formatted label like "Jan 2024", "Week 1", etc.)
      // date is used for sorting only (as per API documentation)
      name: item.metric || item.date || '',
      value: item.value,
      percentage: item.percentage,
    }));
  }, [
    conversionData,
    conversionChart.timeRange,
    conversionChart.selectedYears,
    conversionChart.chartType,
  ]);

  if (statsLoading) {
    return (
      <PageLoader pagename="dashboard" />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your Pinaypal admin panel. Manage your website content from here
          </p>
        </div>
        <Button
          onClick={() => handleRefreshAnalytics()}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analytics
            </>
          )}
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div
                  className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts Section - Stacked Vertically */}
      <div className="space-y-6">
        {/* User Growth Chart */}
        <ChartCard
          title="User Growth Analytics"
          icon={Users}
          iconColor="text-brand-green"
          config={userGrowthChart}
          onConfigChange={setUserGrowthChart}
          data={userGrowthChartData}
          dataKeys={
            userGrowthChart.timeRange === 'monthly' && userGrowthChart.selectedYears && userGrowthChart.selectedYears.length > 1
              ? userGrowthChart.selectedYears.flatMap(year => [`${year.toString()} - Total Users`, `${year.toString()} - New Users`])
              : ['Total Users', 'New Users']
          }
          delay={0.2}
          originalData={userGrowthData}
          loading={userGrowthLoading}
        />

        {/* Active Users Chart */}
        <ChartCard
          title="Active Users Analytics"
          icon={TrendingUp}
          iconColor="text-brand-teal"
          config={activeUsersChart}
          onConfigChange={setActiveUsersChart}
          data={activeUsersChartData}
          dataKeys={
            activeUsersChart.timeRange === 'monthly' && activeUsersChart.selectedYears && activeUsersChart.selectedYears.length > 1
              ? activeUsersChart.selectedYears.flatMap(year => [`${year.toString()} - Daily Active`, `${year.toString()} - Monthly Active`])
              : ['Daily Active', 'Monthly Active']
          }
          delay={0.3}
          originalData={activeUsersData}
          loading={activeUsersLoading}
        />

        {/* Conversion Insights Chart */}
        <ChartCard
          title="Conversion Insights Analytics"
          icon={TrendingUp}
          iconColor="text-brand-blue"
          config={conversionChart}
          onConfigChange={setConversionChart}
          data={conversionChartData}
          dataKeys={
            conversionChart.timeRange === 'monthly' && conversionChart.selectedYears && conversionChart.selectedYears.length > 1
              ? conversionChart.selectedYears.map(year => `${year.toString()} - value`)
              : ['value']
          }
          delay={0.4}
          originalData={conversionData}
          loading={conversionLoading}
        />

      </div>
    </div>
  );
}
