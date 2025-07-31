import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[], files?: File[]) => void;
  maxImages?: number;
  productId?: string; // Optional: if provided, will upload to API
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [uploading, setUploading] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        break;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not an image`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      // Create local preview URL
      const imageUrl = URL.createObjectURL(file);
      
      // Track the file object
      const newImageFiles = [...imageFiles, file];
      setImageFiles(newImageFiles);
      
      // Add to images list immediately for preview
      onImagesChange([...images, imageUrl], newImageFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    onImagesChange(newImages, newImageFiles);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={`image-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-teal/10 flex items-center justify-center hidden">
                  <ImageIcon className="h-12 w-12 text-brand-green" />
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Image {index + 1}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Upload progress indicators */}
          {uploading.map((uploadId) => (
            <motion.div
              key={uploadId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square border-2 border-dashed border-brand-green/50 rounded-lg bg-brand-green/5"
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <Loader2 className="h-8 w-8 text-brand-green animate-spin mb-2" />
                <Progress
                  value={uploadProgress[uploadId] || 0}
                  className="w-full mb-2"
                />
                <span className="text-xs text-muted-foreground">
                  {uploadProgress[uploadId] || 0}%
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload button */}
        {images.length + uploading.length < maxImages && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-green/50 transition-colors"
            onClick={handleUploadClick}
          >
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload Image</p>
              <p className="text-xs text-muted-foreground mt-1">
                {images.length}/{maxImages}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Recommended: High-quality images, minimum 800x800 pixels</p>
      </div>
    </div>
  );
}
