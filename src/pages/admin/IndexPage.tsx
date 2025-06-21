import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PageSection {
  id: number;
  name: string;
  description: string;
  status: "Active" | "Draft";
  lastModified: string;
  content: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  isActive: boolean;
}

const initialSections: PageSection[] = [
  {
    id: 1,
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
  },
  {
    id: 2,
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
  },
  {
    id: 3,
    name: "Services Overview",
    description: "Brief overview of services offered",
    status: "Draft",
    lastModified: "3 days ago",
    content: {
      title: "Our Services",
      subtitle: "Comprehensive Medical Solutions",
      description:
        "From diagnostic equipment to pharmaceutical solutions, we provide comprehensive medical technologies for healthcare providers.",
      buttonText: "View Services",
      buttonLink: "/services",
    },
    isActive: false,
  },
  {
    id: 4,
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
  },
];

export default function IndexPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState(initialSections);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");
  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success!",
        description: "Homepage content saved successfully.",
      });
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
    setSaving(true);
    try {
      const updatedSections = sections.map((s) =>
        s.id === section.id ? { ...section, lastModified: "Just now" } : s,
      );
      setSections(updatedSections);

      toast({
        title: "Success!",
        description: `${section.name} updated successfully.`,
      });
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

  const handleDeleteSection = (id: number) => {
    const section = sections.find((s) => s.id === id);
    if (section && window.confirm(`Delete "${section.name}"?`)) {
      setSections(sections.filter((s) => s.id !== id));
      if (selectedSection?.id === id) {
        setSelectedSection(null);
      }
      toast({
        title: "Deleted",
        description: `${section.name} deleted successfully.`,
      });
    }
  };

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
            <Button variant="outline">
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
                    key={section.id}
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
                        onClick={() => handleDeleteSection(section.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {selectedSection ? (
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
                        onCheckedChange={(checked) =>
                          setSelectedSection({
                            ...selectedSection,
                            isActive: checked,
                            status: checked ? "Active" : "Draft",
                          })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
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
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
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
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Button Text</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buttonLink">Button Link</Label>
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
                      />
                    </div>
                  </div>

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
                    <Button variant="outline">
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
    </div>
  );
}
