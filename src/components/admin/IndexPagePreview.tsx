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

interface IndexPagePreviewProps {
  sections: IndexPageSection[];
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function IndexPagePreview({
  sections,
  products,
  isOpen,
  onClose,
}: IndexPagePreviewProps) {
  // Filter only active sections and sort by order
  const activeSections = sections
    .filter(section => section.isActive)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: IndexPageSection, index: number) => {
    switch (section.name) {
      case "Hero Section":
        return (
          <motion.div
            key={section.id || section._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative min-h-[500px] bg-gradient-to-br from-brand-green/10 via-brand-teal/10 to-brand-blue/10 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-brand-teal/5"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16">
              <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent mb-4">
                    {section.content.title}
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
                    {section.content.subtitle}
                  </p>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    {section.content.description}
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80 text-white px-8 py-3 text-lg"
                  >
                    {section.content.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case "About Section":
        return (
          <motion.div
            key={section.id || section._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="py-16 px-6 bg-white"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
                <p className="text-xl text-brand-teal font-semibold mb-6">
                  {section.content.subtitle}
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
            key={section.id || section._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="py-16 px-6 bg-gray-50"
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
                <p className="text-xl text-brand-teal font-semibold mb-6">
                  {section.content.subtitle}
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  {section.content.description}
                </p>
              </div>
              
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product, productIndex) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: productIndex * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            <img
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                          {product.shortDescription && (
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                              {product.shortDescription}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Package className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500">No featured products selected</p>
                </div>
              )}
              
              <div className="text-center mt-8">
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
            key={section.id || section._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="py-16 px-6 bg-white"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
                <p className="text-xl text-brand-teal font-semibold mb-6">
                  {section.content.subtitle}
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
            key={section.id || section._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="py-16 px-6 bg-white"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
                <p className="text-xl text-brand-teal font-semibold mb-6">
                  {section.content.subtitle}
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Homepage Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {activeSections.length > 0 ? (
            activeSections.map((section, index) => (
              <div key={section.id || section._id}>
                {renderSection(section, index)}
                {index < activeSections.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <div className="py-16 px-6 text-center">
              <div className="text-gray-400 mb-4">
                <Home className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Active Sections
              </h3>
              <p className="text-gray-500">
                Add and activate sections to see them in the preview.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Preview showing {activeSections.length} active sections
            </div>
            <Button onClick={onClose} variant="outline">
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 