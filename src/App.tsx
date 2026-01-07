import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginInfo } from "@/redux/features/authSlice";
import { AuthService } from "@/api/services/authService";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
// Temporarily commented out - not in current scope
// import ProductPage from "./pages/admin/ProductPage";
// import ProductEdit from "./pages/admin/ProductEdit";
// import ProductNew from "./pages/admin/ProductNew";
// import IndexPage from "./pages/admin/IndexPage";
// import ProductDetails from "./pages/admin/ProductDetails";
// import AboutUs from "./pages/admin/AboutUs";
// import Enquiries from "./pages/admin/Enquiries";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";
// import PrivacyPolicy from "./pages/admin/PrivacyPolicy";
// import FAQ from "./pages/admin/FAQ";
// import FAQNew from "./pages/admin/FAQNew";
// import FAQEdit from "./pages/admin/FAQEdit";
import AdminManagement from "./pages/admin/AdminManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
// import Campaigns from "./pages/admin/Campaigns";
import UsersList from "./pages/admin/UserList";
import UserViewPage from "./pages/admin/UserViewPage";
import UserEditPage from "./pages/admin/UserEditPage";
import FaceVerifications from "./pages/admin/FaceVerifications";
import PendingVerifications from "./pages/admin/PendingVerifications";
import VerificationDetails from "./pages/admin/VerificationDetails";
import FlaggedUsers from "./pages/admin/FlaggedUsers";

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
          {/* Temporarily commented out - not in current scope */}
          {/* <Route
            path="/admin/products"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <ProductPage />
              </AdminLayout>
                </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <ProductEdit />
              </AdminLayout>
                </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <ProductNew />
              </AdminLayout>
                </ProtectedRoute>
            }
          />
          <Route
            path="/admin/index-page"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <IndexPage />
              </AdminLayout>
                </ProtectedRoute>
            }
          />
          <Route
            path="/admin/product-details"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <ProductDetails />
              </AdminLayout>
                </ProtectedRoute>
            }
          />
          <Route
            path="/admin/about-us"
            element={
                <ProtectedRoute>
              <AdminLayout>
                <AboutUs />
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
          /> */}

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
            {/* Temporarily commented out - not in current scope */}
            {/* <Route
              path="/admin/privacy-policy"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <PrivacyPolicy />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faqs"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <FAQ />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faqs/new"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <FAQNew />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faqs/edit/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <FAQEdit />
                  </AdminLayout>
                </ProtectedRoute>
            }
                      /> */}
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
            {/* Temporarily commented out - not in current scope */}
            {/* <Route
              path="/admin/campaigns"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Campaigns />
                  </AdminLayout>
                </ProtectedRoute>
              }
            /> */}
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
              path="/admin/face-verifications"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <FaceVerifications />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/face-verifications/pending"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <PendingVerifications />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/face-verifications/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <VerificationDetails />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/face-verifications/flagged"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <FlaggedUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
