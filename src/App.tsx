import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import ProductPage from "./pages/admin/ProductPage";
import ProductEdit from "./pages/admin/ProductEdit";
import ProductNew from "./pages/admin/ProductNew";
import IndexPage from "./pages/admin/IndexPage";
import ProductDetails from "./pages/admin/ProductDetails";
import Advertisement from "./pages/admin/Advertisement";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminLayout>
                <ProductPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminLayout>
                <ProductEdit />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminLayout>
                <ProductNew />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/index-page"
            element={
              <AdminLayout>
                <IndexPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/product-details"
            element={
              <AdminLayout>
                <ProductDetails />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/advertisement"
            element={
              <AdminLayout>
                <Advertisement />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminLayout>
                <Profile />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <Settings />
              </AdminLayout>
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
