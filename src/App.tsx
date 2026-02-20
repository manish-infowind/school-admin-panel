import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginInfo, logout } from "@/redux/features/authSlice";
import { AuthService } from "@/api/services/authService";
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";
import UsersList from "./pages/admin/UserList";
import UserViewPage from "./pages/admin/UserViewPage";
import UserEditPage from "./pages/admin/UserEditPage";
import AdminManagement from "./pages/admin/AdminManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import StagesManagement from "./pages/admin/onboarding/StagesManagement";
import IndustriesManagement from "./pages/admin/onboarding/IndustriesManagement";
import FundingRangesManagement from "./pages/admin/onboarding/FundingRangesManagement";
import TeamSizesManagement from "./pages/admin/onboarding/TeamSizesManagement";
import InvestorsList from "./pages/admin/investors/InvestorsList";
import InvestorDetails from "./pages/admin/investors/InvestorDetails";

const queryClient = new QueryClient();

// Component to initialize auth state from localStorage
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Sync Redux state with localStorage on app load
    const userData = AuthService.getCurrentUser();
    const accessToken = AuthService.getAccessToken();

    if (userData && accessToken) {
      // Restore user data to Redux if available
      dispatch(loginInfo(userData));
    }

    // Listen for auth logout events from API client (when 401 errors occur)
    const handleAuthLogout = () => {
      dispatch(logout());
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [dispatch]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer />
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UsersList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UserViewPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UserEditPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management/roles"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RolesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management/permissions"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PermissionsManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Redirect old /admin/management to users */}
          <Route
            path="/admin/management"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding/stages"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <StagesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding/industries"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <IndustriesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding/funding-ranges"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FundingRangesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding/team-sizes"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TeamSizesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investors"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InvestorsList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investors/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InvestorDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
