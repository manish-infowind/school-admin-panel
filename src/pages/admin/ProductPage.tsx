import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit3, Trash2, Save, Eye, Search } from "lucide-react";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "MedScope Pro X1",
    category: "Diagnostic Equipment",
    status: "Published",
    lastModified: "2 hours ago",
    image: "/placeholder.svg",
    shortDescription:
      "Advanced diagnostic imaging system with AI-powered analysis",
    fullDescription:
      "The MedScope Pro X1 represents the latest in diagnostic imaging technology, featuring AI-powered analysis capabilities, high-resolution imaging, and seamless integration with existing hospital systems.",
    price: "49,999",
    features: [
      "AI-powered diagnostic analysis",
      "4K high-resolution imaging",
      "Cloud connectivity",
      "Real-time collaboration tools",
    ],
    specifications: {
      Resolution: "4K Ultra HD",
      Weight: "2.5 kg",
      Connectivity: "WiFi 6, Bluetooth 5.0",
      "Battery Life": "8 hours continuous use",
      Certifications: "FDA Approved, CE Marked",
    },
  },
  {
    id: 2,
    name: "Advanced Imaging System",
    category: "Imaging Technology",
    status: "Draft",
    lastModified: "1 day ago",
    image: "/placeholder.svg",
    shortDescription: "Next-generation medical imaging with enhanced clarity",
    fullDescription:
      "Our Advanced Imaging System delivers unprecedented image quality with enhanced clarity and detail. Perfect for complex diagnostic procedures requiring the highest level of precision.",
    price: "75,999",
    features: [
      "Ultra-high resolution imaging",
      "Advanced noise reduction",
      "Multi-modal integration",
      "Cloud-based storage",
    ],
    specifications: {
      Resolution: "8K Ultra HD",
      Weight: "3.2 kg",
      Connectivity: "WiFi 6E, Bluetooth 5.2",
      "Battery Life": "12 hours continuous use",
      Certifications: "FDA Approved, CE Marked, ISO 13485",
    },
  },
  {
    id: 3,
    name: "Portable Analyzer",
    category: "Lab Equipment",
    status: "Published",
    lastModified: "3 days ago",
    image: "/placeholder.svg",
    shortDescription: "Compact, portable diagnostic analyzer for field use",
    fullDescription:
      "The Portable Analyzer brings laboratory-grade diagnostic capabilities to any location. Ideal for field research, remote clinics, and emergency medical situations.",
    price: "12,999",
    features: [
      "Portable and lightweight design",
      "Real-time analysis",
      "Multiple test panels",
      "Wireless connectivity",
    ],
    specifications: {
      Weight: "1.2 kg",
      Dimensions: "25 x 15 x 8 cm",
      "Battery Life": "24 hours continuous use",
      Connectivity: "WiFi, Bluetooth, USB-C",
      Certifications: "FDA Approved, CE Marked",
    },
  },
];

export default function ProductPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    // In real app, this would call an API
    console.log("Deleting product:", productId);
    // Show confirmation dialog and handle deletion
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
                      defaultValue={selectedProduct.name}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      defaultValue={selectedProduct.category}
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Key Features</Label>
                    <Textarea
                      id="features"
                      placeholder="List key features..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm">
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
