import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useFAQ, useUpdateFAQ } from "@/api/hooks/useFAQs";
import { useToast } from "@/hooks/use-toast";
import type { FAQ } from "@/api/services/faqService";

export default function FAQEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [localFAQ, setLocalFAQ] = useState<Partial<FAQ>>({});

  // Load FAQ data from API
  const { data: faqResponse, isLoading, error } = useFAQ(id || '');
  const updateFAQMutation = useUpdateFAQ();

  const faq = faqResponse?.data;

  // Update local FAQ when API data loads
  useEffect(() => {
    if (faq) {
      setLocalFAQ(faq);
    }
  }, [faq]);

  // Handle FAQ not found
  useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: "FAQ not found",
        description: "The FAQ you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate("/admin/faqs");
    }
  }, [error, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  if (!faq) {
    return null;
  }

  const handleSave = async () => {
    if (!localFAQ || !id) return;

    // Validate required fields
    if (!localFAQ.question?.trim()) {
      toast({
        title: "Validation Error",
        description: "Question is required.",
        variant: "destructive",
      });
      return;
    }

    if (!localFAQ.answer?.trim()) {
      toast({
        title: "Validation Error",
        description: "Answer is required.",
        variant: "destructive",
      });
      return;
    }

    if (!localFAQ.status?.trim()) {
      toast({
        title: "Validation Error",
        description: "Status is required.",
        variant: "destructive",
      });
      return;
    }

    // Update FAQ via API
    updateFAQMutation.mutate({
      faqId: id,
      data: {
        ...localFAQ,
      }
    }, {
      onSuccess: () => {
        // Navigate to FAQs page
        navigate("/admin/faqs");
      }
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/faqs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to FAQs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                Edit FAQ
              </h1>
              <p className="text-muted-foreground mt-2">
                Update FAQ information and settings
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!localFAQ.question || !localFAQ.answer || !localFAQ.status || updateFAQMutation.isPending}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            {updateFAQMutation.isPending ? (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={localFAQ.question || ""}
                  onChange={(e) =>
                    setLocalFAQ({ ...localFAQ, question: e.target.value })
                  }
                  placeholder="Enter the question"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={localFAQ.status || ""}
                  onValueChange={(value) =>
                    setLocalFAQ({ 
                      ...localFAQ, 
                      status: value as 'Draft' | 'Published',
                      isPublished: value === "Published"
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={localFAQ.answer || ""}
                onChange={(e) =>
                  setLocalFAQ({ ...localFAQ, answer: e.target.value })
                }
                placeholder="Enter the answer"
                rows={8}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 