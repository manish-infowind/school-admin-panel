import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { usePrivacyPolicy } from "@/api/hooks/usePrivacyPolicy";
import { toast } from "@/hooks/use-toast";

const PrivacyPolicy = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { 
    privacyPolicy, 
    isLoading, 
    updatePrivacyPolicy, 
    isUpdating, 
    updateError 
  } = usePrivacyPolicy();

  // Load existing data when component mounts
  useEffect(() => {
    if (privacyPolicy) {
      setTitle(privacyPolicy.title || '');
      setDescription(privacyPolicy.policyDescription || '');
    }
  }, [privacyPolicy]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Privacy policy description is required');
      return;
    }

    try {
      await updatePrivacyPolicy({
        title: title.trim(),
        policyDescription: description.trim(),
      });

      toast({
        title: "Success",
        description: "Privacy policy updated successfully",
        variant: "default",
      });
    } catch (error) {
      setError('Failed to update privacy policy. Please try again.');
    }
  };

  // Handle update error
  useEffect(() => {
    if (updateError) {
      setError('Failed to update privacy policy. Please try again.');
    }
  }, [updateError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading privacy policy...</span>
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
          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your website's privacy policy content
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-dashed border-border hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Policy Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Policy Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter privacy policy title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Policy Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter your privacy policy description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[300px] focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use this rich text area to write your privacy policy. You can include formatting, links, and detailed information about how you handle user data.
                </p>
              </div>

              {/* Last Updated Info */}
              {privacyPolicy?.updatedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Last updated: {new Date(privacyPolicy.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(privacyPolicy.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}

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

      {/* Preview Section */}
      {title && description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {description}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default PrivacyPolicy; 