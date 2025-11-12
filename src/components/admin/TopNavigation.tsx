import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut, User, Menu, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { useProfile } from "@/api/hooks/useProfile";
import { useEffect, useState } from "react";

interface TopNavigationProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function TopNavigation({
  onToggleSidebar,
  isSidebarOpen,
}: TopNavigationProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, loading, loadProfile } = useProfile();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile when component mounts (only if not already loaded)
  useEffect(() => {
    if (user && !profile && !loading) {
      loadProfile();
    }
  }, [user, profile, loading, loadProfile]);

  useEffect(() => {
    if (profile?.avatar) {
      setProfileImage(profile.avatar);
    }
  }, [profile]);

  return (
    <motion.header
      className="flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0 lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Avatar className="h-8 w-8">
                  {profileImage ? (
                    <AvatarImage 
                      src={`${profileImage}?t=${Date.now()}`} 
                      alt={profile?.firstName || 'User'} 
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-brand-green to-brand-teal text-white">
                      {profile?.firstName && profile?.lastName 
                        ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
                        : profile?.firstName 
                          ? profile.firstName.charAt(0).toUpperCase()
                          : profile?.lastName 
                            ? profile.lastName.charAt(0).toUpperCase()
                            : profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.firstName && profile?.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile?.firstName || profile?.lastName || user?.fullName || user?.username || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email || user?.email || 'admin@pinaypal.com'}
                </p>
                {profile?.role && (
                  <Badge
                    variant="secondary"
                    className="w-fit bg-gradient-to-r from-brand-green to-brand-teal text-white font-medium shadow-sm border-0 text-xs"
                  >
                    <Shield className="h-2 w-2 mr-1" />
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              logout();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
