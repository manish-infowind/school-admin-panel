import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Loader2, AlertCircle, Award, Upload, X, Eye } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { AboutUsSection } from "@/api/types";
import { SectionPreview } from "./SectionPreview";

interface EditSectionModalProps {
  section: AboutUsSection | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// Validation interface
interface ValidationErrors {
  title?: string;
  content?: string;
  order?: string;
  image?: string;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({ 
  section, 
  onClose, 
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  // Load section data when modal opens
  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setContent(section.content || '');
      setOrder(section.order || 1);
      setImagePreview(section.image || null);
      setImageFile(null);
      setError('');
      setValidationErrors({});
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [section]);

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
        description: "Please fix all validation errors before updating.",
        variant: "destructive",
      });
      return;
    }

    if (!section?._id) {
      setError('Section ID is missing');
      return;
    }

    try {
      setIsUpdating(true);
      setError('');

      // Import the service
      const { AboutUsService } = await import('@/api/services/aboutUsService');

      // Update section data
      await AboutUsService.updateSection(section._id, {
        title: title.trim(),
        content: content.trim(),
        order: order,
      });

      // Upload image if new image is selected
      if (imageFile) {
        try {
          await AboutUsService.uploadSectionImage(section._id, imageFile);
        } catch (uploadError) {
          console.warn('Image upload failed, but section was updated:', uploadError);
        }
      }

      toast({
        title: "Success",
        description: "Section updated successfully",
        variant: "default",
      });

      // Reset form and close modal
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
      onClose();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to update section. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  if (!section) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Section
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
                <Label htmlFor="editSectionTitle" className="text-sm font-medium">
                  Section Title *
                </Label>
                <Input
                  id="editSectionTitle"
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
                <Label htmlFor="editSectionOrder" className="text-sm font-medium">
                  Display Order *
                </Label>
                <Input
                  id="editSectionOrder"
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
                <Label htmlFor="editSectionContent" className="text-sm font-medium">
                  Section Content *
                </Label>
                <Textarea
                  id="editSectionContent"
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
                        id="edit-section-image-upload"
                      />
                      <label htmlFor="edit-section-image-upload" className="text-center cursor-pointer">
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
                  Section image is required. Upload a new image to replace the current one.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
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
              disabled={isUpdating || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Update Section
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Section Preview Modal */}
      <SectionPreview
        section={{
          id: section?._id || 'preview',
          name: 'About Us Section',
          description: 'Section content for about us page',
          status: 'Active',
          lastModified: 'Just now',
          content: {
            title: title || 'Section Title',
            subtitle: 'Section Subtitle',
            description: content || 'Section content will appear here',
            buttonText: 'Learn More',
            buttonLink: '/section',
          },
          isActive: true,
          order: order,
        }}
        products={[]}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </Dialog>
  );
}; 