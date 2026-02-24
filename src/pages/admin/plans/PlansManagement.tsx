import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/api/hooks/usePlans";
import { useFeatures } from "@/api/hooks/useFeatures";
import { Plan, CreatePlanRequest, UpdatePlanRequest } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { Search } from "lucide-react";
import PlansStats from "./components/PlansStats";
import PlansTable from "./components/PlansTable";
import CreatePlanDialog from "./components/CreatePlanDialog";
import EditPlanDialog from "./components/EditPlanDialog";
import DeletePlanDialog from "./components/DeletePlanDialog";
import ManageFeaturesDialog from "./components/ManageFeaturesDialog";

export default function PlansManagement() {
  console.log('[PlansManagement] Component render');
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

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      isActive: statusFilter !== "all" ? statusFilter : undefined,
    };
    console.log('[PlansManagement] Query params memoized:', params);
    return params;
  }, [currentPage, searchTerm, statusFilter]);

  const {
    plans,
    stats,
    pagination,
    isLoading,
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
  } = usePlans(queryParams);

  // Get all features for association (max limit is 100 per API)
  const { features: allFeatures } = useFeatures({ limit: 100 });

  // Removed useEffect that was watching plans.length - this was causing unnecessary re-renders
  // The plans array reference changes on each render even if contents are the same

  const openCreateModal = () => {
    console.log('[PlansManagement] Opening create modal');
    setIsCreateDialogOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    console.log('[PlansManagement] Opening edit modal for plan:', plan.id);
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const closeEditModal = () => {
    console.log('[PlansManagement] Closing edit modal');
    setIsEditDialogOpen(false);
    setSelectedPlan(null);
  };

  const openFeaturesModal = (plan: Plan) => {
    console.log('[PlansManagement] Opening features modal for plan:', plan.id);
    setSelectedPlan(plan);
    setIsFeaturesDialogOpen(true);
  };

  const closeFeaturesModal = () => {
    console.log('[PlansManagement] Closing features modal');
    setIsFeaturesDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleCreate = (data: CreatePlanRequest) => {
    console.log('[PlansManagement] Handle create called:', data);
    createPlan(data, {
      onSuccess: () => {
        console.log('[PlansManagement] Create success callback');
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdate = (id: number, data: UpdatePlanRequest) => {
    console.log('[PlansManagement] Handle update called:', id, data);
    updatePlan(
      { id, data },
      {
        onSuccess: () => {
          console.log('[PlansManagement] Update success callback');
          closeEditModal();
        },
      }
    );
  };

  const handleDelete = () => {
    console.log('[PlansManagement] Handle delete called, planToDelete:', planToDelete?.id, 'isDeleting:', isDeleting);
    if (!planToDelete || isDeleting) {
      console.log('[PlansManagement] Delete blocked - no plan or already deleting');
      return;
    }

    const planIdToDelete = planToDelete.id;
    console.log('[PlansManagement] Closing delete dialog and calling deletePlan for:', planIdToDelete);
    
    // Close delete dialog immediately to prevent UI freeze
    setIsDeleteDialogOpen(false);
    setPlanToDelete(null);
    
    // Close all dialogs and clear selected plan if it's the one being deleted
    if (selectedPlan?.id === planIdToDelete) {
      console.log('[PlansManagement] Closing other dialogs for deleted plan');
      setIsEditDialogOpen(false);
      setIsFeaturesDialogOpen(false);
      setSelectedPlan(null);
    }
    
    // Call delete mutation - mutation's onSuccess handles everything
    deletePlan(planIdToDelete);
  };

  const handleToggleStatus = (plan: Plan) => {
    console.log('[PlansManagement] Handle toggle status for plan:', plan.id);
    toggleStatus(plan.id);
  };

  const handleAssociateFeatures = (planId: number, featureIds: number[]) => {
    console.log('[PlansManagement] Handle associate features for plan:', planId, 'features:', featureIds.length);
    associateFeatures(
      { id: planId, data: { featureIds } },
      {
        onSuccess: () => {
          console.log('[PlansManagement] Associate features success callback');
          closeFeaturesModal();
        },
      }
    );
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
      <PlansStats stats={stats} />

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
            <PlansTable
              plans={plans}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onEdit={openEditModal}
              onDelete={(plan) => {
                setPlanToDelete(plan);
                setIsDeleteDialogOpen(true);
              }}
              onManageFeatures={openFeaturesModal}
              onToggleStatus={handleToggleStatus}
              isTogglingStatus={isTogglingStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreate}
        isCreating={isCreating}
        allFeatures={allFeatures}
      />

      {/* Edit Plan Dialog */}
      <EditPlanDialog
        open={isEditDialogOpen}
        onOpenChange={closeEditModal}
        onUpdate={handleUpdate}
        isUpdating={isUpdating}
        plan={selectedPlan}
        allFeatures={allFeatures}
      />

      {/* Manage Features Dialog */}
      <ManageFeaturesDialog
        open={isFeaturesDialogOpen}
        onOpenChange={closeFeaturesModal}
        onSave={handleAssociateFeatures}
        isSaving={isAssociatingFeatures}
        plan={selectedPlan}
        allFeatures={allFeatures}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePlanDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        plan={planToDelete}
      />
    </div>
  );
}
