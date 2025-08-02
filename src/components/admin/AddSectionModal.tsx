import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, Award, Upload, X, Eye } from "lucide-react";
import { useCreateSection } from "@/api/hooks/useAboutUs";
import { toast } from "@/hooks/use-toast";
import { SectionPreview } from "./SectionPreview";

interface AddSectionModalProps {
  onSuccess?: () => void;
}

// Validation interface
interface ValidationErrors {
  title?: string;
  content?: string;
  order?: string;
  image?: string;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { createSection, isCreating, createError } = useCreateSection();

  // Validation function
  const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || !value.trim()) {
          return 'Section title is required';
        }
        if (value.trim().length < 3) {
          return 'Section title must be at least 3 characters long';
        }
        if (value.trim().length > 100) {
          return 'Section title must be less than 100 characters';
        }
        break;
      
      case 'content':
        if (!value || !value.trim()) {
          return 'Section content is required';
        }
        if (value.trim().length < 10) {
          return 'Section content must be at least 10 characters long';
        }
        if (value.trim().length > 2000) {
          return 'Section content must be less than 2000 characters';
        }
        break;
      
      case 'order':
        if (!value || value < 1) {
          return 'Display order must be at least 1';
        }
        if (value > 999) {
          return 'Display order must be less than 1000';
        }
        break;
      
      case 'image':
        if (!imagePreview && !imageFile) {
          return 'Section image is required';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    errors.title = validateField('title', title);
    errors.content = validateField('content', content);
    errors.order = validateField('order', order);
    errors.image = validateField('image', imagePreview || imageFile);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof ValidationErrors, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'content':
        setContent(value);
        break;
      case 'order':
        setOrder(value);
        break;
    }
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    let value: any;
    switch (field) {
      case 'title':
        value = title;
        break;
      case 'content':
        value = content;
        break;
      case 'order':
        value = order;
        break;
      case 'image':
        value = imagePreview || imageFile;
        break;
    }
    
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = validateAllFields();
    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== undefined)) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before creating.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSection({
        title: title.trim(),
        content: content.trim(),
        order: order,
        imageFile: imageFile || undefined,
      });

      toast({
        title: "Success",
        description: "Section created successfully",
        variant: "default",
      });

      // Reset form
      setTitle('');
      setContent('');
      setOrder(1);
      setImageFile(null);
      setImagePreview(null);
      setValidationErrors({});
      setOpen(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to create section. Please try again.');
    }
  };

  // Handle create error
  React.useEffect(() => {
    if (createError) {
      setError('Failed to create section. Please try again.');
    }
  }, [createError]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Add New Section
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="sectionTitle" className="text-sm font-medium">
                  Section Title *
                </Label>
                <Input
                  id="sectionTitle"
                  type="text"
                  placeholder="Enter section title"
                  value={title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => handleFieldBlur('title')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.title ? "border-red-500" : ""}`}
                />
                {validationErrors.title && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.title}
                  </div>
                )}
              </div>

              {/* Order Field */}
              <div className="space-y-2">
                <Label htmlFor="sectionOrder" className="text-sm font-medium">
                  Display Order *
                </Label>
                <Input
                  id="sectionOrder"
                  type="number"
                  min="1"
                  placeholder="Enter display order"
                  value={order}
                  onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                  onBlur={() => handleFieldBlur('order')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.order ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-gray-500">
                  Lower numbers appear first. Sections are ordered by this number.
                </p>
                {validationErrors.order && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.order}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Content and Image */}
            <div className="space-y-4">
              {/* Content Field */}
              <div className="space-y-2">
                <Label htmlFor="sectionContent" className="text-sm font-medium">
                  Section Content *
                </Label>
                <Textarea
                  id="sectionContent"
                  placeholder="Enter section content..."
                  value={content}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                  onBlur={() => handleFieldBlur('content')}
                  className={`min-h-[120px] focus:ring-blue-500 focus:border-blue-500 resize-none ${validationErrors.content ? "border-red-500" : ""}`}
                />
                {validationErrors.content && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.content}
                  </div>
                )}
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Section Image *
                </Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          // Clear image validation error
                          setValidationErrors(prev => ({ ...prev, image: undefined }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer ${validationErrors.image ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target?.result as string);
                            reader.readAsDataURL(file);
                            // Clear image validation error
                            setValidationErrors(prev => ({ ...prev, image: undefined }));
                          }
                        }}
                        id="section-image-upload"
                      />
                      <label htmlFor="section-image-upload" className="text-center cursor-pointer">
                        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                      </label>
                    </div>
                  )}
                </div>
                {validationErrors.image && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.image}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Section image is required. Image will be uploaded after section creation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!title.trim() || !content.trim()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Section
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Section Preview Modal */}
      <SectionPreview
        section={{
          id: 'preview',
          name: 'New Section',
          description: 'Section being created',
          status: 'Draft',
          lastModified: 'Just now',
          content: {
            title: title || 'Section Title',
            subtitle: 'Section Subtitle',
            description: content || 'Section content will appear here',
            buttonText: 'Learn More',
            buttonLink: '/section',
          },
          isActive: false,
          order: order,
        }}
        products={[]}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </Dialog>
  );
}; 