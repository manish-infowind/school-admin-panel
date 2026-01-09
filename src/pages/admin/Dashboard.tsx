import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Eye,
  Edit3,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { productStore } from "@/lib/productStore";
import { DashboardService, DashboardData, RecentActivity } from "@/api/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import { ChartConfig } from "@/components/admin/dashboard/ChartFilters";
import { useChartData } from "@/hooks/useChartData";
import PageHeader from "@/components/common/PageHeader";

// Helper function to create initial chart config
const createChartConfig = (): ChartConfig => {
  const today = new Date();
  return {
    chartType: 'bar',
    timeRange: 'monthly',
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

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState(productStore.getProducts());
  // Separate state for each chart
  const [userGrowthChart, setUserGrowthChart] = useState<ChartConfig>(createChartConfig());
  const [activeUsersChart, setActiveUsersChart] = useState<ChartConfig>(createChartConfig());
  const [conversionChart, setConversionChart] = useState<ChartConfig>(createChartConfig());

  // Use custom hook for chart data
  // Use the new dedicated User Growth API for user growth chart
  const { data: userGrowthData, loading: userGrowthLoading } = useChartData(userGrowthChart, true);
  const { data: activeUsersData, loading: activeUsersLoading } = useChartData(activeUsersChart);
  const { data: conversionData, loading: conversionLoading } = useChartData(conversionChart);

  useEffect(() => {
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await DashboardService.getDashboard();

        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          // Use fallback data
          setDashboardData({
            stats: {
              totalPages: 6,
              totalProducts: products.length,
              publishedProducts: products.filter((p) => p.isPublished).length,
              draftProducts: products.filter((p) => !p.isPublished).length,
              totalEnquiries: 25,
              newEnquiriesThisWeek: 8,
              activeUsers: 1234,
              userGrowthThisMonth: 8
            },
            productStats: {
              total: products.length,
              published: products.filter((p) => p.isPublished).length,
              draft: products.filter((p) => !p.isPublished).length,
              archived: 0
            },
            recentActivity: [
              {
                action: "Updated Product",
                page: products[0]?.name || "No products",
                time: products[0]?.lastModified || "N/A",
                type: "edit"
              },
              {
                action: "Product Status",
                page: `${products.filter((p) => p.isPublished).length} published, ${products.filter((p) => !p.isPublished).length} drafts`,
                time: "Real-time",
                type: "status"
              },
              {
                action: "System Status",
                page: "Admin Panel Active",
                time: "Online",
                type: "system"
              },
              {
                action: "Last Product Modified",
                page: products.find((p) => p.lastModified === "Just now")?.name || "None recently",
                time: "Real-time",
                type: "edit"
              }
            ],
            recentProducts: {
              products: products.slice(0, 2).map(p => ({
                _id: p.id.toString(),
                name: p.name,
                status: p.isPublished ? "Published" : "Draft",
                isPublished: p.isPublished,
                updatedAt: p.lastModified || new Date().toISOString()
              })),
              count: Math.min(products.length, 2)
            },
            systemHealth: {
              database: {
                status: "healthy",
                message: "Database connected"
              },
              products: {
                status: "healthy",
                message: `${products.length} products, ${products.filter((p) => p.isPublished).length} published`,
                total: products.length,
                published: products.filter((p) => p.isPublished).length
              },
              pages: {
                status: "healthy",
                message: "3 pages configured, 5 FAQs",
                pages: 3,
                faqs: 5
              },
              overall: true
            }
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Using fallback data.",
          variant: "destructive",
        });

        // Use fallback data
        setDashboardData({
          stats: {
            totalPages: 6,
            totalProducts: products.length,
            publishedProducts: products.filter((p) => p.isPublished).length,
            draftProducts: products.filter((p) => !p.isPublished).length,
            totalEnquiries: 25,
            newEnquiriesThisWeek: 8,
            activeUsers: 1234,
            userGrowthThisMonth: 8
          },
          productStats: {
            total: products.length,
            published: products.filter((p) => p.isPublished).length,
            draft: products.filter((p) => !p.isPublished).length,
            archived: 0
          },
          recentActivity: [
            {
              action: "Updated Product",
              page: products[0]?.name || "No products",
              time: products[0]?.lastModified || "N/A",
              type: "edit"
            },
            {
              action: "Product Status",
              page: `${products.filter((p) => p.isPublished).length} published, ${products.filter((p) => !p.isPublished).length} drafts`,
              time: "Real-time",
              type: "status"
            },
            {
              action: "System Status",
              page: "Admin Panel Active",
              time: "Online",
              type: "system"
            },
            {
              action: "Last Product Modified",
              page: products.find((p) => p.lastModified === "Just now")?.name || "None recently",
              time: "Real-time",
              type: "edit"
            }
          ],
          recentProducts: {
            products: products.slice(0, 2).map(p => ({
              _id: p.id.toString(),
              name: p.name,
              status: p.isPublished ? "Published" : "Draft",
              isPublished: p.isPublished,
              updatedAt: p.lastModified || new Date().toISOString()
            })),
            count: Math.min(products.length, 2)
          },
          systemHealth: {
            database: {
              status: "healthy",
              message: "Database connected"
            },
            products: {
              status: "healthy",
              message: `${products.length} products, ${products.filter((p) => p.isPublished).length} published`,
              total: products.length,
              published: products.filter((p) => p.isPublished).length
            },
            pages: {
              status: "healthy",
              message: "3 pages configured, 5 FAQs",
              pages: 3,
              faqs: 5
            },
            overall: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [products, toast]);

  // Use API data if available, otherwise use fallback
  const stats = dashboardData ? [
    {
      title: "Total Users",
      value: dashboardData.stats.activeUsers.toLocaleString(),
      change: `+${dashboardData.stats.userGrowthThisMonth}% this month`,
      icon: Users,
      color: "bg-brand-green",
    },
    {
      title: "Daily Active Users",
      value: activeUsersData?.activeUsers && activeUsersData.activeUsers.length > 0
        ? activeUsersData.activeUsers[activeUsersData.activeUsers.length - 1].dailyActive.toLocaleString()
        : "0",
      change: "Last 24 hours",
      icon: TrendingUp,
      color: "bg-brand-teal",
    },
    {
      title: "Monthly Active Users",
      value: activeUsersData?.activeUsers && activeUsersData.activeUsers.length > 0
        ? activeUsersData.activeUsers[activeUsersData.activeUsers.length - 1].monthlyActive.toLocaleString()
        : "0",
      change: "Last 30 days",
      icon: Users,
      color: "bg-brand-teal",
    },
    {
      title: "User Growth",
      value: userGrowthData?.userGrowth && userGrowthData.userGrowth.length > 0
        ? userGrowthData.userGrowth[userGrowthData.userGrowth.length - 1].newUsers.toString()
        : "0",
      change: `New users (${userGrowthChart.timeRange})`,
      icon: TrendingUp,
      color: "bg-brand-green",
    },
  ] : [];

  // Function to format time for display
  const formatTime = (timeString: string): string => {
    // Handle special cases first
    if (timeString === "Real-time" || timeString === "Online" || timeString === "N/A") {
      return timeString;
    }

    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      // If it's less than 1 minute ago, show "Just now"
      if (diffInMinutes < 1) {
        return "Just now";
      }

      // If it's less than 1 hour ago, show relative time
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      }

      // If it's less than 24 hours ago, show hours ago
      if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }

      // If it's less than 7 days ago, show days ago
      if (diffInMinutes < 10080) {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }

      // Otherwise show full date and time
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      // If parsing fails, return the original string
      return timeString;
    }
  };

  const recentActivity = dashboardData?.recentActivity || [];

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

  const conversionChartData = useMemo(() => {
    if (!conversionData) return [];
    return conversionData.conversions.map(item => ({
      name: item.metric,
      value: item.value,
      percentage: item.percentage,
    }));
  }, [conversionData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        page="dashboard"
        heading="Dashboard"
        subHeading="Welcome to your Pinaypal admin panel. Manage your website content from here."
      />

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
          dataKeys={['value']}
          delay={0.4}
          originalData={conversionData}
          loading={conversionLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                    <Edit3 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.page}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(activity.time)}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
