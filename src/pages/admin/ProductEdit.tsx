import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertCircle,
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

// Validation interface
interface ValidationErrors {
  name?: string;
  category?: string;
  status?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string;
  images?: string;
}

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [localProduct, setLocalProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    status: 'Draft',
    shortDescription: '',
    fullDescription: '',
    features: [],
    images: [],
  });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Load product data from API
  const { data: productResponse, isLoading, error } = useProduct(id || '');
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();

  const product = productResponse?.data;

  // Validation function
  const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) {
          return 'Product name is required';
        }
        if (value.trim().length < 2) {
          return 'Product name must be at least 2 characters long';
        }
        if (value.trim().length > 100) {
          return 'Product name must be less than 100 characters';
        }
        break;
      
      case 'category':
        if (!value || !value.trim()) {
          return 'Product category is required';
        }
        break;
      
      case 'status':
        if (!value) {
          return 'Product status is required';
        }
        if (!['Draft', 'Published', 'Archived'].includes(value)) {
          return 'Invalid status value';
        }
        break;
      
      case 'shortDescription':
        if (!value || !value.trim()) {
          return 'Short description is required';
        }
        if (value.trim().length < 10) {
          return 'Short description must be at least 10 characters long';
        }
        if (value.trim().length > 200) {
          return 'Short description must be less than 200 characters';
        }
        break;
      
      case 'fullDescription':
        if (!value || !value.trim()) {
          return 'Full description is required';
        }
        if (value.trim().length < 20) {
          return 'Full description must be at least 20 characters long';
        }
        if (value.trim().length > 2000) {
          return 'Full description must be less than 2000 characters';
        }
        break;
      
      case 'features':
        if (!value || !Array.isArray(value)) {
          return 'At least one feature is required';
        }
        const validFeatures = value.filter((f: string) => f.trim() !== '');
        if (validFeatures.length === 0) {
          return 'At least one feature is required';
        }
        for (let i = 0; i < validFeatures.length; i++) {
          if (validFeatures[i].trim().length < 3) {
            return `Feature ${i + 1} must be at least 3 characters long`;
          }
          if (validFeatures[i].trim().length > 100) {
            return `Feature ${i + 1} must be less than 100 characters`;
          }
        }
        break;
      
      case 'images':
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'At least one product image is required';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    errors.name = validateField('name', localProduct.name);
    errors.category = validateField('category', localProduct.category);
    errors.status = validateField('status', localProduct.status);
    errors.shortDescription = validateField('shortDescription', localProduct.shortDescription);
    errors.fullDescription = validateField('fullDescription', localProduct.fullDescription);
    errors.features = validateField('features', localProduct.features);
    errors.images = validateField('images', localProduct.images);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    // Don't validate until product is loaded
    if (!product) return false;
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof localProduct, value: any) => {
    setLocalProduct(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    let value: any;
    switch (field) {
      case 'name':
        value = localProduct.name;
        break;
      case 'category':
        value = localProduct.category;
        break;
      case 'status':
        value = localProduct.status;
        break;
      case 'shortDescription':
        value = localProduct.shortDescription;
        break;
      case 'fullDescription':
        value = localProduct.fullDescription;
        break;
      case 'features':
        value = localProduct.features;
        break;
      case 'images':
        value = localProduct.images;
        break;
    }
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

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
    return null;
  }

  const handleSave = async () => {
    if (!localProduct || !id) return;

    // Validate all fields
    const errors = validateAllFields();
    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== undefined)) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update product data
      await updateProductMutation.mutateAsync({
        productId: id,
        data: {
          name: localProduct.name?.trim(),
          category: localProduct.category?.trim(),
          status: localProduct.status,
          shortDescription: localProduct.shortDescription?.trim(),
          fullDescription: localProduct.fullDescription?.trim(),
          features: localProduct.features?.filter(f => f.trim() !== ''),
          isPublished: localProduct.isPublished,
        },
      });

      // Upload new images if any
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          await uploadImageMutation.mutateAsync({
            productId: id,
            imageFile: file,
          });
        }
        setImageFiles([]);
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "default",
      });

      // Navigate back to products page
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    setLocalProduct(prev => ({
      ...prev,
      features: [...(prev.features || []), ""]
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setLocalProduct(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setLocalProduct(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
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
              <p className="text-muted-foreground mt-1">
                Update product information and settings
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isFormValid()}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Validation Error Alert */}
      {Object.values(validationErrors).some(error => error !== undefined) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix all validation errors before saving the product.
          </AlertDescription>
        </Alert>
      )}

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
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={localProduct.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select
                  value={localProduct.category || ''}
                  onValueChange={(value) => handleFieldChange('category', value)}
                >
                  <SelectTrigger className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.category ? "border-red-500" : ""}`}>
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
                {validationErrors.category && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.category}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status *
                </Label>
                <Select
                  value={localProduct.status || ''}
                  onValueChange={(value) => handleFieldChange('status', value)}
                >
                  <SelectTrigger className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.status ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.status}
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-medium">
                  Short Description *
                </Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Enter a brief description (max 200 characters)"
                  value={localProduct.shortDescription || ''}
                  onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                  onBlur={() => handleFieldBlur('shortDescription')}
                  className={`focus:ring-blue-500 focus:border-blue-500 resize-none ${validationErrors.shortDescription ? "border-red-500" : ""}`}
                  rows={3}
                />
                {validationErrors.shortDescription && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.shortDescription}
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <Label htmlFor="fullDescription" className="text-sm font-medium">
                  Full Description *
                </Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Enter detailed product description"
                  value={localProduct.fullDescription || ''}
                  onChange={(e) => handleFieldChange('fullDescription', e.target.value)}
                  onBlur={() => handleFieldBlur('fullDescription')}
                  className={`focus:ring-blue-500 focus:border-blue-500 resize-none ${validationErrors.fullDescription ? "border-red-500" : ""}`}
                  rows={6}
                />
                {validationErrors.fullDescription && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.fullDescription}
                  </div>
                )}
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
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {localProduct.features?.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              {validationErrors.features && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.features}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "images" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                images={localProduct.images || []}
                onImagesChange={(images, files) => {
                  handleFieldChange('images', images);
                  if (files) {
                    setImageFiles(prev => [...prev, ...files]);
                  }
                }}
              />
              {validationErrors.images && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.images}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Preview Modal */}
      <ProductPreview
        product={localProduct as Product}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
