import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Trash2,
  Plus,
  Package,
  Image as ImageIcon,
  FileText,
  List,
  Settings,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const initialProduct = {
  name: "",
  category: "",
  status: "Draft",
  shortDescription: "",
  fullDescription: "",
  price: "",
  features: [""],
  specifications: {},
  images: [],
  isPublished: false,
  seoTitle: "",
  seoDescription: "",
};

export default function ProductNew() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSave = () => {
    // In real app, this would save to API
    console.log("Creating new product:", product);
    // Show success message and redirect
    setTimeout(() => {
      navigate("/admin/products");
    }, 1000);
  };

  const addFeature = () => {
    setProduct({
      ...product,
      features: [...product.features, ""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...product.features];
    newFeatures[index] = value;
    setProduct({ ...product, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = product.features.filter((_, i) => i !== index);
    setProduct({ ...product, features: newFeatures });
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Package },
    { id: "description", label: "Description", icon: FileText },
    { id: "features", label: "Features", icon: List },
    { id: "specs", label: "Specifications", icon: Settings },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "seo", label: "SEO", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                Create New Product
              </h1>
              <p className="text-muted-foreground mt-1">
                Add a new product to your catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="published">Published</Label>
              <Switch
                id="published"
                checked={product.isPublished}
                onCheckedChange={(checked) =>
                  setProduct({ ...product, isPublished: checked })
                }
              />
            </div>
            <Button variant="outline" size="sm" disabled={!product.name}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!product.name || !product.category}
              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) =>
                      setProduct({ ...product, name: e.target.value })
                    }
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={product.category}
                    onChange={(e) =>
                      setProduct({ ...product, category: e.target.value })
                    }
                    placeholder="Enter category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    value={product.price}
                    onChange={(e) =>
                      setProduct({ ...product, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={product.status}
                    onChange={(e) =>
                      setProduct({ ...product, status: e.target.value })
                    }
                    placeholder="Draft"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Textarea
                  id="shortDesc"
                  value={product.shortDescription}
                  onChange={(e) =>
                    setProduct({ ...product, shortDescription: e.target.value })
                  }
                  placeholder="Brief description for product listings"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "description" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="fullDesc">Full Description</Label>
                <Textarea
                  id="fullDesc"
                  value={product.fullDescription}
                  onChange={(e) =>
                    setProduct({ ...product, fullDescription: e.target.value })
                  }
                  rows={8}
                  placeholder="Enter detailed product description..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "features" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Key Features
                <Button onClick={addFeature} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature..."
                    />
                    <Button
                      onClick={() => removeFeature(index)}
                      size="sm"
                      variant="ghost"
                      disabled={product.features.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "images" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-green/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload Image
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Recommended: High-quality images in JPG or PNG format, minimum
                800x800 pixels
              </p>
            </CardContent>
          </Card>
        )}

        {/* Other tabs would be similar to the edit page */}
      </motion.div>
    </div>
  );
}
