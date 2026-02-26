import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Save,
  User,
  Mail,
  Phone,
  Key,
  Loader2,
  Camera,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useProfile } from "@/api/hooks/useProfile";
import PasswordChangeModal from "@/components/admin/PasswordChangeModal";

export default function Profile() {
  const {
    profile,
    loading,
    error,
    saving,
    uploadingAvatar,
    updateProfile,
    uploadAvatar,
    loadProfile,
    resetError,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      setLocalProfile({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(localProfile);
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadProfile}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green to-brand-teal bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-brand-green hover:bg-brand-green/90 text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-2 border-brand-green/20">
                <AvatarImage src={profile.avatar} alt={profile.firstName} />
                <AvatarFallback className="bg-brand-green text-white text-xl">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-sm"
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-semibold">{profile.firstName} {profile.lastName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Form Main Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={localProfile.firstName}
                  onChange={(e) => setLocalProfile({ ...localProfile, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={localProfile.lastName}
                  onChange={(e) => setLocalProfile({ ...localProfile, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={profile.email} disabled className="pl-9 bg-muted/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={localProfile.phone}
                  onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="pt-2">
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                <Key className="h-4 w-4 mr-2" /> Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        type="changepassword"
        clearType={() => { }}
      />
    </div>
  );
}
