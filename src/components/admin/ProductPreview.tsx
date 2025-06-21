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
import { X, Package, Star, Check } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  category: string;
  status: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: string;
  features?: string[];
  specifications?: Record<string, string>;
  images?: string[];
}

interface ProductPreviewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductPreview({
  product,
  isOpen,
  onClose,
}: ProductPreviewProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Product Preview
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                {product.price && (
                  <p className="text-2xl font-bold text-brand-green">
                    ${product.price}
                  </p>
                )}
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
                    className="aspect-square bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-lg flex items-center justify-center"
                  >
                    <Package className="h-12 w-12 text-brand-green" />
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
                  <p className="text-muted-foreground">
                    {product.fullDescription ||
                      "The MedScope Pro X1 represents the latest in diagnostic imaging technology, featuring AI-powered analysis capabilities, high-resolution imaging, and seamless integration with existing hospital systems."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {(
                      product.features || [
                        "AI-powered diagnostic analysis",
                        "4K high-resolution imaging",
                        "Cloud connectivity",
                        "Real-time collaboration tools",
                      ]
                    ).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand-green" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Specifications</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(
                    product.specifications || {
                      Resolution: "4K Ultra HD",
                      Weight: "2.5 kg",
                      Connectivity: "WiFi 6, Bluetooth 5.0",
                      "Battery Life": "8 hours continuous use",
                      Certifications: "FDA Approved, CE Marked",
                    },
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-border/50"
                    >
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Rating</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 fill-brand-green text-brand-green"
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">4.8</span>
                  <span className="text-muted-foreground">
                    out of 5 (127 reviews)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
              Edit Product
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
