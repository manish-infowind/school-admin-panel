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
  AlertCircle,
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
  status: "Draft" as 'Draft' | 'Published' | 'Archived',
  shortDescription: "",
  fullDescription: "",
  features: [""],
  images: [],
  imageFiles: [] as File[],
  isPublished: false,
};

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadProductImage();

  // Validation function
  const validateField = (field: keyof typeof product, value: any): string | undefined => {
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
        if (!value || value.length === 0) {
          return 'At least one product image is required';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    errors.name = validateField('name', product.name);
    errors.category = validateField('category', product.category);
    errors.status = validateField('status', product.status);
    errors.shortDescription = validateField('shortDescription', product.shortDescription);
    errors.fullDescription = validateField('fullDescription', product.fullDescription);
    errors.features = validateField('features', product.features);
    errors.images = validateField('images', product.images);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof product, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof typeof product) => {
    const error = validateField(field, product[field]);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSave = async () => {
    // Prevent multiple simultaneous saves
    if (isSaving || createProductMutation.isPending) {
      return;
    }

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

    // Clean up empty features
    const cleanFeatures = product.features.filter((f) => f.trim() !== "");

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
    
    // Clear features validation error when user starts typing
    if (validationErrors.features) {
      setValidationErrors(prev => ({ ...prev, features: undefined }));
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = product.features.filter((_, i) => i !== index);
    setProduct({ ...product, features: newFeatures });
  };

  const handlePreview = () => {
    // Validate before showing preview
    const errors = validateAllFields();
    setValidationErrors(errors);
    
    if (Object.values(errors).some(error => error !== undefined)) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before previewing.",
        variant: "destructive",
      });
      return;
    }
    
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
              disabled={!isFormValid()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid() || createProductMutation.isPending || isSaving}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
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
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="Enter product name"
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={product.category}
                    onValueChange={(value) => handleFieldChange('category', value)}
                    onOpenChange={(open) => {
                      if (!open) handleFieldBlur('category');
                    }}
                  >
                    <SelectTrigger className={validationErrors.category ? "border-red-500" : ""}>
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={product.status}
                    onValueChange={(value) => handleFieldChange('status', value)}
                    onOpenChange={(open) => {
                      if (!open) handleFieldBlur('status');
                    }}
                  >
                    <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.status && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.status}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description *</Label>
                <Textarea
                  id="shortDesc"
                  value={product.shortDescription}
                  onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                  onBlur={() => handleFieldBlur('shortDescription')}
                  placeholder="Brief description for product listings"
                  rows={2}
                  className={validationErrors.shortDescription ? "border-red-500" : ""}
                />
                {validationErrors.shortDescription && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.shortDescription}
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
                <Label htmlFor="fullDesc">Full Description *</Label>
                <Textarea
                  id="fullDesc"
                  value={product.fullDescription}
                  onChange={(e) => handleFieldChange('fullDescription', e.target.value)}
                  onBlur={() => handleFieldBlur('fullDescription')}
                  rows={8}
                  placeholder="Enter detailed product description..."
                  className={validationErrors.fullDescription ? "border-red-500" : ""}
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
                {validationErrors.features && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.features}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "images" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Images *</CardTitle>
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
                  // Clear image validation error when images are added
                  if (validationErrors.images) {
                    setValidationErrors(prev => ({ ...prev, images: undefined }));
                  }
                }}
                maxImages={3}
              />
              {validationErrors.images && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.images}
                </div>
              )}
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
