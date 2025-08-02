import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Trash2,
  Plus,
  Package,
  Image as ImageIcon,
  FileText,
  List,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProduct, useUpdateProduct, useUploadProductImage } from "@/api/hooks/useProducts";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/api/services/productService";

// Predefined medical categories
const categories = [
  "Diagnostic Equipment",
  "Imaging Technology",
  "Lab Equipment",
  "Surgical Instruments",
  "Patient Monitoring",
  "Pharmaceuticals",
  "Medical Devices",
  "Rehabilitation Equipment",
  "Emergency Medical",
  "Dental Equipment",
  "Ophthalmology",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Geriatrics",
  "Oncology",
  "Radiology",
  "Pathology",
  "Other Medical"
];

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [localProduct, setLocalProduct] = useState<Partial<Product>>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load product data from API
  const { data: productResponse, isLoading, error } = useProduct(id || '');
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();

  const product = productResponse?.data;

  // Update local product when API data loads
  useEffect(() => {
    if (product) {
      setLocalProduct(product);
    }
  }, [product]);

  // Handle product not found
  useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: "Product not found",
        description: "The product you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate("/admin/products");
    }
  }, [error, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist.
        </p>
        <Link to="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!localProduct || !id) return;

    // Prevent multiple simultaneous saves
    if (isSaving || updateProductMutation.isPending) {
      return;
    }

    setIsSaving(true);

    // Validate required fields
    if (!localProduct.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!localProduct.category?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product category is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!localProduct.status?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product status is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Clean up empty features
    const cleanFeatures = localProduct.features?.filter((f) => f.trim() !== "") || [];
    if (cleanFeatures.length === 0) {
      cleanFeatures.push(""); // Keep at least one empty feature
    }

    // Update product via API
    updateProductMutation.mutate({
      productId: id,
      data: {
        ...localProduct,
        features: cleanFeatures,
      }
    }, {
      onSuccess: () => {
        // Upload new images if any
        if (imageFiles.length > 0) {
          // Store the files to upload
          const filesToUpload = [...imageFiles];
          
          // Clear the imageFiles array to prevent duplicate uploads
          setImageFiles([]);
          
          // Upload each image
          filesToUpload.forEach((file, index) => {
            setTimeout(() => {
              uploadImageMutation.mutate({
                productId: id,
                imageFile: file
              });
            }, index * 500); // Stagger uploads
          });
        }
        
        // Navigate to products page
        navigate("/admin/products");
      },
      onError: (error) => {
        setIsSaving(false);
      }
    });
  };

  const addFeature = () => {
    setLocalProduct({
      ...localProduct,
      features: [...(localProduct.features || []), ""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(localProduct.features || [])];
    newFeatures[index] = value;
    setLocalProduct({ ...localProduct, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = (localProduct.features || []).filter((_, i) => i !== index);
    setLocalProduct({ ...localProduct, features: newFeatures });
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Package },
    { id: "description", label: "Description", icon: FileText },
    { id: "features", label: "Features", icon: List },
    { id: "images", label: "Images", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                Edit Product
              </h1>
              <p className="text-muted-foreground mt-2">
                Update product information and settings
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePreview}
              disabled={!localProduct.name?.trim()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!localProduct.name || !localProduct.category || !localProduct.status || updateProductMutation.isPending || isSaving}
              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
            >
              {updateProductMutation.isPending || isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={localProduct.name || ""}
                    onChange={(e) =>
                      setLocalProduct({ ...localProduct, name: e.target.value })
                    }
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={localProduct.category || ""}
                    onValueChange={(value) =>
                      setLocalProduct({ ...localProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={localProduct.status || ""}
                    onValueChange={(value) =>
                      setLocalProduct({ 
                        ...localProduct, 
                        status: value,
                        isPublished: value === "Published"
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Textarea
                  id="shortDesc"
                  value={localProduct.shortDescription || ""}
                  onChange={(e) =>
                    setLocalProduct({ ...localProduct, shortDescription: e.target.value })
                  }
                  placeholder="Brief description for product listings"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "description" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="fullDesc">Full Description</Label>
                <Textarea
                  id="fullDesc"
                  value={localProduct.fullDescription || ""}
                  onChange={(e) =>
                    setLocalProduct({ ...localProduct, fullDescription: e.target.value })
                  }
                  rows={8}
                  placeholder="Enter detailed product description..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "features" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Key Features
                <Button onClick={addFeature} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(localProduct.features || []).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature..."
                    />
                    <Button
                      onClick={() => removeFeature(index)}
                      size="sm"
                      variant="ghost"
                      disabled={(localProduct.features || []).length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "images" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={localProduct.images || []}
                onImagesChange={(images, files) => {
                  setLocalProduct({ 
                    ...localProduct, 
                    images,
                  });
                  setImageFiles(files || []);
                }}
                maxImages={3}
                productId={id}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Product Preview Modal */}
      <ProductPreview
        product={{
          _id: localProduct._id || "preview",
          name: localProduct.name || "",
          category: localProduct.category || "",
          status: localProduct.status || "",
          shortDescription: localProduct.shortDescription || "",
          fullDescription: localProduct.fullDescription || "",
          features: (localProduct.features || []).filter(f => f.trim() !== ""),
          images: localProduct.images || [],
        }}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
