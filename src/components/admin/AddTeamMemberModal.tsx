import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, User, Upload, X } from "lucide-react";
import { useCreateTeamMember } from "@/api/hooks/useAboutUs";
import { toast } from "@/hooks/use-toast";

interface AddTeamMemberModalProps {
  onSuccess?: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [order, setOrder] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { createTeamMember, isCreating, createError } = useCreateTeamMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!position.trim()) {
      setError('Position is required');
      return;
    }

    if (!bio.trim()) {
      setError('Bio is required');
      return;
    }

    if (order < 1) {
      setError('Order must be at least 1');
      return;
    }

    try {
      await createTeamMember({
        name: name.trim(),
        position: position.trim(),
        bio: bio.trim(),
        email: email.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        order: order,
        imageFile: imageFile || undefined,
      });

      toast({
        title: "Success",
        description: "Team member created successfully",
        variant: "default",
      });

      // Reset form
      setName('');
      setPosition('');
      setBio('');
      setEmail('');
      setLinkedin('');
      setTwitter('');
      setOrder(1);
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to create team member. Please try again.');
    }
  };

  // Handle create error
  React.useEffect(() => {
    if (createError) {
      setError('Failed to create team member. Please try again.');
    }
  }, [createError]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Team Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="memberName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="memberName"
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Position Field */}
          <div className="space-y-2">
            <Label htmlFor="memberPosition" className="text-sm font-medium">
              Position *
            </Label>
            <Input
              id="memberPosition"
              type="text"
              placeholder="Enter job position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="memberBio" className="text-sm font-medium">
              Biography *
            </Label>
            <Textarea
              id="memberBio"
              placeholder="Enter team member biography..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[150px] focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="memberEmail" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="memberEmail"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* LinkedIn Field */}
          <div className="space-y-2">
            <Label htmlFor="memberLinkedin" className="text-sm font-medium">
              LinkedIn Profile
            </Label>
            <Input
              id="memberLinkedin"
              type="url"
              placeholder="Enter LinkedIn profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Twitter Field */}
          <div className="space-y-2">
            <Label htmlFor="memberTwitter" className="text-sm font-medium">
              Twitter Profile
            </Label>
            <Input
              id="memberTwitter"
              type="url"
              placeholder="Enter Twitter profile URL"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Order Field */}
          <div className="space-y-2">
            <Label htmlFor="memberOrder" className="text-sm font-medium">
              Display Order *
            </Label>
            <Input
              id="memberOrder"
              type="number"
              min="1"
              placeholder="Enter display order"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first. Team members are ordered by this number.
            </p>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Profile Photo (Optional)
            </Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => setImagePreview(e.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    id="member-image-upload"
                  />
                  <label htmlFor="member-image-upload" className="text-center cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              You can upload a profile photo for this team member. Photo will be uploaded after member creation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Member
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 