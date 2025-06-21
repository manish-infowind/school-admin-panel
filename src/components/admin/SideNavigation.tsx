import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Package,
  Home,
  FileText,
  ChevronRight,
  X,
  Megaphone,
  Building,
  Mail,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Product Page",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Index Page",
    href: "/admin/index-page",
    icon: Home,
  },
  {
    name: "Product Details",
    href: "/admin/product-details",
    icon: FileText,
  },
  {
    name: "About Us",
    href: "/admin/about-us",
    icon: Building,
  },
  {
    name: "Enquiries",
    href: "/admin/enquiries",
    icon: Mail,
  },
  {
    name: "Advertisement",
    href: "/admin/advertisement",
    icon: Megaphone,
  },
];

export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const location = useLocation();

  const sidebarContent = (
    <motion.div
      className="flex h-full flex-col bg-sidebar border-r"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Mobile close button */}
      <div className="flex h-16 items-center justify-between px-6 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-green via-brand-teal to-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-semibold">Admin</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="lg:hidden" />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">
              Content Management
            </h2>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => window.innerWidth < 1024 && onClose()}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 h-10",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                        {isActive && (
                          <motion.div
                            className="ml-auto"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        )}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-brand-green via-brand-teal to-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-xs">MP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">MedoScopic</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64">
              {sidebarContent}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
