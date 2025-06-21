import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit3, Save, Eye, Package, Image } from "lucide-react";
import { motion } from "framer-motion";

const productDetails = [
  {
    id: 1,
    name: "MedScope Pro X1",
    category: "Diagnostic Equipment",
    lastModified: "2 hours ago",
    sections: ["Overview", "Specifications", "Features", "Gallery"],
  },
  {
    id: 2,
    name: "Advanced Imaging System",
    category: "Imaging Technology",
    lastModified: "1 day ago",
    sections: ["Overview", "Technical Specs", "Software Features"],
  },
  {
    id: 3,
    name: "Portable Analyzer",
    category: "Lab Equipment",
    lastModified: "3 days ago",
    sections: ["Overview", "Capabilities", "Use Cases", "Support"],
  },
];

export default function ProductDetails() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Product Details Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage detailed information for individual products
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product List */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productDetails.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="p-4 border rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-brand-blue/20 to-brand-green/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-brand-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.sections.map((section) => (
                          <Badge
                            key={section}
                            variant="outline"
                            className="text-xs"
                          >
                            {section}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last modified {product.lastModified}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed product editing tools will be available here.
                </p>
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-brand-blue/10 to-brand-green/10 text-brand-blue block"
                  >
                    Rich Text Editor
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-brand-green/10 to-brand-teal/10 text-brand-green block"
                  >
                    Image Gallery Manager
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-brand-teal/10 to-brand-blue/10 text-brand-teal block"
                  >
                    Specification Builder
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
