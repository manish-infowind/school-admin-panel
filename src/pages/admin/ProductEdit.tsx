import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { productStore, type Product } from "@/lib/productStore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/hooks/use-toast";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load product data
  useEffect(() => {
    if (id) {
      const productData = productStore.getProduct(parseInt(id));
      if (productData) {
        setProduct(productData);
      } else {
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    }
    setLoading(false);
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist.
        </p>
        <Link to="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      // Validate required fields
      if (!product.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!product.category.trim()) {
        toast({
          title: "Validation Error",
          description: "Product category is required.",
          variant: "destructive",
        });
        return;
      }

      // Update product in store
      const updatedProduct = productStore.updateProduct(product.id, product);

      if (updatedProduct) {
        toast({
          title: "Success!",
          description: "Product updated successfully.",
        });

        // Navigate back after short delay
        setTimeout(() => {
          navigate("/admin/products");
        }, 1000);
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
                Edit Product
              </h1>
              <p className="text-muted-foreground mt-1">{product.name}</p>
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
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
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
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) =>
                      setProduct({ ...product, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={product.category}
                    onChange={(e) =>
                      setProduct({ ...product, category: e.target.value })
                    }
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "specs" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Technical Specifications
                <Button
                  onClick={() => {
                    const key = prompt("Enter specification name:");
                    if (key) {
                      setProduct({
                        ...product,
                        specifications: {
                          ...product.specifications,
                          [key]: "",
                        },
                      });
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Spec
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-2 items-center"
                  >
                    <Label className="font-medium">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          specifications: {
                            ...product.specifications,
                            [key]: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter value..."
                    />
                    <Button
                      onClick={() => {
                        const newSpecs = { ...product.specifications };
                        delete newSpecs[key];
                        setProduct({ ...product, specifications: newSpecs });
                      }}
                      size="sm"
                      variant="ghost"
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
              <ImageUpload
                images={product.images}
                onImagesChange={(images) => setProduct({ ...product, images })}
                maxImages={8}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "seo" && (
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={product.seoTitle}
                  onChange={(e) =>
                    setProduct({ ...product, seoTitle: e.target.value })
                  }
                  placeholder="Enter SEO title..."
                />
                <p className="text-xs text-muted-foreground">
                  {product.seoTitle.length}/60 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDesc">SEO Description</Label>
                <Textarea
                  id="seoDesc"
                  value={product.seoDescription}
                  onChange={(e) =>
                    setProduct({ ...product, seoDescription: e.target.value })
                  }
                  placeholder="Enter SEO description..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {product.seoDescription.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
