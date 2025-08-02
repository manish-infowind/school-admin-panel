import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Loader2, AlertCircle, Award, Upload, X } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { AboutUsSection } from "@/api/types";

interface EditSectionModalProps {
  section: AboutUsSection | null;
  onClose: () => void;
  onSuccess?: () => void;
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
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Load section data when modal opens
  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setContent(section.content || '');
      setOrder(section.order || 1);
      setImagePreview(section.image || null);
      setImageFile(null);
      setError('');
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (order < 1) {
      setError('Order must be at least 1');
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
                  onChange={(e) => setTitle(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  className="focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500">
                  Lower numbers appear first. Sections are ordered by this number.
                </p>
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
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Section Image (Optional)
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
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
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
                <p className="text-xs text-gray-500">
                  Upload a new image to replace the current one.
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
              type="submit"
              disabled={isUpdating}
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
    </Dialog>
  );
}; 