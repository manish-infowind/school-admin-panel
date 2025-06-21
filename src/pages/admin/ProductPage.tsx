import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit3, Trash2, Save, Eye, Search } from "lucide-react";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productStore, type Product } from "@/lib/productStore";
import { useToast } from "@/hooks/use-toast";

// Products are now managed by the store

export default function ProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from store
  useEffect(() => {
    setProducts(productStore.getProducts());

    // Subscribe to store changes
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });

    return unsubscribe;
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditProduct = (product: any) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handlePreviewProduct = (product: any) => {
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      )
    ) {
      const success = productStore.deleteProduct(productId);

      if (success) {
        toast({
          title: "Product Deleted",
          description: `"${product.name}" has been deleted successfully.`,
        });

        // Clear selection if deleted product was selected
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product List */}
        <motion.div
          className="lg:col-span-2"
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
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
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
                      <Badge
                        variant={
                          product.status === "Published"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          product.status === "Published"
                            ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                            : ""
                        }
                      >
                        {product.status}
                      </Badge>
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
                            handleDeleteProduct(product.id);
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

        {/* Product Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                {selectedProduct ? "Edit Product" : "Product Editor"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={selectedProduct.name}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={selectedProduct.category}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          category: e.target.value,
                        })
                      }
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={selectedProduct.shortDescription}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      value={selectedProduct.price}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          price: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!selectedProduct) return;

                        const success = productStore.updateProduct(
                          selectedProduct.id,
                          selectedProduct,
                        );
                        if (success) {
                          toast({
                            title: "Saved!",
                            description: "Product changes saved successfully.",
                          });
                        } else {
                          toast({
                            title: "Error",
                            description: "Failed to save changes.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewProduct(selectedProduct)}
                      title="Preview Product"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a product to edit or create a new one
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Product Preview Modal */}
      <ProductPreview
        product={previewProduct}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
