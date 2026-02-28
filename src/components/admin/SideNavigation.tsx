import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo-icon";
import React from "react";


const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Colleges",
    href: "/admin/colleges",
    icon: Building2,
  },
  {
    name: "Courses",
    href: "/admin/courses",
    icon: GraduationCap,
  },
];

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
};


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
      <AnimatePresence initial={false} mode="wait">
        {isOpen && (
          <motion.div
            className="hidden lg:block lg:flex-shrink-0 overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="w-64 h-full">
              {sidebarContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {!isOpen ? null : (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
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
