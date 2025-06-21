import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Globe,
  Header,
  Footer,
  Megaphone,
  Settings,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdvertisementContent {
  id: number;
  title: string;
  content: string;
  type: "header" | "footer" | "banner" | "popup";
  isActive: boolean;
  position: string;
  startDate: string;
  endDate: string;
  targetPages: string[];
}

const initialAds: AdvertisementContent[] = [
  {
    id: 1,
    title: "New Product Launch Banner",
    content: "🚀 Introducing MedScope Pro X2 - Pre-order now and save 20%!",
    type: "header",
    isActive: true,
    position: "top",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    targetPages: ["homepage", "products"],
  },
  {
    id: 2,
    title: "Contact Footer",
    content:
      "Need help? Contact our support team 24/7 at support@medoscopic.com",
    type: "footer",
    isActive: true,
    position: "bottom",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    targetPages: ["all"],
  },
];

export default function Advertisement() {
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState(initialAds);
  const [selectedAd, setSelectedAd] = useState<AdvertisementContent | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const handleSave = async (ad: AdvertisementContent) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedAds = advertisements.map((a) => (a.id === ad.id ? ad : a));
      setAdvertisements(updatedAds);

      toast({
        title: "Success!",
        description: "Advertisement content saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save advertisement content.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newAd: AdvertisementContent = {
      id: Date.now(),
      title: "New Advertisement",
      content: "",
      type: "banner",
      isActive: false,
      position: "top",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      targetPages: ["homepage"],
    };
    setAdvertisements([...advertisements, newAd]);
    setSelectedAd(newAd);
    setActiveTab("edit");
  };

  const handleDelete = (id: number) => {
    const ad = advertisements.find((a) => a.id === id);
    if (ad && window.confirm(`Delete "${ad.title}"?`)) {
      setAdvertisements(advertisements.filter((a) => a.id !== id));
      if (selectedAd?.id === id) {
        setSelectedAd(null);
      }
      toast({
        title: "Deleted",
        description: "Advertisement content deleted successfully.",
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
              Advertisement Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage headers, footers, banners and promotional content across
              your website
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Advertisement
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">All Content</TabsTrigger>
          <TabsTrigger value="edit">Edit Content</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Advertisement Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advertisements.map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                    >
                      <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                        {ad.type === "header" && (
                          <Header className="h-6 w-6 text-brand-green" />
                        )}
                        {ad.type === "footer" && (
                          <Footer className="h-6 w-6 text-brand-green" />
                        )}
                        {ad.type === "banner" && (
                          <Globe className="h-6 w-6 text-brand-green" />
                        )}
                        {ad.type === "popup" && (
                          <Megaphone className="h-6 w-6 text-brand-green" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {ad.content || "No content"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {ad.type}
                          </Badge>
                          <Badge
                            variant={ad.isActive ? "default" : "secondary"}
                            className={
                              ad.isActive
                                ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                                : ""
                            }
                          >
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAd(ad);
                            setActiveTab("edit");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ad.id)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {selectedAd ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Edit Advertisement Content
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedAd.isActive}
                        onCheckedChange={(checked) =>
                          setSelectedAd({ ...selectedAd, isActive: checked })
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
                        value={selectedAd.title}
                        onChange={(e) =>
                          setSelectedAd({
                            ...selectedAd,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter advertisement title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={selectedAd.type}
                        onChange={(e) =>
                          setSelectedAd({
                            ...selectedAd,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="header">Header Banner</option>
                        <option value="footer">Footer Content</option>
                        <option value="banner">Page Banner</option>
                        <option value="popup">Popup/Modal</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={selectedAd.content}
                      onChange={(e) =>
                        setSelectedAd({
                          ...selectedAd,
                          content: e.target.value,
                        })
                      }
                      placeholder="Enter advertisement content"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={selectedAd.startDate}
                        onChange={(e) =>
                          setSelectedAd({
                            ...selectedAd,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={selectedAd.endDate}
                        onChange={(e) =>
                          setSelectedAd({
                            ...selectedAd,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <select
                      id="position"
                      value={selectedAd.position}
                      onChange={(e) =>
                        setSelectedAd({
                          ...selectedAd,
                          position: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleSave(selectedAd)}
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
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Content Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select an advertisement from the list or create a new one to
                  edit.
                </p>
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Advertisement
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Advertisement Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Enable Advertisements Globally
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on/off all advertisement content across the website
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show on Mobile Devices</Label>
                    <p className="text-sm text-muted-foreground">
                      Display advertisements on mobile and tablet devices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track clicks and impressions for advertisement content
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
                  <Save className="h-4 w-4 mr-2" />
                  Save Global Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
