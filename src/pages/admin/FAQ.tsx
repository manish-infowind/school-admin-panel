import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Calendar,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFAQs, useDeleteFAQ, useUpdateFAQStatus } from "@/api/hooks/useFAQs";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import type { FAQ } from "@/api/services/faqService";

export default function FAQPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    faq: FAQ | null;
  }>({
    isOpen: false,
    faq: null,
  });

  // Get FAQs from API
  const { data: faqsResponse, isLoading, error } = useFAQs({
    search: searchTerm || undefined,
    page: 1,
    limit: 50
  });

  const faqs = faqsResponse?.data?.faqs || [];
  const deleteFAQMutation = useDeleteFAQ();
  const updateFAQStatusMutation = useUpdateFAQStatus();

  const handleEditFAQ = (faq: FAQ) => {
    navigate(`/admin/faqs/edit/${faq._id}`);
  };

  const handleDeleteFAQ = (faq: FAQ) => {
    setDeleteModal({
      isOpen: true,
      faq: faq,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.faq) {
      deleteFAQMutation.mutate(deleteModal.faq._id);
      setDeleteModal({ isOpen: false, faq: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, faq: null });
  };

  const handleStatusToggle = (faq: FAQ) => {
    const newStatus = faq.status === "Published" ? "Draft" : "Published";
    const newIsPublished = newStatus === "Published";
    
    updateFAQStatusMutation.mutate({
      faqId: faq._id,
      data: {
        status: newStatus,
        isPublished: newIsPublished
      }
    });
  };

  const handleAddNewFAQ = () => {
    navigate("/admin/faqs/new");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading FAQs</h3>
          <p className="text-muted-foreground">Failed to load FAQ data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              FAQ Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage frequently asked questions and their answers
            </p>
          </div>
          <Button
            onClick={handleAddNewFAQ}
            className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New FAQ
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQs
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full"></div>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No FAQs match your search criteria." : "Get started by creating your first FAQ."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleAddNewFAQ}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First FAQ
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq._id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-brand-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg mb-1">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {formatDate(faq.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Updated: {formatDate(faq.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 w-32">
                        <Badge
                          variant={
                            faq.status === "Published"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            faq.status === "Published"
                              ? "bg-gradient-to-r from-brand-green to-brand-teal text-white min-w-[80px] text-center"
                              : "min-w-[80px] text-center"
                          }
                        >
                          {faq.status}
                        </Badge>
                        <Switch
                          checked={faq.status === "Published"}
                          onCheckedChange={() => handleStatusToggle(faq)}
                          disabled={updateFAQStatusMutation.isPending}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFAQ(faq);
                          }}
                          title="Edit FAQ"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFAQ(faq);
                          }}
                          title="Delete FAQ"
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        itemName={deleteModal.faq?.question || ""}
        isLoading={deleteFAQMutation.isPending}
      />
    </div>
  );
} 