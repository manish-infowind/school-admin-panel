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

export default function FAQNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faq, setFAQ] = useState(initialFAQ);
  
  const createFAQMutation = useCreateFAQ();

  const handleSave = async () => {
    // Validate required fields
    if (!faq.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Question is required.",
        variant: "destructive",
      });
      return;
    }

    if (!faq.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Answer is required.",
        variant: "destructive",
      });
      return;
    }

    if (!faq.status.trim()) {
      toast({
        title: "Validation Error",
        description: "Status is required.",
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
            disabled={!faq.question || !faq.answer || !faq.status || createFAQMutation.isPending}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            {createFAQMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create FAQ
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
                  value={faq.question}
                  onChange={(e) =>
                    setFAQ({ ...faq, question: e.target.value })
                  }
                  placeholder="Enter the question"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={faq.status}
                  onValueChange={(value) =>
                    setFAQ({ 
                      ...faq, 
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
                value={faq.answer}
                onChange={(e) =>
                  setFAQ({ ...faq, answer: e.target.value })
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