import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Loader2,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  role: string;
  joinDate: string;
  lastLogin: string;
}

const initialProfile: UserProfile = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@medoscopic.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Admin user for MedoScopic Pharma content management system. Responsible for managing website content, products, and user accounts.",
  avatar: "/placeholder.svg",
  role: "Administrator",
  joinDate: "January 2024",
  lastLogin: "2 hours ago",
};

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    setUploadingAvatar(true);
    try {
      // Simulate avatar upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Avatar Updated!",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
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
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} alt={profile.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-green to-brand-teal text-white text-xl">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <h3 className="text-xl font-semibold mt-4">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-muted-foreground">{profile.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-gradient-to-r from-brand-green/10 to-brand-teal/10 text-brand-green"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {profile.role}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.joinDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.lastLogin}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="location"
                    className="pl-10"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Last changed 3 months ago
                </p>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
