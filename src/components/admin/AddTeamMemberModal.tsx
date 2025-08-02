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

// Validation interface
interface ValidationErrors {
  name?: string;
  position?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  order?: string;
  image?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');

  const { createTeamMember, isCreating, createError } = useCreateTeamMember();

  // Validation function
  const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) {
          return 'Full name is required';
        }
        if (value.trim().length < 2) {
          return 'Full name must be at least 2 characters long';
        }
        if (value.trim().length > 100) {
          return 'Full name must be less than 100 characters';
        }
        break;
      
      case 'position':
        if (!value || !value.trim()) {
          return 'Position is required';
        }
        if (value.trim().length < 2) {
          return 'Position must be at least 2 characters long';
        }
        if (value.trim().length > 100) {
          return 'Position must be less than 100 characters';
        }
        break;
      
      case 'bio':
        if (!value || !value.trim()) {
          return 'Biography is required';
        }
        if (value.trim().length < 10) {
          return 'Biography must be at least 10 characters long';
        }
        if (value.trim().length > 500) {
          return 'Biography must be less than 500 characters';
        }
        break;
      
      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
          }
        }
        break;
      
      case 'linkedin':
        if (value && value.trim()) {
          const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
          if (!linkedinRegex.test(value.trim())) {
            return 'Please enter a valid LinkedIn profile URL';
          }
        }
        break;
      
      case 'twitter':
        if (value && value.trim()) {
          const twitterRegex = /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/;
          if (!twitterRegex.test(value.trim())) {
            return 'Please enter a valid Twitter profile URL';
          }
        }
        break;
      
      case 'order':
        if (!value || value < 1) {
          return 'Display order must be at least 1';
        }
        if (value > 999) {
          return 'Display order must be less than 1000';
        }
        break;
      
      case 'image':
        if (!imagePreview && !imageFile) {
          return 'Profile photo is required';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    errors.name = validateField('name', name);
    errors.position = validateField('position', position);
    errors.bio = validateField('bio', bio);
    errors.email = validateField('email', email);
    errors.linkedin = validateField('linkedin', linkedin);
    errors.twitter = validateField('twitter', twitter);
    errors.order = validateField('order', order);
    errors.image = validateField('image', imagePreview || imageFile);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof ValidationErrors, value: any) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'position':
        setPosition(value);
        break;
      case 'bio':
        setBio(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'linkedin':
        setLinkedin(value);
        break;
      case 'twitter':
        setTwitter(value);
        break;
      case 'order':
        setOrder(value);
        break;
    }
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    let value: any;
    switch (field) {
      case 'name':
        value = name;
        break;
      case 'position':
        value = position;
        break;
      case 'bio':
        value = bio;
        break;
      case 'email':
        value = email;
        break;
      case 'linkedin':
        value = linkedin;
        break;
      case 'twitter':
        value = twitter;
        break;
      case 'order':
        value = order;
        break;
      case 'image':
        value = imagePreview || imageFile;
        break;
    }
    
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = validateAllFields();
    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== undefined)) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before creating.",
        variant: "destructive",
      });
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
      setValidationErrors({});
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Team Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
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
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange('position', e.target.value)}
                  onBlur={() => handleFieldBlur('position')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.position ? "border-red-500" : ""}`}
                />
                {validationErrors.position && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.position}
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email ? "border-red-500" : ""}`}
                />
                {validationErrors.email && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.email}
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                  onBlur={() => handleFieldBlur('linkedin')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.linkedin ? "border-red-500" : ""}`}
                />
                {validationErrors.linkedin && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.linkedin}
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange('twitter', e.target.value)}
                  onBlur={() => handleFieldBlur('twitter')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.twitter ? "border-red-500" : ""}`}
                />
                {validationErrors.twitter && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.twitter}
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                  onBlur={() => handleFieldBlur('order')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.order ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-gray-500">
                  Lower numbers appear first. Team members are ordered by this number.
                </p>
                {validationErrors.order && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.order}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Bio and Image */}
            <div className="space-y-4">
              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="memberBio" className="text-sm font-medium">
                  Biography *
                </Label>
                <Textarea
                  id="memberBio"
                  placeholder="Enter team member biography..."
                  value={bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  onBlur={() => handleFieldBlur('bio')}
                  className={`min-h-[120px] focus:ring-blue-500 focus:border-blue-500 resize-none ${validationErrors.bio ? "border-red-500" : ""}`}
                />
                {validationErrors.bio && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.bio}
                  </div>
                )}
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Profile Photo *
                </Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          // Clear image validation error
                          setValidationErrors(prev => ({ ...prev, image: undefined }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer ${validationErrors.image ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
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
                            // Clear image validation error
                            setValidationErrors(prev => ({ ...prev, image: undefined }));
                          }
                        }}
                        id="member-image-upload"
                      />
                      <label htmlFor="member-image-upload" className="text-center cursor-pointer">
                        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500">Click to upload photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                      </label>
                    </div>
                  )}
                </div>
                {validationErrors.image && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.image}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Profile photo is required. Photo will be uploaded after member creation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={isCreating || !isFormValid()}
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