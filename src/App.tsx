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

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
