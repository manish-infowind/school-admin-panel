import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { useTeamMember } from "@/api/hooks/useAboutUs";
import { toast } from "@/hooks/use-toast";
import { TeamMember } from "@/api/types";

interface EditTeamMemberModalProps {
  member: TeamMember | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  member,
  onClose,
  onSuccess
}) => {
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<any>(null);

  // Load member data when modal opens
  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPosition(member.position || '');
      setBio(member.bio || '');
      setEmail(member.email || '');
      setLinkedin(member.linkedin || '');
      setTwitter(member.twitter || '');
      setOrder(member.order || 1);
      setImagePreview(member.image || null);
      setImageFile(null);
      setError('');
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [member]);

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

    if (!member?._id) {
      setError('Member ID is missing');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);

      // Import the service
      const { AboutUsService } = await import('@/api/services/aboutUsService');

      // Update team member data
      await AboutUsService.updateTeamMember(member._id, {
        name: name.trim(),
        position: position.trim(),
        bio: bio.trim(),
        email: email.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        order: order,
      });

      // Upload image if new image is selected
      if (imageFile) {
        try {
          await AboutUsService.uploadTeamMemberImage(member._id, imageFile);
        } catch (uploadError) {
          console.warn('Image upload failed, but member was updated:', uploadError);
        }
      }

      toast({
        title: "Success",
        description: "Team member updated successfully",
        variant: "default",
      });

      // Reset form and close modal
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
      onClose();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateError(error);
      setError('Failed to update team member. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle update error
  useEffect(() => {
    if (updateError) {
      setError('Failed to update team member. Please try again.');
    }
  }, [updateError]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Team Member
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
            <Label htmlFor="editMemberName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="editMemberName"
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
            <Label htmlFor="editMemberPosition" className="text-sm font-medium">
              Position *
            </Label>
            <Input
              id="editMemberPosition"
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
            <Label htmlFor="editMemberBio" className="text-sm font-medium">
              Biography *
            </Label>
            <Textarea
              id="editMemberBio"
              placeholder="Enter team member biography..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[150px] focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="editMemberEmail" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="editMemberEmail"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* LinkedIn Field */}
          <div className="space-y-2">
            <Label htmlFor="editMemberLinkedin" className="text-sm font-medium">
              LinkedIn Profile
            </Label>
            <Input
              id="editMemberLinkedin"
              type="url"
              placeholder="Enter LinkedIn profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Twitter Field */}
          <div className="space-y-2">
            <Label htmlFor="editMemberTwitter" className="text-sm font-medium">
              Twitter Profile
            </Label>
            <Input
              id="editMemberTwitter"
              type="url"
              placeholder="Enter Twitter profile URL"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Order Field */}
          <div className="space-y-2">
            <Label htmlFor="editMemberOrder" className="text-sm font-medium">
              Display Order *
            </Label>
            <Input
              id="editMemberOrder"
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
                    id="edit-member-image-upload"
                  />
                  <label htmlFor="edit-member-image-upload" className="text-center cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload new photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a new photo to replace the current one.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Update Member
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};