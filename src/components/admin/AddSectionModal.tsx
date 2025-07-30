import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { useCreateSection } from "@/api/hooks/useAboutUs";
import { toast } from "@/hooks/use-toast";


interface AddSectionModalProps {
  onSuccess?: () => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { createSection, isCreating, createError } = useCreateSection();

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

    try {
      // Create section with image if provided
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
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Section
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              onChange={(e) => setTitle(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="sectionContent" className="text-sm font-medium">
              Section Content *
            </Label>
            <Textarea
              id="sectionContent"
              placeholder="Enter section content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
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
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first. Sections are ordered by this number.
            </p>
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
                    className="w-full h-48 object-cover rounded-lg border"
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
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
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
                    id="section-image-upload"
                  />
                  <label htmlFor="section-image-upload" className="text-center cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              You can upload an image for this section. Image will be uploaded after section creation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
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
    </Dialog>
  );
}; 