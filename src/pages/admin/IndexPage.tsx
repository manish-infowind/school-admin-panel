import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Home,
  Edit3,
  Save,
  Eye,
  Settings,
  Layout,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductService, Product } from "@/api/services/productService";
import { IndexPageService, IndexPageSection } from "@/api/services/indexPageService";
import { IndexPagePreview } from "@/components/admin/IndexPagePreview";
import { SectionPreview } from "@/components/admin/SectionPreview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Use the API interface instead of local one
type PageSection = IndexPageSection;

// Available section names for dropdown
const availableSectionNames = [
  {
    value: "Hero Section",
    label: "Hero Section",
    description: "Main banner with company branding",
  },
  {
    value: "About Section", 
    label: "About Section",
    description: "Company overview and mission",
  },
  {
    value: "Featured Products",
    label: "Featured Products",
    description: "Showcase 4 selected products",
  },
  {
    value: "Contact Information",
    label: "Contact Information", 
    description: "Contact details and location",
  },
];

const initialSections: PageSection[] = [
  {
    id: "1",
    name: "Hero Section",
    description: "Main banner with company branding",
    status: "Active",
    lastModified: "2 hours ago",
    content: {
      title: "Advanced Medical Technology",
      subtitle: "MedoScopic Pharma",
      description:
        "Leading the future of medical diagnostics with innovative solutions that improve patient outcomes and healthcare efficiency.",
      buttonText: "Explore Products",
      buttonLink: "/products",
    },
    isActive: true,
    order: 1,
  },
  {
    id: "2",
    name: "About Section",
    description: "Company overview and mission",
    status: "Active",
    lastModified: "1 day ago",
    content: {
      title: "About MedoScopic",
      subtitle: "Innovation in Healthcare",
      description:
        "We are dedicated to developing cutting-edge medical technologies that enhance diagnostic accuracy and improve patient care worldwide.",
      buttonText: "Learn More",
      buttonLink: "/about",
    },
    isActive: true,
    order: 2,
  },
  {
    id: "3",
    name: "Contact Information",
    description: "Contact details and location",
    status: "Active",
    lastModified: "1 week ago",
    content: {
      title: "Get in Touch",
      subtitle: "Contact Our Team",
      description:
        "Ready to learn more about our products? Contact our expert team for personalized consultation and support.",
      buttonText: "Contact Us",
      buttonLink: "/contact",
    },
    isActive: true,
    order: 3,
  },
];

export default function IndexPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sections");
  const [newSectionType, setNewSectionType] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionData, setNewSectionData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    section: PageSection | null;
  }>({
    isOpen: false,
    section: null,
  });
  const [isPagePreviewOpen, setIsPagePreviewOpen] = useState(false);
  const [isSectionPreviewOpen, setIsSectionPreviewOpen] = useState(false);

  // Load sections and products from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load sections
        const sectionsResponse = await IndexPageService.getSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
        } else {
          // Fallback to initial sections if API fails
          setSections(initialSections);
        }

        // Load products
        const productsResponse = await ProductService.getProducts({ limit: 100 });
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data.products);
        } else {
          // Fallback to mock products if API fails
          setProducts([
            {
              _id: "1",
              name: "Paracitamol",
              category: "Ophthalmology",
              status: "Published",
              shortDescription: "Test product",
              fullDescription: "Test description",
              features: [],
              images: ["/placeholder.svg"],
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              _id: "2", 
              name: "Test Product 2",
              category: "Diagnostic Equipment",
              status: "Published",
              shortDescription: "Test product 2",
              fullDescription: "Test description 2",
              features: [],
              images: ["/placeholder.svg"],
              isPublished: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ]);
        }
      } catch (error) {
        // Use fallback data
        setSections(initialSections);
        setProducts([
          {
            _id: "1",
            name: "Paracitamol",
            category: "Ophthalmology", 
            status: "Published",
            shortDescription: "Test product",
            fullDescription: "Test description",
            features: [],
            images: ["/placeholder.svg"],
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "2",
            name: "Test Product 2",
            category: "Diagnostic Equipment",
            status: "Published", 
            shortDescription: "Test product 2",
            fullDescription: "Test description 2",
            features: [],
            images: ["/placeholder.svg"],
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]);
        toast({
          title: "Warning",
          description: "Using fallback data. API connection failed.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await IndexPageService.updateIndexPage({
        pageTitle: "Homepage",
        sections: sections,
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "Homepage content saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save homepage content.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (section: PageSection) => {
    // Get the correct ID (either id or _id)
    const sectionId = section.id || section._id;
    
    // Validate required fields
    if (!section.content.title.trim() || !section.content.subtitle.trim() || 
        !section.content.description.trim() || !section.content.buttonText.trim() || 
        !section.content.buttonLink.trim()) {
      toast({
        title: "Error",
        description: "All fields are required. Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (sectionId) {
        // Update existing section via API
        const response = await IndexPageService.updateSection(sectionId, {
          name: section.name,
          description: section.description,
          content: section.content,
          isActive: section.isActive,
          order: section.order,
        });

        if (response.success) {
          // Update local state
          const updatedSections = sections.map((s) =>
            (s.id || s._id) === sectionId ? { ...section, lastModified: "Just now" } : s,
          );
          setSections(updatedSections);

          toast({
            title: "Success!",
            description: `${section.name} updated successfully.`,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to save section - API response not successful.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No section ID available for update.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = (id: string) => {
    const section = sections.find((s) => (s.id || s._id) === id);
    if (!section) return;

    // Open delete confirmation dialog
    setDeleteDialog({
      isOpen: true,
      section: section,
    });
  };

  const confirmDeleteSection = async () => {
    const section = deleteDialog.section;
    if (!section) return;

    // Get the correct ID (either id or _id)
    const sectionId = section.id || section._id;
    const sectionIdForComparison = section.id || section._id;

    try {
      // Try API call first
      try {
        if (sectionId) {
          const response = await IndexPageService.deleteSection(sectionId);
          
          if (response.success) {
            // Update local state
            setSections(sections.filter((s) => (s.id || s._id) !== sectionIdForComparison));
            if ((selectedSection?.id || selectedSection?._id) === sectionIdForComparison) {
              setSelectedSection(null);
              setActiveTab("sections");
            }
            
            toast({
              title: "Success!",
              description: `${section.name} deleted successfully.`,
            });
            setDeleteDialog({ isOpen: false, section: null });
            return;
          }
        }
      } catch (apiError) {
      // Fallback: Update local state only if API fails
      setSections(sections.filter((s) => (s.id || s._id) !== sectionIdForComparison));
      if ((selectedSection?.id || selectedSection?._id) === sectionIdForComparison) {
        setSelectedSection(null);
        setActiveTab("sections");
      }
      
      toast({
        title: "Success!",
        description: `${section.name} deleted successfully (local only).`,
      });
      setDeleteDialog({ isOpen: false, section: null });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelDeleteSection = () => {
    setDeleteDialog({ isOpen: false, section: null });
  };

  const handleAddSection = () => {
    if (!newSectionType) {
      toast({
        title: "Error",
        description: "Please select a section type to add.",
        variant: "destructive",
      });
      return;
    }

    // Check if section already exists
    const existingSection = sections.find(s => s.name === newSectionType);
    if (existingSection) {
      toast({
        title: "Error",
        description: `${newSectionType} already exists.`,
        variant: "destructive",
      });
      return;
    }

    // For Featured Products, create directly without form
    if (newSectionType === "Featured Products") {
      handleCreateFeaturedProductsSection();
      return;
    }

    // Initialize form data with section type
    setNewSectionData({
      title: newSectionType,
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
    });
    
    setShowAddForm(true);
    setActiveTab("edit");
  };

  const handleCreateFeaturedProductsSection = async () => {
    setSaving(true);
    try {
      const response = await IndexPageService.createSection({
        name: "Featured Products",
        description: "Showcase 4 selected products",
        content: {
          title: "Featured Products",
          subtitle: "Our Best Solutions",
          description: "Discover our most popular medical technologies",
          buttonText: "View All Products",
          buttonLink: "/products",
          featuredProducts: [],
        },
        isActive: false,
        order: sections.length + 1,
      });

      if (response.success && response.data) {
        setSections([...sections, response.data]);
        setNewSectionType("");
        
        toast({
          title: "Success!",
          description: "Featured Products section created successfully. You can now select products.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create Featured Products section.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewSection = async () => {
    // Validate required fields
    if (!newSectionData.title.trim() || !newSectionData.subtitle.trim() || 
        !newSectionData.description.trim() || !newSectionData.buttonText.trim() || 
        !newSectionData.buttonLink.trim()) {
      toast({
        title: "Error",
        description: "All fields are required. Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const sectionTemplate = availableSectionNames.find(s => s.value === newSectionType);
      if (!sectionTemplate) return;

      const response = await IndexPageService.createSection({
        name: newSectionType,
        description: sectionTemplate.description,
        content: {
          title: newSectionData.title,
          subtitle: newSectionData.subtitle,
          description: newSectionData.description,
          buttonText: newSectionData.buttonText,
          buttonLink: newSectionData.buttonLink,
          featuredProducts: newSectionType === "Featured Products" ? [] : undefined,
        },
        isActive: false,
        order: sections.length + 1,
      });

      if (response.success && response.data) {
        setSections([...sections, response.data]);
        setNewSectionType("");
        setShowAddForm(false);
        setNewSectionData({
          title: "",
          subtitle: "",
          description: "",
          buttonText: "",
          buttonLink: "",
        });
        
        toast({
          title: "Success!",
          description: `${newSectionType} added successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add section.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAddSection = () => {
    setShowAddForm(false);
    setNewSectionType("");
    setNewSectionData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
    });
    setActiveTab("sections");
  };

  const handleAddFeaturedProduct = async (productId: string) => {
    // Get the correct ID (either id or _id)
    const sectionId = selectedSection?.id || selectedSection?._id;
    
    if (!selectedSection || selectedSection.name !== "Featured Products" || !sectionId) {
      return;
    }
    
    const currentProducts = selectedSection.content.featuredProducts || [];
    
    // Check if product is already featured
    if (currentProducts.includes(productId)) {
      toast({
        title: "Error",
        description: "Product is already featured.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we're at the limit
    if (currentProducts.length >= 4) {
      toast({
        title: "Error",
        description: "Maximum 4 products can be featured.",
        variant: "destructive",
      });
      return;
    }
    
    // Safety check: If current products array is corrupted (more than 4 items), reset it
    let newFeaturedProducts: string[];
    if (currentProducts.length > 4) {
      const updatedSection = {
        ...selectedSection,
        content: {
          ...selectedSection.content,
          featuredProducts: [],
        },
      };
      setSelectedSection(updatedSection);
      
      // Update sections list
      const updatedSections = sections.map(s => 
        (s.id || s._id) === sectionId ? updatedSection : s
      );
      setSections(updatedSections);
      
      // Try again with empty array
      newFeaturedProducts = [productId];
    } else {
      newFeaturedProducts = [...currentProducts, productId];
    }
    
    // Double-check: Ensure we never send more than 4 items
    if (newFeaturedProducts.length > 4) {
      toast({
        title: "Error",
        description: "Cannot add more than 4 featured products.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newFeaturedProducts = [...currentProducts, productId];
      
      // Double-check: Ensure we never send more than 4 items
      if (newFeaturedProducts.length > 4) {
        toast({
          title: "Error",
          description: "Cannot add more than 4 featured products.",
          variant: "destructive",
        });
        return;
      }
      
      // Try API call first
      try {
        const requestData = {
          content: {
            ...selectedSection.content,
            featuredProducts: newFeaturedProducts,
          },
        };
        
        const response = await IndexPageService.updateSection(sectionId, requestData);

        if (response.success && response.data) {
          // Update local state
          const updatedSection = {
            ...selectedSection,
            content: {
              ...selectedSection.content,
              featuredProducts: newFeaturedProducts,
            },
          };
          setSelectedSection(updatedSection);

          // Update sections list
          const updatedSections = sections.map(s => 
            (s.id || s._id) === sectionId ? updatedSection : s
          );
          setSections(updatedSections);

          toast({
            title: "Success!",
            description: "Product added to featured products.",
          });
          return;
        }
      } catch (apiError) {
        // Check if it's a validation error
        if (apiError.status === 400) {
          toast({
            title: "Validation Error",
            description: apiError.message || "Invalid data sent to server.",
            variant: "destructive",
          });
          return;
        }
      }

      // Fallback: Update local state only if API fails
      const updatedSection = {
        ...selectedSection,
        content: {
          ...selectedSection.content,
          featuredProducts: newFeaturedProducts,
        },
      };
      setSelectedSection(updatedSection);

      // Update sections list
      const updatedSections = sections.map(s => 
        (s.id || s._id) === sectionId ? updatedSection : s
      );
      setSections(updatedSections);

      toast({
        title: "Success!",
        description: "Product added to featured products (local only).",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to featured products.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFeaturedProduct = async (productId: string) => {
    // Get the correct ID (either id or _id)
    const sectionId = selectedSection?.id || selectedSection?._id;
    
    if (!selectedSection || selectedSection.name !== "Featured Products" || !sectionId) return;
    
    const currentProducts = selectedSection.content.featuredProducts || [];
    const newFeaturedProducts = currentProducts.filter(id => id !== productId);

    try {
      // Try API call first
      try {
        const requestData = {
          content: {
            ...selectedSection.content,
            featuredProducts: newFeaturedProducts,
          },
        };
        
        const response = await IndexPageService.updateSection(sectionId, requestData);

        if (response.success && response.data) {
          // Update local state
          const updatedSection = {
            ...selectedSection,
            content: {
              ...selectedSection.content,
              featuredProducts: newFeaturedProducts,
            },
          };
          setSelectedSection(updatedSection);

          // Update sections list
          const updatedSections = sections.map(s => 
            (s.id || s._id) === sectionId ? updatedSection : s
          );
          setSections(updatedSections);

          toast({
            title: "Success!",
            description: "Product removed from featured products.",
          });
          return;
        }
      } catch (apiError) {
        // Check if it's a validation error
        if (apiError.status === 400) {
          toast({
            title: "Validation Error",
            description: apiError.message || "Invalid data sent to server.",
            variant: "destructive",
          });
          return;
        }
      }

      // Fallback: Update local state only if API fails
      const updatedSection = {
        ...selectedSection,
        content: {
          ...selectedSection.content,
          featuredProducts: newFeaturedProducts,
        },
      };
      setSelectedSection(updatedSection);

      // Update sections list
      const updatedSections = sections.map(s => 
        (s.id || s._id) === sectionId ? updatedSection : s
      );
      setSections(updatedSections);

      toast({
        title: "Success!",
        description: "Product removed from featured products (local only).",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove product from featured products.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSectionStatus = async (section: PageSection, newStatus: boolean) => {
    const sectionId = section.id || section._id;
    if (!sectionId) return;

    try {
      // Try API call first
      try {
        const response = await IndexPageService.updateSectionStatus(sectionId, {
          isActive: newStatus,
        });

        if (response.success && response.data) {
          // Update local state
          const updatedSection: IndexPageSection = {
            ...section,
            isActive: newStatus,
            status: newStatus ? "Active" : "Draft",
          };

          // Update sections list
          const updatedSections = sections.map(s => 
            (s.id || s._id) === sectionId ? updatedSection : s
          );
          setSections(updatedSections);

          // Update selected section if it's the same one
          if (selectedSection && (selectedSection.id || selectedSection._id) === sectionId) {
            setSelectedSection(updatedSection);
          }

          toast({
            title: "Success!",
            description: `${section.name} ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          });
          return;
        }
      } catch (apiError) {
        // Check if it's a validation error
        if (apiError.status === 400) {
          toast({
            title: "Validation Error",
            description: apiError.message || "Invalid data sent to server.",
            variant: "destructive",
          });
          return;
        }
      }

      // Fallback: Update local state only if API fails
      const updatedSection: IndexPageSection = {
        ...section,
        isActive: newStatus,
        status: newStatus ? "Active" : "Draft",
      };

      // Update sections list
      const updatedSections = sections.map(s => 
        (s.id || s._id) === sectionId ? updatedSection : s
      );
      setSections(updatedSections);

      // Update selected section if it's the same one
      if (selectedSection && (selectedSection.id || selectedSection._id) === sectionId) {
        setSelectedSection(updatedSection);
      }

      toast({
        title: "Success!",
        description: `${section.name} ${newStatus ? 'activated' : 'deactivated'} (local only).`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading index page data...</p>
        </div>
      </div>
    );
  }

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
              Index Page Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your homepage content and sections
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsPagePreviewOpen(true)}
            >
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections">Page Sections</TabsTrigger>
          <TabsTrigger value="edit">Edit Section</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Homepage Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id || section._id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-brand-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{section.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Modified {section.lastModified}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          section.status === "Active" ? "default" : "secondary"
                        }
                        className={
                          section.status === "Active"
                            ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                            : ""
                        }
                      >
                        {section.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isActive}
                          onCheckedChange={(checked) => handleToggleSectionStatus(section, checked)}
                        />
                        <Label className="text-xs">Active</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSection(section);
                          setActiveTab("edit");
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id || section._id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add New Section */}
                <motion.div
                  className="flex items-center gap-4 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: sections.length * 0.1 }}
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-muted-foreground">Add New Section</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a section type to add to your homepage
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={newSectionType} onValueChange={setNewSectionType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSectionNames.map((section) => {
                          const exists = sections.some(s => s.name === section.value);
                          return (
                            <SelectItem 
                              key={section.value} 
                              value={section.value}
                              disabled={exists}
                              className={exists ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <div>
                                <div className="font-medium">
                                  {section.label}
                                  {exists && <span className="text-xs text-muted-foreground ml-2">(Already exists)</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{section.description}</div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddSection}
                      disabled={!newSectionType}
                      size="sm"
                      className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {showAddForm && newSectionType !== "Featured Products" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Create New {newSectionType}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={false}
                        disabled
                      />
                      <Label className="text-muted-foreground">Active (will be Draft initially)</Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newTitle" className="text-red-500">* Title</Label>
                      <Input
                        id="newTitle"
                        value={newSectionData.title}
                        onChange={(e) =>
                          setNewSectionData({
                            ...newSectionData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Section title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSubtitle" className="text-red-500">* Subtitle</Label>
                      <Input
                        id="newSubtitle"
                        value={newSectionData.subtitle}
                        onChange={(e) =>
                          setNewSectionData({
                            ...newSectionData,
                            subtitle: e.target.value,
                          })
                        }
                        placeholder="Section subtitle"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newDescription" className="text-red-500">* Description</Label>
                    <Textarea
                      id="newDescription"
                      value={newSectionData.description}
                      onChange={(e) =>
                        setNewSectionData({
                          ...newSectionData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Section description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newButtonText" className="text-red-500">* Button Text</Label>
                      <Input
                        id="newButtonText"
                        value={newSectionData.buttonText}
                        onChange={(e) =>
                          setNewSectionData({
                            ...newSectionData,
                            buttonText: e.target.value,
                          })
                        }
                        placeholder="Button text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newButtonLink" className="text-red-500">* Button Link</Label>
                      <Input
                        id="newButtonLink"
                        value={newSectionData.buttonLink}
                        onChange={(e) =>
                          setNewSectionData({
                            ...newSectionData,
                            buttonLink: e.target.value,
                          })
                        }
                        placeholder="/page-url"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleSaveNewSection}
                      disabled={saving}
                      className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Section
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancelAddSection}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : selectedSection ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Edit {selectedSection.name}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedSection.isActive}
                        onCheckedChange={(checked) => handleToggleSectionStatus(selectedSection, checked)}
                      />
                      <Label>Active</Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-red-500">* Title</Label>
                      <Input
                        id="title"
                        value={selectedSection.content.title}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            content: {
                              ...selectedSection.content,
                              title: e.target.value,
                            },
                          })
                        }
                        placeholder="Section title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle" className="text-red-500">* Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={selectedSection.content.subtitle}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            content: {
                              ...selectedSection.content,
                              subtitle: e.target.value,
                            },
                          })
                        }
                        placeholder="Section subtitle"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-red-500">* Description</Label>
                    <Textarea
                      id="description"
                      value={selectedSection.content.description}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          content: {
                            ...selectedSection.content,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Section description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buttonText" className="text-red-500">* Button Text</Label>
                      <Input
                        id="buttonText"
                        value={selectedSection.content.buttonText}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            content: {
                              ...selectedSection.content,
                              buttonText: e.target.value,
                            },
                          })
                        }
                        placeholder="Button text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buttonLink" className="text-red-500">* Button Link</Label>
                      <Input
                        id="buttonLink"
                        value={selectedSection.content.buttonLink}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            content: {
                              ...selectedSection.content,
                              buttonLink: e.target.value,
                            },
                          })
                        }
                        placeholder="/page-url"
                        required
                      />
                    </div>
                  </div>

                  {/* Featured Products Selection */}
                  {selectedSection.name === "Featured Products" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Featured Products</Label>
                        <Badge variant="outline">
                          {selectedSection.content.featuredProducts?.length || 0}/4 selected
                        </Badge>
                      </div>
                      
                      {/* Selected Products */}
                      {selectedSection.content.featuredProducts && selectedSection.content.featuredProducts.length > 0 && (
                        <div className="grid gap-3 md:grid-cols-2">
                          {selectedSection.content.featuredProducts.map((productId) => {
                            const product = products.find(p => p._id === productId);
                            if (!product) return null;
                            
                            return (
                              <div key={productId} className="flex items-center gap-3 p-3 border rounded-lg">
                                <img 
                                  src={product.images[0] || "/placeholder.svg"} 
                                  alt={product.name}
                                  className="h-12 w-12 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground">{product.category}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFeaturedProduct(productId)}
                                  className="hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Available Products */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Available Products ({products.length} total)
                        </Label>
                        {products.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            No products available. Please check if products are loaded correctly.
                          </div>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {products
                              .filter(product => !selectedSection.content.featuredProducts?.includes(product._id))
                              .map((product) => (
                                <div key={product._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-sidebar-accent transition-colors">
                                  <img 
                                    src={product.images[0] || "/placeholder.svg"} 
                                    alt={product.name}
                                    className="h-12 w-12 rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleAddFeaturedProduct(product._id);
                                    }}
                                    disabled={selectedSection.content.featuredProducts?.length >= 4}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleSaveSection(selectedSection)}
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
                          Save Section
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsSectionPreviewOpen(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Section Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select a section from the list to edit its content.
                </p>
                <Button
                  onClick={() => setActiveTab("sections")}
                  variant="outline"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  View All Sections
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && cancelDeleteSection()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteDialog.section?.name}"</strong>?
              <br /><br />
              This action cannot be undone and will permanently remove this section from your homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteSection}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Page Preview Modal */}
      <IndexPagePreview
        sections={sections}
        products={products}
        isOpen={isPagePreviewOpen}
        onClose={() => setIsPagePreviewOpen(false)}
      />

      {/* Section Preview Modal */}
      {selectedSection && (
        <SectionPreview
          section={selectedSection}
          products={products}
          isOpen={isSectionPreviewOpen}
          onClose={() => setIsSectionPreviewOpen(false)}
        />
      )}
    </div>
  );
}
