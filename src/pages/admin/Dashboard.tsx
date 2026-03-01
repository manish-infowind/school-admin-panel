import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { AdminDashboardService } from "@/api/services/collegeService";
import { DashboardService } from "@/api/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import { ChartConfig } from "@/components/admin/dashboard/ChartFilters";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { DashboardData } from "@/api/types";

const createChartConfig = (): ChartConfig => {
  const today = new Date();
  return {
    chartType: "bar",
    timeRange: "monthly",
    dateRange: {
      from: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d;
      })(),
      to: today,
    },
    isDatePickerOpen: false,
    calendarMonth: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d;
    })(),
    selectedMonth: today.getMonth(),
    selectedYear: today.getFullYear(),
    selectedYears: [today.getFullYear()],
  };
};

export default function Dashboard() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiryChartConfig, setEnquiryChartConfig] = useState<ChartConfig>(createChartConfig());
  const [enquiryChartData, setEnquiryChartData] = useState<{ label: string; count: number }[]>([]);
  const [enquiryChartLoading, setEnquiryChartLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await AdminDashboardService.getDashboard();
      if (res.success && res.data) setDashboard(res.data);
      else setDashboard(null);
    } catch {
      setDashboard(null);
      toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiryAnalytics = async () => {
    const c = enquiryChartConfig;
    setEnquiryChartLoading(true);
    try {
      const opts: Parameters<typeof DashboardService.getEnquiryAnalytics>[1] = {};
      if (c.timeRange === "daily" || c.timeRange === "weekly") {
        opts.month = c.selectedMonth;
        opts.year = c.selectedYear;
      } else if (c.timeRange === "monthly") {
        opts.years = c.selectedYears?.length ? c.selectedYears : [new Date().getFullYear()];
      } else if (c.timeRange === "custom" && c.dateRange?.from && c.dateRange?.to) {
        opts.startDate = c.dateRange.from;
        opts.endDate = c.dateRange.to;
      }
      const res = await DashboardService.getEnquiryAnalytics(c.timeRange, opts);
      if (res.success && res.data?.enquiries) {
        const sorted = [...res.data.enquiries].sort((a, b) => {
          if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
          return 0;
        });
        setEnquiryChartData(sorted.map((d) => ({ label: d.label, count: d.count })));
      } else {
        setEnquiryChartData([]);
      }
    } catch {
      setEnquiryChartData([]);
    } finally {
      setEnquiryChartLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchEnquiryAnalytics();
  }, [
    enquiryChartConfig.timeRange,
    enquiryChartConfig.selectedMonth,
    enquiryChartConfig.selectedYear,
    enquiryChartConfig.selectedYears,
    enquiryChartConfig.dateRange?.from,
    enquiryChartConfig.dateRange?.to,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    await fetchEnquiryAnalytics();
    setRefreshing(false);
    toast({ title: "Refreshed", description: "Dashboard data updated" });
  };

  const chartDataForCard = useMemo(() => {
    return enquiryChartData.map((d) => ({ name: d.label, Enquiries: d.count }));
  }, [enquiryChartData]);

  const stats = dashboard
    ? [
        {
          title: "Total Enquiries",
          value: (dashboard.enquiries?.total ?? 0).toLocaleString(),
          change: "All time",
          icon: MessageSquare,
          color: "bg-brand-green",
        },
        {
          title: "Pending Enquiries",
          value: (dashboard.enquiries?.pending ?? 0).toLocaleString(),
          change: "Awaiting review",
          icon: TrendingUp,
          color: "bg-brand-teal",
        },
      ]
    : [];

  if (loading) {
    return <PageLoader pagename="dashboard" />;
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
            Welcome to your College Eduversity admin panel. Manage your website content from here
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </motion.div>

      {/* Enquiry stats cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
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
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
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

      {/* Enquiries over time chart */}
      <ChartCard
        title="Enquiries over time"
        icon={MessageSquare}
        iconColor="text-brand-green"
        config={enquiryChartConfig}
        onConfigChange={setEnquiryChartConfig}
        data={chartDataForCard}
        dataKeys={["Enquiries"]}
        delay={0.2}
        loading={enquiryChartLoading}
      />
    </div>
  );
}
