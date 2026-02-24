import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/api/hooks/usePlans";
import { useFeatures } from "@/api/hooks/useFeatures";
import { Plan, CreatePlanRequest, UpdatePlanRequest, Feature } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export default function PlansManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFeaturesDialogOpen, setIsFeaturesDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    isActive: statusFilter !== "all" ? statusFilter : undefined,
  }), [currentPage, searchTerm, statusFilter]);

  const {
    plans,
    stats,
    pagination,
    isLoading,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingStatus,
    isAssociatingFeatures,
    createPlan,
    updatePlan,
    deletePlan,
    toggleStatus,
    associateFeatures,
    refetch,
  } = usePlans(queryParams);

  // Get all features for association (max limit is 100 per API)
  const { features: allFeatures } = useFeatures({ limit: 100 });

  const [formData, setFormData] = useState<CreatePlanRequest>({
    code: "",
    name: "",
    priceCents: 0,
    interval: "month",
    currency: "INR",
    stripePriceId: "",
    ctaLabel: "",
    badge: "",
    sortOrder: 0,
    isActive: true,
    featureIds: [],
  });

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);

  // Initialize selected features when dialog opens - use plan data from list only
  useEffect(() => {
    if (isFeaturesDialogOpen && selectedPlan) {
      // Use plan data from list (immediate, no API call needed)
      if (selectedPlan.features && selectedPlan.features.length > 0) {
        const featureIds = selectedPlan.features.map((f) => f.id);
        setSelectedFeatureIds(featureIds);
      } else {
        setSelectedFeatureIds([]);
      }
    } else if (!isFeaturesDialogOpen) {
      // Clear when dialog closes
      setSelectedFeatureIds([]);
    }
  }, [isFeaturesDialogOpen, selectedPlan?.id]);

  const openCreateModal = () => {
    setFormData({
      code: "",
      name: "",
      priceCents: 0,
      interval: "month",
      currency: "INR",
      stripePriceId: "",
      ctaLabel: "",
      badge: "",
      sortOrder: 0,
      isActive: true,
      featureIds: [],
    });
    setIsCreateDialogOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateDialogOpen(false);
    setFormData({
      code: "",
      name: "",
      priceCents: 0,
      interval: "month",
      currency: "INR",
      stripePriceId: "",
      ctaLabel: "",
      badge: "",
      sortOrder: 0,
      isActive: true,
      featureIds: [],
    });
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      priceCents: plan.priceCents,
      interval: plan.interval,
      currency: plan.currency,
      stripePriceId: plan.stripePriceId || "",
      ctaLabel: plan.ctaLabel || "",
      badge: plan.badge || "",
      sortOrder: plan.sortOrder,
      isActive: plan.isActive,
      featureIds: plan.features?.map((f) => f.id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setIsEditDialogOpen(false);
    setSelectedPlan(null);
    setFormData({
      code: "",
      name: "",
      priceCents: 0,
      interval: "month",
      currency: "INR",
      stripePriceId: "",
      ctaLabel: "",
      badge: "",
      sortOrder: 0,
      isActive: true,
      featureIds: [],
    });
  };

  const openFeaturesModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFeaturesDialogOpen(true);
  };

  const closeFeaturesModal = () => {
    setIsFeaturesDialogOpen(false);
    setSelectedPlan(null);
    setSelectedFeatureIds([]);
  };

  const handleCreate = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Code and name are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.priceCents < 0) {
      toast({
        title: "Error",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Validate code format
    if (!/^[a-z0-9_]+$/.test(formData.code)) {
      toast({
        title: "Error",
        description: "Code must contain only lowercase letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }

    createPlan(formData, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedPlan || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.priceCents < 0) {
      toast({
        title: "Error",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdatePlanRequest = {
      name: formData.name,
      priceCents: formData.priceCents,
      interval: formData.interval,
      currency: formData.currency,
      stripePriceId: formData.stripePriceId,
      ctaLabel: formData.ctaLabel,
      badge: formData.badge,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      featureIds: formData.featureIds,
    };

    updatePlan(
      { id: selectedPlan.id, data: updateData },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!planToDelete || isDeleting) return;

    const planIdToDelete = planToDelete.id;
    
    // Close delete dialog immediately to prevent UI freeze
    setIsDeleteDialogOpen(false);
    setPlanToDelete(null);
    
    // Close all dialogs and clear selected plan if it's the one being deleted
    if (selectedPlan?.id === planIdToDelete) {
      setIsEditDialogOpen(false);
      setIsFeaturesDialogOpen(false);
      setSelectedPlan(null);
      // Clear form data
      setFormData({
        code: "",
        name: "",
        priceCents: 0,
        interval: "month",
        currency: "INR",
        stripePriceId: "",
        ctaLabel: "",
        badge: "",
        sortOrder: 0,
        isActive: true,
        featureIds: [],
      });
    }
    
    // Call delete mutation - mutation's onSuccess handles everything
    // No callbacks here to prevent blocking
    deletePlan(planIdToDelete);
  };

  const handleToggleStatus = (plan: Plan) => {
    toggleStatus(plan.id);
  };

  const handleAssociateFeatures = () => {
    if (!selectedPlan) return;

    associateFeatures(
      { id: selectedPlan.id, data: { featureIds: selectedFeatureIds } },
      {
        onSuccess: () => {
          closeFeaturesModal();
        },
      }
    );
  };

  const toggleFeature = (featureId: number) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const formatPrice = (cents: number) => {
    return `₹${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        page="plans"
        heading="Plans Management"
        subHeading="Manage subscription plans and their features"
        openModal={openCreateModal}
      />

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Plans</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="text-sm">Status:</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <PageLoader pagename="plans" />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center">
                            <Package className="h-12 w-12 mb-4" />
                            <p>No plans found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-mono text-sm">{plan.code}</TableCell>
                          <TableCell className="font-medium">
                            {plan.name}
                            {plan.badge && (
                              <Badge variant="secondary" className="ml-2">
                                {plan.badge}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatPrice(plan.priceCents)}</TableCell>
                          <TableCell className="capitalize">{plan.interval}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {plan.features?.length || 0} features
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={plan.isActive ? "secondary" : "outline"}>
                              {plan.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(plan.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openFeaturesModal(plan)}
                                >
                                  <LinkIcon className="h-4 w-4 mr-2" />
                                  Manage Features
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(plan)}
                                  disabled={isTogglingStatus}
                                >
                                  {plan.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(plan)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPlanToDelete(plan);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} plans
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage || currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Plan Code *</Label>
              <Input
                id="code"
                placeholder="e.g., premium"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toLowerCase() })
                }
                pattern="[a-z0-9_]+"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase letters, numbers, and underscores only. Cannot be changed after creation.
              </p>
            </div>
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Premium Plan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceCents">Price (in cents) *</Label>
                <Input
                  id="priceCents"
                  type="number"
                  value={formData.priceCents}
                  onChange={(e) =>
                    setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: 999 = ₹9.99
                </p>
              </div>
              <div>
                <Label htmlFor="interval">Billing Interval *</Label>
                <select
                  id="interval"
                  value={formData.interval}
                  onChange={(e) =>
                    setFormData({ ...formData, interval: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                  }
                  maxLength={3}
                  pattern="[A-Z]{3}"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="stripePriceId">Stripe Price ID</Label>
              <Input
                id="stripePriceId"
                value={formData.stripePriceId}
                onChange={(e) =>
                  setFormData({ ...formData, stripePriceId: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaLabel">CTA Label</Label>
                <Input
                  id="ctaLabel"
                  value={formData.ctaLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLabel: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Associated Features</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {allFeatures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No features available</p>
                ) : (
                  <div className="space-y-2">
                    {allFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature.id}`}
                          checked={formData.featureIds?.includes(feature.id) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                featureIds: [...(formData.featureIds || []), feature.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                featureIds: formData.featureIds?.filter((id) => id !== feature.id) || [],
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`feature-${feature.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {feature.name} ({feature.key})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plan Code</Label>
              <Input
                value={selectedPlan?.code || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Code cannot be changed after creation
              </p>
            </div>
            <div>
              <Label htmlFor="edit-name">Plan Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priceCents">Price (in cents) *</Label>
                <Input
                  id="edit-priceCents"
                  type="number"
                  value={formData.priceCents}
                  onChange={(e) =>
                    setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="edit-interval">Billing Interval *</Label>
                <select
                  id="edit-interval"
                  value={formData.interval}
                  onChange={(e) =>
                    setFormData({ ...formData, interval: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-currency">Currency</Label>
                <Input
                  id="edit-currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                  }
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-stripePriceId">Stripe Price ID</Label>
              <Input
                id="edit-stripePriceId"
                value={formData.stripePriceId}
                onChange={(e) =>
                  setFormData({ ...formData, stripePriceId: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-ctaLabel">CTA Label</Label>
                <Input
                  id="edit-ctaLabel"
                  value={formData.ctaLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLabel: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-badge">Badge</Label>
                <Input
                  id="edit-badge"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Associated Features</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {allFeatures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No features available</p>
                ) : (
                  <div className="space-y-2">
                    {allFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-feature-${feature.id}`}
                          checked={formData.featureIds?.includes(feature.id) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                featureIds: [...(formData.featureIds || []), feature.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                featureIds: formData.featureIds?.filter((id) => id !== feature.id) || [],
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`edit-feature-${feature.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {feature.name} ({feature.key})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Plan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Features Dialog */}
      <Dialog open={isFeaturesDialogOpen} onOpenChange={closeFeaturesModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Features for {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select features to associate with this plan. Changes will replace all existing associations.
            </p>
            <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
              {allFeatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No features available</p>
              ) : (
                <div className="space-y-3">
                  {allFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`manage-feature-${feature.id}`}
                        checked={selectedFeatureIds.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`manage-feature-${feature.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {feature.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {feature.key} {feature.description && `- ${feature.description}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeFeaturesModal}>
                Cancel
              </Button>
              <Button onClick={handleAssociateFeatures} disabled={isAssociatingFeatures}>
                {isAssociatingFeatures ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Associations"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the plan <strong>{planToDelete?.name}</strong>?
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This will soft delete the plan (set as inactive).
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
