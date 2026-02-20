import { useState } from "react";
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
  Search,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useStages,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
} from "@/api/hooks/useOnboarding";
import { Stage, CreateReferenceDataRequest, UpdateReferenceDataRequest } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";

export default function StagesManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);

  const { data: stages = [], isLoading } = useStages({ includeInactive });
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();

  const [formData, setFormData] = useState<CreateReferenceDataRequest>({
    code: "",
    label: "",
    description: "",
    sortOrder: 0,
    active: true,
  });

  const filteredStages = stages.filter(
    (stage) =>
      stage.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({
      code: "",
      label: "",
      description: "",
      sortOrder: stages.length > 0 ? Math.max(...stages.map(s => s.sortOrder)) + 1 : 0,
      active: true,
    });
    setIsCreateDialogOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateDialogOpen(false);
    setFormData({
      code: "",
      label: "",
      description: "",
      sortOrder: 0,
      active: true,
    });
  };

  const openEditModal = (stage: Stage) => {
    setSelectedStage(stage);
    setFormData({
      code: stage.code,
      label: stage.label,
      description: stage.description || "",
      sortOrder: stage.sortOrder,
      active: stage.active,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setIsEditDialogOpen(false);
    setSelectedStage(null);
    setFormData({
      code: "",
      label: "",
      description: "",
      sortOrder: 0,
      active: true,
    });
  };

  const handleCreate = () => {
    if (!formData.code.trim() || !formData.label.trim()) {
      toast({
        title: "Error",
        description: "Code and label are required",
        variant: "destructive",
      });
      return;
    }

    createStage.mutate(formData, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedStage || !formData.code.trim() || !formData.label.trim()) {
      toast({
        title: "Error",
        description: "Code and label are required",
        variant: "destructive",
      });
      return;
    }

    updateStage.mutate(
      { id: selectedStage.id, data: formData },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!stageToDelete) return;
    deleteStage.mutate(stageToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setStageToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        page="stages"
        heading="Stages Management"
        subHeading="Manage startup stages for onboarding"
        openModal={openCreateModal}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Stages</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeInactive"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeInactive" className="text-sm">
                  Include Inactive
                </Label>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <PageLoader pagename="stages" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <TrendingUp className="h-12 w-12 mb-4" />
                          <p>No stages found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStages.map((stage) => (
                      <TableRow key={stage.id}>
                        <TableCell className="font-mono text-sm">{stage.code}</TableCell>
                        <TableCell className="font-medium">{stage.label}</TableCell>
                        <TableCell>{stage.description || "-"}</TableCell>
                        <TableCell>{stage.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={stage.active ? "default" : "secondary"}>
                            {stage.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{stage.id}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(stage)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setStageToDelete(stage);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={deleteStage.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., pre_seed, seed_round"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase with underscores only (e.g., pre_seed, series_a)
              </p>
            </div>
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Pre-Seed, Seed Round"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the stage..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order *</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="active">Active (visible in signup)</Label>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createStage.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {createStage.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Stage"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Code *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-label">Label *</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">Sort Order *</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={updateStage.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {updateStage.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stage"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the stage <strong>{stageToDelete?.label}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteStage.isPending}
              >
                {deleteStage.isPending ? (
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
