import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/lib/authContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import ProductPage from "./pages/admin/ProductPage";
import ProductEdit from "./pages/admin/ProductEdit";
import ProductNew from "./pages/admin/ProductNew";
import IndexPage from "./pages/admin/IndexPage";
import ProductDetails from "./pages/admin/ProductDetails";
import Advertisement from "./pages/admin/Advertisement";
import AboutUs from "./pages/admin/AboutUs";
import Enquiries from "./pages/admin/Enquiries";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

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
            />
            <Route
              path="/admin/advertisement"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Advertisement />
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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
