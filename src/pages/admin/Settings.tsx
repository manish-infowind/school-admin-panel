import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Palette,
  Zap,
  Settings as SettingsIcon,
  Loader2,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    loginAttempts: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    googleAnalytics: string;
  };
}

const initialSettings: SystemSettings = {
  siteName: "MedoScopic Pharma",
  siteDescription: "Advanced Medical Technology & Pharmaceutical Solutions",
  siteUrl: "https://medoscopic.com",
  adminEmail: "admin@medoscopic.com",
  timezone: "America/Los_Angeles",
  language: "en",
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    loginAttempts: 5,
  },
  seo: {
    metaTitle: "MedoScopic Pharma - Advanced Medical Technology",
    metaDescription:
      "Leading provider of medical diagnostic equipment and pharmaceutical solutions for healthcare professionals worldwide.",
    keywords:
      "medical technology, diagnostic equipment, pharmaceutical, healthcare, MedoScopic",
    googleAnalytics: "UA-XXXXXXXXX-X",
  },
};

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Settings Saved!",
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Export Complete!",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
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
              System Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your admin panel and website settings
            </p>
          </div>
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
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                      placeholder="Enter site name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, siteUrl: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        siteDescription: e.target.value,
                      })
                    }
                    placeholder="Enter site description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, adminEmail: e.target.value })
                      }
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) =>
                        setSettings({ ...settings, timezone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="Europe/London">London Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  SEO Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, metaTitle: e.target.value },
                      })
                    }
                    placeholder="Enter meta title"
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seo.metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.seo.metaDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: {
                          ...settings.seo,
                          metaDescription: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter meta description"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seo.metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea
                    id="keywords"
                    value={settings.seo.keywords}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, keywords: e.target.value },
                      })
                    }
                    placeholder="Enter keywords separated by commas"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={settings.seo.googleAnalytics}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: {
                          ...settings.seo,
                          googleAnalytics: e.target.value,
                        },
                      })
                    }
                    placeholder="UA-XXXXXXXXX-X"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: checked,
                        },
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in the browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: checked,
                        },
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing updates and product announcements
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          marketing: checked,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactor}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactor: checked },
                      })
                    }
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeout: parseInt(e.target.value) || 30,
                          },
                        })
                      }
                      min="5"
                      max="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            loginAttempts: parseInt(e.target.value) || 5,
                          },
                        })
                      }
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
