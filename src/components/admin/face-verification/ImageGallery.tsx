import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No images available</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (imageUrl: string) => {
    setZoomedImage(imageUrl);
    setIsZoomed(true);
  };

  return (
    <>
      <Card className={className}>
        <CardContent className="p-4">
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-2">
              <img
                src={images[currentIndex]}
                alt={`Source image ${currentIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => handleImageClick(images[currentIndex])}
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="flex items-center justify-center gap-2 mt-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageClick(images[currentIndex])}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl">
          {zoomedImage && (
            <img
              src={zoomedImage}
              alt="Zoomed image"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

