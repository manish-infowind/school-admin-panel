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
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { productStore } from "@/lib/productStore";

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
    title: "Product Details",
    description: "Update individual product information",
    href: "/admin/product-details",
    icon: FileText,
    color: "bg-gradient-to-br from-brand-blue to-brand-green",
  },
];

export default function Dashboard() {
  const [products, setProducts] = useState(productStore.getProducts());

  useEffect(() => {
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });
    return unsubscribe;
  }, []);

  const publishedProducts = products.filter((p) => p.isPublished).length;
  const draftProducts = products.filter((p) => !p.isPublished).length;

  const stats = [
    {
      title: "Total Pages",
      value: "4",
      change: "Admin panel ready",
      icon: FileText,
      color: "from-brand-green to-brand-teal",
    },
    {
      title: "Products",
      value: products.length.toString(),
      change: `${publishedProducts} published, ${draftProducts} drafts`,
      icon: Package,
      color: "from-brand-teal to-brand-blue",
    },
    {
      title: "Page Views",
      value: "2,847",
      change: "+18% this week",
      icon: TrendingUp,
      color: "from-brand-blue to-brand-green",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+8% this month",
      icon: Users,
      color: "from-brand-green via-brand-teal to-brand-blue",
    },
  ];

  const recentActivity = [
    {
      action: "Updated Product",
      page: products[0]?.name || "No products",
      time: products[0]?.lastModified || "N/A",
      type: "edit",
    },
    {
      action: "Product Status",
      page: `${publishedProducts} published, ${draftProducts} drafts`,
      time: "Real-time",
      type: "status",
    },
    {
      action: "System Status",
      page: "Admin Panel Active",
      time: "Online",
      type: "system",
    },
    {
      action: "Last Product Modified",
      page:
        products.find((p) => p.lastModified === "Just now")?.name ||
        "None recently",
      time: "Real-time",
      type: "edit",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your MedoScopic admin panel. Manage your website
              content from here.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-brand-green/10 to-brand-teal/10 text-brand-green border-brand-green/20"
          >
            Admin Panel v2.0
          </Badge>
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
                    {activity.time}
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
