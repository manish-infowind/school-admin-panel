import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Eye,
  Reply,
  Trash2,
  Filter,
  Search,
  Download,
  MoreVertical,
  Star,
  Archive,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "replied" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
  submittedAt: string;
  lastReply?: string;
  source: "contact-form" | "product-inquiry" | "support";
  isStarred: boolean;
}

const initialEnquiries: Enquiry[] = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@hospital.com",
    phone: "+1 (555) 123-4567",
    subject: "MedScope Pro X1 Product Inquiry",
    message:
      "Hello, I'm interested in learning more about the MedScope Pro X1 for our cardiology department. Could you please provide detailed specifications and pricing information? We're looking to upgrade our diagnostic equipment.",
    status: "new",
    priority: "high",
    submittedAt: "2024-01-15T10:30:00Z",
    source: "product-inquiry",
    isStarred: true,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "m.rodriguez@clinic.org",
    phone: "+1 (555) 987-6543",
    subject: "Technical Support Request",
    message:
      "We're experiencing some connectivity issues with our current MedoScopic device. The WiFi connection keeps dropping during procedures. Can someone assist us with troubleshooting?",
    status: "in-progress",
    priority: "medium",
    submittedAt: "2024-01-14T14:22:00Z",
    lastReply: "2024-01-14T16:45:00Z",
    source: "support",
    isStarred: false,
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    email: "emily.chen@research.edu",
    subject: "Partnership Opportunity",
    message:
      "I'm reaching out from the University Medical Research Center. We're interested in exploring potential research partnerships and would like to discuss collaboration opportunities with your R&D team.",
    status: "replied",
    priority: "medium",
    submittedAt: "2024-01-13T09:15:00Z",
    lastReply: "2024-01-13T11:30:00Z",
    source: "contact-form",
    isStarred: false,
  },
  {
    id: 4,
    name: "James Thompson",
    email: "j.thompson@healthcare.com",
    phone: "+1 (555) 456-7890",
    subject: "Bulk Order Inquiry",
    message:
      "We're a medical equipment distributor interested in becoming an authorized reseller. Could you provide information about your partner program and bulk pricing for hospitals?",
    status: "new",
    priority: "high",
    submittedAt: "2024-01-12T16:45:00Z",
    source: "contact-form",
    isStarred: true,
  },
  {
    id: 5,
    name: "Dr. Lisa Wang",
    email: "lisa.wang@medicalcenter.org",
    subject: "Training and Certification",
    message:
      "Our medical staff needs training on the latest MedoScopic devices. Do you offer certification programs or on-site training sessions?",
    status: "closed",
    priority: "low",
    submittedAt: "2024-01-10T11:20:00Z",
    lastReply: "2024-01-11T09:15:00Z",
    source: "support",
    isStarred: false,
  },
];

export default function Enquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || enquiry.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (
    enquiryId: number,
    newStatus: Enquiry["status"],
  ) => {
    setEnquiries((prev) =>
      prev.map((enquiry) =>
        enquiry.id === enquiryId
          ? {
              ...enquiry,
              status: newStatus,
              lastReply:
                newStatus === "replied"
                  ? new Date().toISOString()
                  : enquiry.lastReply,
            }
          : enquiry,
      ),
    );

    toast({
      title: "Status Updated",
      description: `Enquiry status changed to ${newStatus}.`,
    });
  };

  const handleStarToggle = (enquiryId: number) => {
    setEnquiries((prev) =>
      prev.map((enquiry) =>
        enquiry.id === enquiryId
          ? { ...enquiry, isStarred: !enquiry.isStarred }
          : enquiry,
      ),
    );
  };

  const handleDelete = (enquiryId: number) => {
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (enquiry && window.confirm(`Delete enquiry from ${enquiry.name}?`)) {
      setEnquiries((prev) => prev.filter((e) => e.id !== enquiryId));
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(null);
      }
      toast({
        title: "Enquiry Deleted",
        description: "The enquiry has been deleted successfully.",
      });
    }
  };

  const handleReply = () => {
    if (selectedEnquiry && replyMessage.trim()) {
      handleStatusChange(selectedEnquiry.id, "replied");
      setReplyMessage("");
      setIsReplyDialogOpen(false);

      toast({
        title: "Reply Sent",
        description: `Your reply has been sent to ${selectedEnquiry.name}.`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: "destructive" as const, label: "New" },
      "in-progress": { variant: "secondary" as const, label: "In Progress" },
      replied: { variant: "default" as const, label: "Replied" },
      closed: { variant: "outline" as const, label: "Closed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge
        variant={config.variant}
        className={
          config.variant === "default"
            ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "text-green-600", label: "Low" },
      medium: { color: "text-yellow-600", label: "Medium" },
      high: { color: "text-red-600", label: "High" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Enquiries Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and respond to customer enquiries and contact form
              submissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
              <Mail className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search enquiries by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enquiries List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Enquiries ({filteredEnquiries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEnquiries.map((enquiry, index) => (
                    <motion.div
                      key={enquiry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedEnquiry?.id === enquiry.id
                          ? "bg-sidebar-accent border-brand-green"
                          : "hover:bg-sidebar-accent"
                      }`}
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {enquiry.name}
                            </h3>
                            {enquiry.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {getStatusBadge(enquiry.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {enquiry.email}
                          </p>
                          <p className="text-sm font-medium truncate mt-1">
                            {enquiry.subject}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(enquiry.submittedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-current" />
                              {getPriorityBadge(enquiry.priority)}
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStarToggle(enquiry.id);
                              }}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {enquiry.isStarred ? "Unstar" : "Star"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(enquiry.id, "replied");
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(enquiry.id, "closed");
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Close Enquiry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(enquiry.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}

                  {filteredEnquiries.length === 0 && (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Enquiries Found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all"
                          ? "Try adjusting your search or filters."
                          : "No enquiries have been submitted yet."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enquiry Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Enquiry Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEnquiry ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-green" />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedEnquiry.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedEnquiry.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(selectedEnquiry.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Priority:</span>
                        {getPriorityBadge(selectedEnquiry.priority)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Source:</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedEnquiry.source.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    {selectedEnquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedEnquiry.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Submitted {formatDate(selectedEnquiry.submittedAt)}
                      </span>
                    </div>

                    {selectedEnquiry.lastReply && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Last reply {formatDate(selectedEnquiry.lastReply)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Subject</h4>
                    <p className="text-sm">{selectedEnquiry.subject}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Message</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedEnquiry.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog
                      open={isReplyDialogOpen}
                      onOpenChange={setIsReplyDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Reply to {selectedEnquiry.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Your Reply
                            </label>
                            <Textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type your reply here..."
                              rows={6}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setIsReplyDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReply}
                              disabled={!replyMessage.trim()}
                              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      onClick={() => handleStarToggle(selectedEnquiry.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${selectedEnquiry.isStarred ? "text-yellow-500 fill-current" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Enquiry Selected
                  </h3>
                  <p className="text-muted-foreground">
                    Select an enquiry from the list to view details and respond.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
