import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Edit3, Trash2, Eye, Search } from "lucide-react";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts, useDeleteProduct, useUpdateProductStatus } from "@/api/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/api/services/productService";

export default function ProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Get products from API
  const { data: productsResponse, isLoading, error } = useProducts({
    search: searchTerm || undefined,
    page: 1,
    limit: 50
  });

  const products = productsResponse?.data?.products || [];
  const deleteProductMutation = useDeleteProduct();
  const updateProductStatusMutation = useUpdateProductStatus();

  const handleEditProduct = (product: Product) => {
    navigate(`/admin/products/edit/${product._id}`);
  };

  const handlePreviewProduct = (product: any) => {
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteModal({
      isOpen: true,
      product: product,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.product) {
      deleteProductMutation.mutate(deleteModal.product._id);
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const handleStatusToggle = (product: Product) => {
    const newStatus = product.status === "Published" ? "Draft" : "Published";
    const newIsPublished = newStatus === "Published";
    
    updateProductStatusMutation.mutate({
      productId: product._id,
      data: {
        status: newStatus,
        isPublished: newIsPublished
      }
    });
  };

  const handleAddNewProduct = () => {
    navigate("/admin/products/new");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Product Page Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your product listings and information
            </p>
          </div>
          <Button
            onClick={handleAddNewProduct}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
                          <div className="space-y-4">
                {products.map((product, index) => (
                                  <motion.div
                    key={product._id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                  <div className="h-16 w-16 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modified {product.lastModified}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-32">
                      <Badge
                        variant={
                          product.status === "Published"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          product.status === "Published"
                            ? "bg-gradient-to-r from-brand-green to-brand-teal text-white min-w-[80px] text-center"
                            : "min-w-[80px] text-center"
                        }
                      >
                        {product.status}
                      </Badge>
                      <Switch
                        checked={product.status === "Published"}
                        onCheckedChange={() => handleStatusToggle(product)}
                        disabled={updateProductStatusMutation.isPending}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewProduct(product);
                        }}
                        title="Preview Product"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        title="Edit Product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                                              <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product);
                          }}
                          title="Delete Product"
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Preview Modal */}
      <ProductPreview
        product={previewProduct}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={() => {
          if (previewProduct) {
            handleEditProduct(previewProduct);
          }
        }}
      />
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={deleteModal.product?.name || ""}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
