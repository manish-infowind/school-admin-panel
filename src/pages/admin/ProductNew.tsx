import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Link, useNavigate } from "react-router-dom";
import { useCreateProduct, useUploadProductImage } from "@/api/hooks/useProducts";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { useToast } from "@/hooks/use-toast";

const initialProduct = {
  name: "",
  category: "",
  status: "Draft",
  shortDescription: "",
  fullDescription: "",
  features: [""],
  images: [],
  imageFiles: [] as File[], // Store actual file objects
  isPublished: false,
};

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

export default function ProductNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadProductImage();

  const handleSave = async () => {
    // Prevent multiple simultaneous saves
    if (isSaving || createProductMutation.isPending) {
      return;
    }

    setIsSaving(true);

    // Validate required fields
    if (!product.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!product.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Product category is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!product.status.trim()) {
      toast({
        title: "Validation Error",
        description: "Product status is required.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Clean up empty features
    const cleanFeatures = product.features.filter((f) => f.trim() !== "");
    if (cleanFeatures.length === 0) {
      cleanFeatures.push(""); // Keep at least one empty feature
    }

    // Create product via API
    createProductMutation.mutate({
      ...product,
      features: cleanFeatures,
      images: [], // Start with empty images array
    }, {
      onSuccess: (response) => {
        const newProductId = response.data._id;
        
        // Upload images if any
        if (product.imageFiles.length > 0) {
          // Store the files to upload
          const filesToUpload = [...product.imageFiles];
          
          // Clear the imageFiles array to prevent duplicate uploads
          setProduct(prev => ({ ...prev, imageFiles: [] }));
          
          // Upload each image
          filesToUpload.forEach((file, index) => {
            setTimeout(() => {
              uploadImageMutation.mutate({
                productId: newProductId,
                imageFile: file
              });
            }, index * 500); // Stagger uploads
          });
        }
        
        // Close preview modal if it's open
        setIsPreviewModalOpen(false);
        
        // Navigate to products page
        navigate("/admin/products");
      },
      onError: (error) => {
        console.error('❌ Product creation failed:', error);
        setIsSaving(false);
      }
    });
  };

  const addFeature = () => {
    setProduct({
      ...product,
      features: [...product.features, ""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...product.features];
    newFeatures[index] = value;
    setProduct({ ...product, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = product.features.filter((_, i) => i !== index);
    setProduct({ ...product, features: newFeatures });
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
                Create New Product
              </h1>
              <p className="text-muted-foreground mt-1">
                Add a new product to your catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              disabled={!product.name.trim()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!product.name || !product.category || !product.status || createProductMutation.isPending || isSaving}
              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
            >
              {createProductMutation.isPending || isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
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
                    value={product.name}
                    onChange={(e) =>
                      setProduct({ ...product, name: e.target.value })
                    }
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={product.category}
                    onValueChange={(value) =>
                      setProduct({ ...product, category: value })
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
                    value={product.status}
                    onValueChange={(value) =>
                      setProduct({ 
                        ...product, 
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
                  value={product.shortDescription}
                  onChange={(e) =>
                    setProduct({ ...product, shortDescription: e.target.value })
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
                  value={product.fullDescription}
                  onChange={(e) =>
                    setProduct({ ...product, fullDescription: e.target.value })
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
                {product.features.map((feature, index) => (
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
                      disabled={product.features.length === 1}
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
                images={product.images}
                onImagesChange={(images, files) => {
                  setProduct({ 
                    ...product, 
                    images,
                    imageFiles: files || []
                  });
                }}
                maxImages={3}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Product Preview Modal */}
      <ProductPreview
        product={{
          _id: "preview",
          name: product.name,
          category: product.category,
          status: product.status,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          features: product.features.filter(f => f.trim() !== ""),
          images: product.images,
        }}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreview}
        onSave={handleSave}
        isCreating={true}
        isSaving={createProductMutation.isPending || isSaving}
      />
    </div>
  );
}
