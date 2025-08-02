import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Home,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Edit3,
  Building,
  Mail,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { productStore } from "@/lib/productStore";
import { DashboardService, DashboardData, DashboardStats, RecentActivity } from "@/api/services/dashboardService";
import { useToast } from "@/hooks/use-toast";

const quickActions = [
  {
    title: "Edit Homepage",
    description: "Update the main landing page content",
    href: "/admin/index-page",
    icon: Home,
    color: "bg-gradient-to-br from-brand-green to-brand-teal",
  },
  {
    title: "Manage Products",
    description: "Add, edit, or remove product listings",
    href: "/admin/products",
    icon: Package,
    color: "bg-gradient-to-br from-brand-teal to-brand-blue",
  },
  {
    title: "About Us",
    description: "Manage company information and team",
    href: "/admin/about-us",
    icon: Building,
    color: "bg-gradient-to-br from-brand-blue to-brand-green",
  },
  {
    title: "View Enquiries",
    description: "Manage customer contact form submissions",
    href: "/admin/enquiries",
    icon: Mail,
    color: "bg-gradient-to-br from-brand-green via-brand-teal to-brand-blue",
  },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState(productStore.getProducts());

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
      title: "Total Pages",
      value: dashboardData.stats.totalPages.toString(),
      change: "Admin panel ready",
      icon: FileText,
      color: "from-brand-green to-brand-teal",
    },
    {
      title: "Products",
      value: dashboardData.stats.totalProducts.toString(),
      change: `${dashboardData.stats.publishedProducts} published, ${dashboardData.stats.draftProducts} drafts`,
      icon: Package,
      color: "from-brand-teal to-brand-blue",
    },
    {
      title: "Enquiries",
      value: dashboardData.stats.totalEnquiries.toString(),
      change: `${dashboardData.stats.newEnquiriesThisWeek} new this week`,
      icon: Mail,
      color: "from-brand-blue to-brand-green",
    },
    {
      title: "Active Users",
      value: dashboardData.stats.activeUsers.toLocaleString(),
      change: `+${dashboardData.stats.userGrowthThisMonth}% this month`,
      icon: Users,
      color: "from-brand-green via-brand-teal to-brand-blue",
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your MedoScopic admin panel. Manage your website
            content from here.
          </p>
        </div>
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
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <Link to={action.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 hover:bg-sidebar-accent"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

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
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-green to-brand-teal flex items-center justify-center flex-shrink-0">
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
