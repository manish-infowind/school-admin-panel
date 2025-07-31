import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  Plus,
  Trash2,
  Users,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  Edit,
  Award,
  Eye,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAboutUs } from "@/api/hooks/useAboutUs";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AddSectionModal } from "@/components/admin/AddSectionModal";
import { AddTeamMemberModal } from "@/components/admin/AddTeamMemberModal";
import { EditTeamMemberModal } from "@/components/admin/EditTeamMemberModal";
import { EditSectionModal } from "@/components/admin/EditSectionModal";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { AboutUsSection, TeamMember, UpdateAboutUsRequest } from "@/api/types";

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  
  // Main About Us data
  const { 
    aboutUs, 
    isLoading, 
    updateAboutUs, 
    isUpdating, 
    updateError,
    refetchAboutUs
  } = useAboutUs();

  // Form states
  const [mainTitle, setMainTitle] = useState("");
  const [mainDescription, setMainDescription] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [removeMainImage, setRemoveMainImage] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutUsSection | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Delete confirmation modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<'section' | 'member' | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');

  // Load existing data when component mounts
  useEffect(() => {
    if (aboutUs) {
      setMainTitle(aboutUs.mainTitle || "");
      setMainDescription(aboutUs.mainDescription || "");
      // Reset remove flag when data is loaded
      setRemoveMainImage(false);
    }
  }, [aboutUs]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      setError('Failed to update About Us. Please try again.');
    }
  }, [updateError]);

  // Handle main About Us update
  const handleMainUpdate = async () => {
    setError("");

    if (!mainTitle.trim()) {
      setError('Main title is required');
      return;
    }

    if (!mainDescription.trim()) {
      setError('Main description is required');
      return;
    }

    try {
      // Update main content
      await updateAboutUs({
        mainTitle: mainTitle.trim(),
        mainDescription: mainDescription.trim(),
      });

      // Upload main image if provided
      if (mainImageFile) {
        try {
          const { AboutUsService } = await import('@/api/services/aboutUsService');
          await AboutUsService.uploadMainImage(mainImageFile);
          
          // Clear the image file after successful upload
          setMainImageFile(null);
          setMainImagePreview(null);
        } catch (uploadError) {
          console.warn('Main image upload failed, but content was updated:', uploadError);
        }
      }

      // Remove main image if requested
      if (removeMainImage) {
        try {
          const { AboutUsService } = await import('@/api/services/aboutUsService');
          await AboutUsService.removeMainImage();
          
          // Clear the remove flag after successful removal
          setRemoveMainImage(false);
        } catch (removeError) {
          console.warn('Main image removal failed, but content was updated:', removeError);
        }
      }

      toast({
        title: "Success",
        description: "About Us updated successfully",
        variant: "default",
      });
      
      // Refresh the data to show updated content
      refetchAboutUs();
    } catch (error) {
      setError('Failed to update About Us. Please try again.');
    }
  };

  // Handle section update
  const handleSectionUpdate = async (sectionId: string, data: { title: string; content: string; order: number }) => {
    try {
      const { AboutUsService } = await import('@/api/services/aboutUsService');
      await AboutUsService.updateSection(sectionId, data);

      toast({
        title: "Success",
        description: "Section updated successfully",
        variant: "default",
      });
      
      // Refresh the data
      refetchAboutUs();
      setEditingSection(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };



  // Handle section delete
  const handleDeleteSection = (section: AboutUsSection) => {
    setDeleteItemType('section');
    setDeleteItemId(section._id);
    setDeleteItemName(section.title);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  // Handle team member delete
  const handleDeleteTeamMember = (member: TeamMember) => {
    setDeleteItemType('member');
    setDeleteItemId(member._id);
    setDeleteItemName(member.name);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  // Handle closing edit modals
  const handleCloseEditMemberModal = () => {
    setEditingMember(null);
  };

  const handleCloseEditSectionModal = () => {
    setEditingSection(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteItemType || !deleteItemId) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const { AboutUsService } = await import('@/api/services/aboutUsService');

      if (deleteItemType === 'section') {
        await AboutUsService.deleteSection(deleteItemId);
        toast({
          title: "Success",
          description: "Section deleted successfully",
          variant: "default",
        });
      } else if (deleteItemType === 'member') {
        await AboutUsService.deleteTeamMember(deleteItemId);
        toast({
          title: "Success",
          description: "Team member deleted successfully",
          variant: "default",
        });
      }

      // Refresh the data
      refetchAboutUs();
      
      // Close modal
      setDeleteModalOpen(false);
      setDeleteItemType(null);
      setDeleteItemId('');
      setDeleteItemName('');
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleteError('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteItemType(null);
    setDeleteItemId('');
    setDeleteItemName('');
    setDeleteError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading About Us data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
          <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            About Us
            </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your company's About Us page content
            </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-dashed border-border hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Main Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleMainUpdate(); }} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Main Title */}
                  <div className="space-y-2">
                    <Label htmlFor="mainTitle" className="text-sm font-medium">
                      Main Title *
                    </Label>
                    <Input
                      id="mainTitle"
                      type="text"
                      placeholder="Enter main title"
                      value={mainTitle}
                      onChange={(e) => setMainTitle(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Main Description */}
                  <div className="space-y-2">
                    <Label htmlFor="mainDescription" className="text-sm font-medium">
                      Main Description *
                    </Label>
                    <Textarea
                      id="mainDescription"
                      placeholder="Enter main description..."
                      value={mainDescription}
                      onChange={(e) => setMainDescription(e.target.value)}
                      className="min-h-[200px] focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  {/* Main Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Main About Us Image (Optional)
                    </Label>
                    <div className="space-y-3">
                      {mainImagePreview ? (
                        <div className="relative">
                          <img
                            src={mainImagePreview}
                            alt="Main About Us Preview"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setMainImageFile(null);
                              setMainImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : aboutUs?.mainImage && !removeMainImage ? (
                        <div className="relative">
                          <img
                            src={aboutUs.mainImage}
                            alt="Current Main About Us Image"
                            className="w-full h-48 object-cover rounded-lg border"
                            onError={(e) => {
                              // Hide image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // Trigger file input click
                                const fileInput = document.getElementById('main-image-upload') as HTMLInputElement;
                                if (fileInput) {
                                  fileInput.click();
                                }
                              }}
                            >
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                // Set flag to remove the main image
                                setRemoveMainImage(true);
                                setMainImageFile(null);
                                setMainImagePreview(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : removeMainImage ? (
                        <div className="w-full h-48 border-2 border-dashed border-red-300 bg-red-50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-red-600 font-medium">Image marked for removal</p>
                            <p className="text-xs text-red-500">Click "Save Changes" to confirm</p>
                          <Button
                              type="button"
                              variant="outline"
                            size="sm"
                              className="mt-2"
                            onClick={() => {
                                setRemoveMainImage(false);
                              }}
                            >
                              Cancel Removal
                            </Button>
                          </div>
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
                                setMainImageFile(file);
                                const reader = new FileReader();
                                reader.onload = (e) => setMainImagePreview(e.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            id="main-image-upload"
                          />
                          <label htmlFor="main-image-upload" className="text-center cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload main image</p>
                            <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload a main image for the About Us page. This will be displayed prominently.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Content Sections
                  </div>
                  <AddSectionModal onSuccess={refetchAboutUs} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aboutUs?.sections?.map((section, index) => (
                    <Card key={section._id} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Section {index + 1}</Badge>
                            <Badge variant="outline">Order: {section.order}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSection(section)}
                            >
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSection(section)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{section.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {section.content.substring(0, 150)}...
                          </p>
                        </div>

                        {section.image && (
                          <div className="mt-4">
                            <img
                              src={section.image}
                              alt={section.title}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {(!aboutUs?.sections || aboutUs.sections.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sections added yet.</p>
                      <p className="text-sm">Click "Add Section" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </div>
                  <AddTeamMemberModal onSuccess={refetchAboutUs} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aboutUs?.teamMembers?.map((member, index) => (
                    <Card key={member._id} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">Order: {member.order}</Badge>
                          <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                              variant="outline"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTeamMember(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                        
                        <div className="text-center space-y-2">
                          {member.image && (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-20 h-20 rounded-full object-cover mx-auto"
                            />
                          )}
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {member.position}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {member.bio.substring(0, 100)}...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!aboutUs?.teamMembers || aboutUs.teamMembers.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members added yet.</p>
                      <p className="text-sm">Click "Add Member" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h1 className="text-3xl font-bold mb-4">{mainTitle || "About Us"}</h1>
                  {aboutUs?.mainImage && (
                    <div className="mb-6">
                      <img
                        src={aboutUs.mainImage}
                        alt="About Us"
                        className="w-full max-w-2xl h-auto rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    {mainDescription || "Company overview..."}
                  </p>

                  {/* Sections Preview */}
                  {aboutUs?.sections && aboutUs.sections.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Content Sections</h2>
                      {aboutUs.sections.map((section, index) => (
                        <div key={section._id} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                          {section.image && (
                            <div className="mb-4">
                              <img
                                src={section.image}
                                alt={section.title}
                                className="w-full max-w-md h-auto rounded-lg shadow-md object-cover"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                    />
                  </div>
                          )}
                          <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
                    </div>
                      ))}
                    </div>
                  )}

                  {/* Team Preview */}
                  {aboutUs?.teamMembers && aboutUs.teamMembers.length > 0 && (
                    <div className="space-y-6 mt-8">
                      <h2 className="text-2xl font-semibold">Our Team</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {aboutUs.teamMembers.map((member) => (
                          <div key={member._id} className="text-center">
                            {member.image && (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              {member.position}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                              {member.bio}
                            </p>
                  </div>
                        ))}
                    </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Edit Team Member Modal */}
      <EditTeamMemberModal
        member={editingMember}
        onClose={handleCloseEditMemberModal}
        onSuccess={refetchAboutUs}
      />

      {/* Edit Section Modal */}
      <EditSectionModal
        section={editingSection}
        onClose={handleCloseEditSectionModal}
        onSuccess={refetchAboutUs}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={deleteItemType === 'section' ? 'Delete Section' : 'Delete Team Member'}
        message={deleteItemType === 'section' 
          ? 'Are you sure you want to delete this section? This will permanently remove the section and all its content.'
          : 'Are you sure you want to delete this team member? This will permanently remove the team member from your team.'
        }
        itemName={deleteItemName}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default AboutUs;
