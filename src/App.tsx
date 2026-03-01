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
import Colleges from "./pages/admin/Colleges";
import AddCollege from "./pages/admin/AddCollege";
import CollegeDetail from "./pages/admin/CollegeDetail";
import Courses from "./pages/admin/Courses";
import Enquiries from "./pages/admin/Enquiries";
import EnquiryDetail from "./pages/admin/EnquiryDetail";
import Events from "./pages/admin/Events";
import AddEvent from "./pages/admin/AddEvent";

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
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Courses />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/colleges"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Colleges />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/colleges/add"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddCollege />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/colleges/:id/edit"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddCollege />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/colleges/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CollegeDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Enquiries />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EnquiryDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Events />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/add"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddEvent />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddEvent />
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
