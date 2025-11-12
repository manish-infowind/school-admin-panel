import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useFAQ, useUpdateFAQ } from "@/api/hooks/useFAQs";
import { useToast } from "@/hooks/use-toast";
import type { FAQ } from "@/api/services/faqService";

// Validation interface
interface ValidationErrors {
  question?: string;
  answer?: string;
  status?: string;
}

export default function FAQEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [localFAQ, setLocalFAQ] = useState<Partial<FAQ>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Load FAQ data from API
  const { data: faqResponse, isLoading, error } = useFAQ(id || '');
  const updateFAQMutation = useUpdateFAQ();

  const faq = faqResponse?.data;

  // Validation function
  const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
    switch (field) {
      case 'question':
        if (!value || !value.trim()) {
          return 'Question is required';
        }
        if (value.trim().length < 5) {
          return 'Question must be at least 5 characters long';
        }
        if (value.trim().length > 500) {
          return 'Question must be less than 500 characters';
        }
        break;
      
      case 'answer':
        if (!value || !value.trim()) {
          return 'Answer is required';
        }
        if (value.trim().length < 10) {
          return 'Answer must be at least 10 characters long';
        }
        if (value.trim().length > 2000) {
          return 'Answer must be less than 2000 characters';
        }
        break;
      
      case 'status':
        if (!value || !value.trim()) {
          return 'Status is required';
        }
        if (!['Draft', 'Published'].includes(value)) {
          return 'Invalid status value';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    errors.question = validateField('question', localFAQ.question);
    errors.answer = validateField('answer', localFAQ.answer);
    errors.status = validateField('status', localFAQ.status);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof localFAQ, value: any) => {
    setLocalFAQ(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    let value: any;
    switch (field) {
      case 'question':
        value = localFAQ.question;
        break;
      case 'answer':
        value = localFAQ.answer;
        break;
      case 'status':
        value = localFAQ.status;
        break;
    }
    
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

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

    // Validate all fields
    const errors = validateAllFields();
    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== undefined)) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before saving.",
        variant: "destructive",
      });
      return;
    }

    // Update FAQ via API
    updateFAQMutation.mutate({
      faqId: id,
      data: {
        question: localFAQ.question?.trim(),
        answer: localFAQ.answer?.trim(),
        status: localFAQ.status,
        isPublished: localFAQ.status === "Published",
      },
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "FAQ updated successfully",
          variant: "default",
        });
        navigate("/admin/faqs");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update FAQ. Please try again.",
          variant: "destructive",
        });
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
              <p className="text-muted-foreground mt-1">
                Update frequently asked question information
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || updateFAQMutation.isPending}
            className="bg-brand-green hover:bg-brand-green/90 text-white"
          >
            {updateFAQMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Validation Error Alert */}
      {Object.values(validationErrors).some(error => error !== undefined) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix all validation errors before saving the FAQ.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQ Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium">
                  Question *
                </Label>
                <Input
                  id="question"
                  placeholder="Enter the frequently asked question"
                  value={localFAQ.question || ''}
                  onChange={(e) => handleFieldChange('question', e.target.value)}
                  onBlur={() => handleFieldBlur('question')}
                  className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.question ? "border-red-500" : ""}`}
                />
                {validationErrors.question && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.question}
                  </div>
                )}
              </div>

              {/* Answer */}
              <div className="space-y-2">
                <Label htmlFor="answer" className="text-sm font-medium">
                  Answer *
                </Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer to the question"
                  value={localFAQ.answer || ''}
                  onChange={(e) => handleFieldChange('answer', e.target.value)}
                  onBlur={() => handleFieldBlur('answer')}
                  className={`min-h-[120px] focus:ring-blue-500 focus:border-blue-500 resize-none ${validationErrors.answer ? "border-red-500" : ""}`}
                />
                {validationErrors.answer && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.answer}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status *
                </Label>
                <Select
                  value={localFAQ.status || ''}
                  onValueChange={(value) => handleFieldChange('status', value)}
                >
                  <SelectTrigger className={`focus:ring-blue-500 focus:border-blue-500 ${validationErrors.status ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.status}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Question:</h3>
                <p className="text-sm text-muted-foreground">
                  {localFAQ.question || "Enter a question to see preview"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Answer:</h3>
                <p className="text-sm text-muted-foreground">
                  {localFAQ.answer || "Enter an answer to see preview"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Status:</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  localFAQ.status === 'Published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {localFAQ.status || 'Draft'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 