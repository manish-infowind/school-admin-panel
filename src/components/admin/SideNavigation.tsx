import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Package,
  Home,
  ChevronRight,
  Building,
  Mail,
  Shield,
  HelpCircle,
  Users,
  Megaphone,
  UserPen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo-icon";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";


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
    name: "User List",
    href: "/admin/users",
    icon: UserPen,
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
    name: "Privacy Policy",
    href: "/admin/privacy-policy",
    icon: Shield,
  },
  {
    name: "FAQ",
    href: "/admin/faqs",
    icon: HelpCircle,
  },
  {
    name: "Campaigns",
    href: "/admin/campaigns",
    icon: Megaphone,
  },
];

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
};


export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const location = useLocation();

  // provide a narrow shape for the auth slice so TS knows about loginState.role
  const auth = useSelector((state: RootState) =>
    state?.auth as { loginState?: { role?: string } } | undefined
  );
  const loginState = auth?.loginState;
  const isSuperAdmin = loginState?.role === 'super_admin';

  // Add Admin Management for Super Admins
  const allNavigation = [
    ...navigation,
    ...(isSuperAdmin ? [{
      name: "Admin Management",
      href: "/admin/management",
      icon: Users,
    }] : []),
  ];

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
        <div className="h-24 w-24 rounded-full overflow-hidden bg-brand-green p-3 shadow-lg flex items-center justify-center">
          <LogoIcon size="lg" className="h-16 w-16" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 space-y-1 py-2">
          <div className="space-y-0.5">
            {allNavigation.map((item) => {
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
            <span className="text-sm font-medium">Pinaypal</span>
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
