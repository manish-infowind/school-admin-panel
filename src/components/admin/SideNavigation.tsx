import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  ChevronRight,
  UserCheck,
  Users,
  UserCog,
  Key,
  ChevronDown,
  TrendingUp,
  Building2,
  DollarSign,
  Users as UsersIcon,
  Briefcase,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo-icon";
import React, { useState, useEffect } from "react";


const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "System Users",
    href: "/admin/users",
    icon: UserCheck,
  },
  {
    name: "Investors",
    href: "/admin/investors",
    icon: Briefcase,
  },
];

const adminManagementItems = [
  {
    name: "Admin Users",
    href: "/admin/management/users",
    icon: Users,
  },
  {
    name: "Roles",
    href: "/admin/management/roles",
    icon: UserCog,
  },
  {
    name: "Permissions",
    href: "/admin/management/permissions",
    icon: Key,
  },
];

const onboardingManagementItems = [
  {
    name: "Stages",
    href: "/admin/onboarding/stages",
    icon: TrendingUp,
  },
  {
    name: "Industries",
    href: "/admin/onboarding/industries",
    icon: Building2,
  },
  {
    name: "Funding Ranges",
    href: "/admin/onboarding/funding-ranges",
    icon: DollarSign,
  },
  {
    name: "Team Sizes",
    href: "/admin/onboarding/team-sizes",
    icon: UsersIcon,
  },
];

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
};


export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const location = useLocation();
  
  // Check if current path is in admin management section
  const isAdminManagementActive = location.pathname.startsWith('/admin/management');
  
  // Check if current path is in onboarding management section
  const isOnboardingManagementActive = location.pathname.startsWith('/admin/onboarding');
  
  // Auto-expand admin management section if on one of those pages
  const [adminManagementOpen, setAdminManagementOpen] = useState(isAdminManagementActive);
  
  // Auto-expand onboarding management section if on one of those pages
  const [onboardingManagementOpen, setOnboardingManagementOpen] = useState(isOnboardingManagementActive);
  
  // Update state when location changes
  useEffect(() => {
    if (isAdminManagementActive) {
      setAdminManagementOpen(true);
    }
  }, [isAdminManagementActive]);

  useEffect(() => {
    if (isOnboardingManagementActive) {
      setOnboardingManagementOpen(true);
    }
  }, [isOnboardingManagementActive]);

  const sidebarContent = (
    <motion.div
      className="flex h-full flex-col bg-sidebar border-r"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Header with Logo */}
      <div className="flex h-32 items-center justify-center px-6 py-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-black p-3 shadow-lg flex items-center justify-center">
          <LogoIcon size="lg" className="h-16 w-16" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 space-y-1 py-2">
          <div className="space-y-0.5">
            {navigation
              .map((item) => {
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
                          "w-full justify-start gap-3 h-10 text-base",
                          isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
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
                            <ChevronRight className="h-5 w-5" />
                          </motion.div>
                        )}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            
            {/* Admin Management Section */}
            <div className="mt-2">
              <Button
                variant={isAdminManagementActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10 text-base",
                  isAdminManagementActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                )}
                onClick={() => setAdminManagementOpen(!adminManagementOpen)}
              >
                <Users className="h-5 w-5" />
                Admin Management
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: adminManagementOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </Button>
              
              <AnimatePresence>
                {adminManagementOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-1 space-y-0.5">
                      {adminManagementItems.map((item) => {
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
                                  "w-full justify-start gap-3 h-9 text-sm",
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Onboarding Management Section */}
            <div className="mt-2">
              <Button
                variant={isOnboardingManagementActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10 text-base",
                  isOnboardingManagementActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                )}
                onClick={() => setOnboardingManagementOpen(!onboardingManagementOpen)}
              >
                <TrendingUp className="h-5 w-5" />
                Onboarding Options
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: onboardingManagementOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </Button>
              
              <AnimatePresence>
                {onboardingManagementOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-1 space-y-0.5">
                      {onboardingManagementItems.map((item) => {
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
                                  "w-full justify-start gap-3 h-9 text-sm",
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
           </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <LogoIcon size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">FindMyFunding.ai</span>
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
