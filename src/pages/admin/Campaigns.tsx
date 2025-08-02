import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Clock,
  Mail,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Send,
  StopCircle,
  MessageSquare,
  Bell,
  Info,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useCampaigns, useCampaignStats, useCampaignMutations } from "@/api/hooks/useCampaigns";
import { Campaign, CreateCampaignRequest, RunCampaignRequest } from "@/api/types";
import { format } from "date-fns";
import { CreateCampaignModal } from "@/components/admin/CreateCampaignModal";
import { EditCampaignModal } from "@/components/admin/EditCampaignModal";
import { CampaignPreviewModal } from "@/components/admin/CampaignPreviewModal";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { RunCampaignModal } from "@/components/admin/RunCampaignModal";

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Campaign['status'] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Campaign['type'] | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  
  const campaignParams = useMemo(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  }), [currentPage, searchTerm, statusFilter, typeFilter]);
  
  const { campaigns, loading, error, pagination, refetch } = useCampaigns(campaignParams);
  const { stats, loading: statsLoading } = useCampaignStats();
  const { 
    loading: mutationLoading, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign, 
    runCampaign, 
    cancelCampaign,
    getSchedulerStatus,
    refreshSchedulerCache,
    checkScheduledCampaigns
  } = useCampaignMutations();

  const handleCreateCampaign = async (data: CreateCampaignRequest) => {
    try {
      await createCampaign(data);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditCampaign = async (id: string, data: Partial<CreateCampaignRequest>) => {
    try {
      await updateCampaign(id, data);
      setShowEditModal(false);
      setSelectedCampaign(null);
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id);
      setShowDeleteModal(false);
      setSelectedCampaign(null);
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRunCampaign = async (id: string, data?: RunCampaignRequest) => {
    try {
      await runCampaign(id, data);
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancelCampaign = async (id: string) => {
    try {
      await cancelCampaign(id);
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, icon: Clock },
      scheduled: { variant: "default" as const, icon: Calendar },
      running: { variant: "default" as const, icon: Loader2 },
      completed: { variant: "default" as const, icon: CheckCircle },
      failed: { variant: "destructive" as const, icon: XCircle },
      cancelled: { variant: "secondary" as const, icon: StopCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: Campaign['type']) => {
    const typeConfig = {
      email: { variant: "default" as const, icon: Mail },
      sms: { variant: "secondary" as const, icon: MessageSquare },
      push: { variant: "outline" as const, icon: Bell },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {type.toUpperCase()}
      </Badge>
    );
  };

  const openEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const openPreviewModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowPreviewModal(true);
  };

  const openDeleteModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const openRunModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowRunModal(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Error Loading Campaigns</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
              <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your email campaigns and track their performance
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4" />
                  Scheduler
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getSchedulerStatus}>
                  <Info className="h-4 w-4 mr-2" />
                  Check Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={refreshSchedulerCache}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Cache
                </DropdownMenuItem>
                <DropdownMenuItem onClick={checkScheduledCampaigns}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Check Scheduled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed, {stats.running} running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmailsSent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEmailsFailed} failed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageOpenRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all campaigns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageClickRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Campaign['status'] | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as Campaign['type'] | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first campaign"}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Campaign
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            {getStatusBadge(campaign.status)}
                            {getTypeBadge(campaign.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {campaign.totalRecipients} recipients
                            </div>
                            <div className="flex items-center gap-1">
                              <Send className="h-4 w-4" />
                              {campaign.sentCount} sent
                            </div>
                            {campaign.openedCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {campaign.openedCount} opened
                              </div>
                            )}
                            {campaign.scheduledAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(campaign.scheduledAt), "MMM dd, yyyy 'at' HH:mm")}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                              <Button
                                onClick={() => openRunModal(campaign)}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Run Campaign
                              </Button>
                            )}
                            {campaign.status === 'running' && (
                              <Button
                                onClick={() => handleCancelCampaign(campaign._id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Cancel Campaign
                              </Button>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPreviewModal(campaign)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(campaign)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                              <DropdownMenuItem onClick={() => openRunModal(campaign)}>
                                <Play className="h-4 w-4 mr-2" />
                                Run Now
                              </DropdownMenuItem>
                            )}
                            {campaign.status === 'running' && (
                              <DropdownMenuItem onClick={() => handleCancelCampaign(campaign._id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteModal(campaign)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} campaigns
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateCampaignModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateCampaign}
        loading={mutationLoading}
      />

      {selectedCampaign && (
        <>
          <EditCampaignModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            campaign={selectedCampaign}
            onSubmit={handleEditCampaign}
            loading={mutationLoading}
          />

          <CampaignPreviewModal
            open={showPreviewModal}
            onOpenChange={setShowPreviewModal}
            campaign={selectedCampaign}
          />

          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Campaign"
            message={`Are you sure you want to delete this campaign? This action cannot be undone.`}
            itemName={selectedCampaign.name}
            onConfirm={() => handleDeleteCampaign(selectedCampaign._id)}
            isLoading={mutationLoading}
          />

          <RunCampaignModal
            open={showRunModal}
            onOpenChange={setShowRunModal}
            campaign={selectedCampaign}
            onRun={handleRunCampaign}
            loading={mutationLoading}
          />
        </>
      )}
    </div>
  );
} 