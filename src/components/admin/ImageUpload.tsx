import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/productStore";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (images.length + uploading.length >= maxImages) {
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

      const uploadId = `${Date.now()}-${file.name}`;
      setUploading((prev) => [...prev, uploadId]);
      setUploadProgress((prev) => ({ ...prev, [uploadId]: 0 }));

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[uploadId] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [uploadId]: current + 10 };
          });
        }, 100);

        // Upload the image
        const imageUrl = await uploadImage(file);

        // Complete the progress
        setUploadProgress((prev) => ({ ...prev, [uploadId]: 100 }));

        // Add to images list
        setTimeout(() => {
          onImagesChange([...images, imageUrl]);
          setUploading((prev) => prev.filter((id) => id !== uploadId));
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[uploadId];
            return newProgress;
          });
        }, 500);
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Failed to upload ${file.name}`);
        setUploading((prev) => prev.filter((id) => id !== uploadId));
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[uploadId];
          return newProgress;
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
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
                <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-teal/10 flex items-center justify-center">
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
