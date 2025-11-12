import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, ArrowRight, ExternalLink, Eye, Package } from "lucide-react";
import { motion } from "framer-motion";

interface IndexPageSection {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  status?: string;
  lastModified?: string;
  content: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    featuredProducts?: string[];
  };
  isActive: boolean;
  order: number;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  shortDescription?: string;
  images?: string[];
}

interface SectionPreviewProps {
  section: IndexPageSection;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function SectionPreview({
  section,
  products,
  isOpen,
  onClose,
}: SectionPreviewProps) {
  const renderSection = () => {
    switch (section.name) {
      case "Hero Section":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-[400px] bg-brand-green/10 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand-green/5"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="max-w-3xl mx-auto space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent mb-4">
                    {section.content.title}
                  </h1>
                  <p className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                    {section.content.subtitle}
                  </p>
                  <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
                    {section.content.description}
                  </p>
                  <Button
                    size="lg"
                    className="bg-brand-green hover:bg-brand-green/90 text-white px-6 py-2 text-base"
                  >
                    {section.content.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case "About Section":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-12 px-6 bg-white rounded-xl border"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {section.content.title}
                </h2>
                <p className="text-lg text-brand-teal font-semibold mb-4">
                  {section.content.subtitle}
                </p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  {section.content.description}
                </p>
              </div>
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  {section.content.buttonText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "Featured Products":
        const featuredProducts = section.content.featuredProducts
          ?.map(productId => products.find(p => p._id === productId))
          .filter(Boolean) || [];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-12 px-6 bg-gray-50 rounded-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {section.content.title}
                </h2>
                <p className="text-lg text-brand-teal font-semibold mb-4">
                  {section.content.subtitle}
                </p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  {section.content.description}
                </p>
              </div>
              
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {featuredProducts.map((product, productIndex) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: productIndex * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <img
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                          {product.shortDescription && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white text-xs"
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-3">
                    <Package className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">No featured products selected</p>
                </div>
              )}
              
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  {section.content.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "Contact Information":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-12 px-6 bg-white rounded-xl border"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {section.content.title}
                </h2>
                <p className="text-lg text-brand-teal font-semibold mb-4">
                  {section.content.subtitle}
                </p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  {section.content.description}
                </p>
              </div>
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  {section.content.buttonText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-12 px-6 bg-white rounded-xl border"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {section.content.title}
                </h2>
                <p className="text-lg text-brand-teal font-semibold mb-4">
                  {section.content.subtitle}
                </p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  {section.content.description}
                </p>
              </div>
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  {section.content.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {section.name} Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">{section.name}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={section.isActive ? "default" : "secondary"}
                className={
                  section.isActive
                    ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                    : ""
                }
              >
                {section.status}
              </Badge>
              <span className="text-xs text-gray-500">Order: {section.order}</span>
            </div>
          </div>

          <Separator />

          {/* Section Preview */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Preview:</h4>
            {renderSection()}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 