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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateFAQ } from "@/api/hooks/useFAQs";
import { useToast } from "@/hooks/use-toast";

const initialFAQ = {
  question: "",
  answer: "",
  status: "Draft" as 'Draft' | 'Published',
  isPublished: false,
};

// Validation interface
interface ValidationErrors {
  question?: string;
  answer?: string;
  status?: string;
}

export default function FAQNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faq, setFAQ] = useState(initialFAQ);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const createFAQMutation = useCreateFAQ();

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
    
    errors.question = validateField('question', faq.question);
    errors.answer = validateField('answer', faq.answer);
    errors.status = validateField('status', faq.status);
    
    return errors;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const errors = validateAllFields();
    return !Object.values(errors).some(error => error !== undefined);
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof faq, value: any) => {
    setFAQ(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    let value: any;
    switch (field) {
      case 'question':
        value = faq.question;
        break;
      case 'answer':
        value = faq.answer;
        break;
      case 'status':
        value = faq.status;
        break;
    }
    
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSave = async () => {
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

    // Create FAQ via API
    createFAQMutation.mutate({
      ...faq,
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
                Create New FAQ
              </h1>
              <p className="text-muted-foreground mt-1">
                Add a new frequently asked question
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || createFAQMutation.isPending}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            {createFAQMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create FAQ
          </Button>
        </div>
      </motion.div>

      {/* Validation Error Alert */}
      {Object.values(validationErrors).some(error => error !== undefined) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix all validation errors before creating the FAQ.
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
                  value={faq.question}
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
                  value={faq.answer}
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
                  value={faq.status}
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
                  {faq.question || "Enter a question to see preview"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Answer:</h3>
                <p className="text-sm text-muted-foreground">
                  {faq.answer || "Enter an answer to see preview"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Status:</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  faq.status === 'Published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {faq.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 