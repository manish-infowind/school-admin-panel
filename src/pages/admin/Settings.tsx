import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Save,
  Globe,
  Mail,
  Phone,
  Settings as SettingsIcon,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Building,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SiteSettings, BusinessAddress } from "@/api/types";
import { useSiteSettings } from "@/api/hooks/useSiteSettings";

const initialSettings: SiteSettings = {
  siteName: "",
  siteUrl: "",
  siteDescription: "",
  businessEmail: "",
  adminEmail: "",
  timezone: "UTC",
  contactNumber: "",
  businessAddress: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  businessHours: "",
  socialMedia: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
  },
  logoUrl: "",
  faviconUrl: "",
  isActive: true,
};

export default function Settings() {
  const { 
    settings: apiSettings, 
    loading, 
    updateSettings,
    initializeSettings,
  } = useSiteSettings();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update local settings when API settings load
  useEffect(() => {
    if (apiSettings) {
      // Ensure siteDescription and businessHours are strings, not null
      setSettings({
        ...apiSettings,
        siteDescription: apiSettings.siteDescription ?? '',
        businessHours: apiSettings.businessHours ?? '',
      });
    }
  }, [apiSettings]);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate siteDescription - must be a string (not null/undefined)
    if (settings.siteDescription === null || settings.siteDescription === undefined) {
      errors.siteDescription = 'Site description is required and must be a string';
    }

    // Validate businessHours - must be a string (not null/undefined)
    if (settings.businessHours === null || settings.businessHours === undefined) {
      errors.businessHours = 'Business hours is required and must be a string';
    } else if (settings.businessHours && !settings.businessHours.includes(' - ')) {
      // If it's a single time, suggest using range format
      errors.businessHours = 'Please select both start and end times';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Ensure siteDescription and businessHours are strings (not null) before sending
      const settingsToSend: Partial<SiteSettings> = {
        ...settings,
        siteDescription: settings.siteDescription ?? '',
        businessHours: settings.businessHours ?? '',
      };

      await updateSettings(settingsToSend);
    } catch (error: any) {
      // Handle backend validation errors
      if (error?.response?.data?.errors || error?.data?.errors) {
        const backendErrors = error?.response?.data?.errors || error?.data?.errors || [];
        const fieldErrors: Record<string, string> = {};
        
        backendErrors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[err.path.length - 1];
            fieldErrors[fieldName] = err.message || 'Invalid input';
          }
        });
        
        setValidationErrors(fieldErrors);
        
        // Show toast with validation errors
        const errorMessages = backendErrors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessages || "Please fix the validation errors",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setSaving(true);
      await initializeSettings();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSaving(false);
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
              Site Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your website settings and contact information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleInitialize}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Initialize
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading settings...</span>
        </div>
      ) : (
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
                    placeholder="admin@yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, businessEmail: e.target.value })
                    }
                    placeholder="info@yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={settings.contactNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, contactNumber: e.target.value })
                    }
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Address Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={settings.businessAddress.line1}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, line1: e.target.value }
                      })
                    }
                    placeholder="Street address, building name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={settings.businessAddress.line2 || ''}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, line2: e.target.value }
                      })
                    }
                    placeholder="Apartment, suite, unit (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={settings.businessAddress.city}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, city: e.target.value }
                      })
                    }
                    placeholder="City name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={settings.businessAddress.state}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, state: e.target.value }
                      })
                    }
                    placeholder="State/Province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={settings.businessAddress.country}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, country: e.target.value }
                      })
                    }
                    placeholder="Country name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinCode">Pin Code *</Label>
                  <Input
                    id="pinCode"
                    value={settings.businessAddress.pinCode}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        businessAddress: { ...settings.businessAddress, pinCode: e.target.value }
                      })
                    }
                    placeholder="ZIP/Postal code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook URL
                  </Label>
                  <Input
                    id="facebook"
                    value={settings.socialMedia?.facebook || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter URL
                  </Label>
                  <Input
                    id="twitter"
                    value={settings.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/yourcompany"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    value={settings.socialMedia?.linkedin || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram"
                    value={settings.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Additional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description *</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription ?? ''}
                    onChange={(e) => {
                      setSettings({ ...settings, siteDescription: e.target.value });
                      // Clear error when user starts typing
                      if (validationErrors.siteDescription) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.siteDescription;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Brief description of your business"
                    className={validationErrors.siteDescription ? "border-red-500" : ""}
                  />
                  {validationErrors.siteDescription && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.siteDescription}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone || 'UTC'}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    placeholder="UTC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours *</Label>
                  <TimePicker
                    value={settings.businessHours ?? ''}
                    onChange={(value) => {
                      setSettings({ ...settings, businessHours: value });
                      // Clear error when user selects time
                      if (validationErrors.businessHours) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.businessHours;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Select business hours"
                    isRange={true}
                    className={validationErrors.businessHours ? "border-red-500" : ""}
                  />
                  {validationErrors.businessHours && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.businessHours}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
