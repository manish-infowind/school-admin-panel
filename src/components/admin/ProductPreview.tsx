import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Check, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  category: string;
  status: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  images?: string[];
}

interface ProductPreviewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  isCreating?: boolean;
  isSaving?: boolean;
}

export function ProductPreview({
  product,
  isOpen,
  onClose,
  onSave,
  onEdit,
  isCreating = false,
  isSaving = false,
}: ProductPreviewProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
            Product Preview
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Product Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-brand-green" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                {product.shortDescription && (
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {product.shortDescription}
                  </p>
                )}
              </div>
              <div className="text-right space-y-2">
                <Badge
                  variant={
                    product.status === "Published" ? "default" : "secondary"
                  }
                  className={
                    product.status === "Published"
                      ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                      : ""
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Images</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-lg overflow-hidden border"
                  >
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
                      <Package className="h-12 w-12 text-brand-green" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 aspect-video bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-brand-green mb-2" />
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="max-h-64 overflow-y-auto">
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">
                      {product.fullDescription ||
                        "The MedScope Pro X1 represents the latest in diagnostic imaging technology, featuring AI-powered analysis capabilities, high-resolution imaging, and seamless integration with existing hospital systems."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(
                      product.features || [
                        "AI-powered diagnostic analysis",
                        "4K high-resolution imaging",
                        "Cloud connectivity",
                        "Real-time collaboration tools",
                      ]
                    ).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand-green flex-shrink-0" />
                        <span className="text-sm break-words">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>



          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            {isCreating ? (
              <Button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
              >
                {isSaving ? (
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
            ) : (
              <Button 
                onClick={() => {
                  onClose(); // Close the preview modal
                  onEdit?.(); // Call the edit handler
                }}
                className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
              >
                Edit Product
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
