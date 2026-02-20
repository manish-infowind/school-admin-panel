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
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTeamSizes,
  useCreateTeamSize,
  useUpdateTeamSize,
  useDeleteTeamSize,
} from "@/api/hooks/useOnboarding";
import { TeamSize, CreateReferenceDataRequest, UpdateReferenceDataRequest } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";

export default function TeamSizesManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeamSize, setSelectedTeamSize] = useState<TeamSize | null>(null);
  const [teamSizeToDelete, setTeamSizeToDelete] = useState<TeamSize | null>(null);

  const { data: teamSizes = [], isLoading } = useTeamSizes({ includeInactive });
  const createTeamSize = useCreateTeamSize();
  const updateTeamSize = useUpdateTeamSize();
  const deleteTeamSize = useDeleteTeamSize();

  const [formData, setFormData] = useState<CreateReferenceDataRequest>({
    code: "",
    label: "",
    description: "",
    sortOrder: 0,
    active: true,
  });

  const filteredTeamSizes = teamSizes.filter(
    (teamSize) =>
      teamSize.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teamSize.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teamSize.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({
      code: "",
      label: "",
      description: "",
      sortOrder: teamSizes.length > 0 ? Math.max(...teamSizes.map(t => t.sortOrder)) + 1 : 0,
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

  const openEditModal = (teamSize: TeamSize) => {
    setSelectedTeamSize(teamSize);
    setFormData({
      code: teamSize.code,
      label: teamSize.label,
      description: teamSize.description || "",
      sortOrder: teamSize.sortOrder,
      active: teamSize.active,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setIsEditDialogOpen(false);
    setSelectedTeamSize(null);
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

    createTeamSize.mutate(formData, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedTeamSize || !formData.code.trim() || !formData.label.trim()) {
      toast({
        title: "Error",
        description: "Code and label are required",
        variant: "destructive",
      });
      return;
    }

    updateTeamSize.mutate(
      { id: selectedTeamSize.id, data: formData },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!teamSizeToDelete) return;
    deleteTeamSize.mutate(teamSizeToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setTeamSizeToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        page="team-sizes"
        heading="Team Sizes Management"
        subHeading="Manage team sizes for onboarding"
        openModal={openCreateModal}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Team Sizes</CardTitle>
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
                  placeholder="Search team sizes..."
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
            <PageLoader pagename="team-sizes" />
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
                  {filteredTeamSizes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <Users className="h-12 w-12 mb-4" />
                          <p>No team sizes found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeamSizes.map((teamSize) => (
                      <TableRow key={teamSize.id}>
                        <TableCell className="font-mono text-sm">{teamSize.code}</TableCell>
                        <TableCell className="font-medium">{teamSize.label}</TableCell>
                        <TableCell>{teamSize.description || "-"}</TableCell>
                        <TableCell>{teamSize.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={teamSize.active ? "default" : "secondary"}>
                            {teamSize.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{teamSize.id}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(teamSize)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setTeamSizeToDelete(teamSize);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={deleteTeamSize.isPending}
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
            <DialogTitle>Create New Team Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., solo, small, medium"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase with underscores only (e.g., solo, small, medium)
              </p>
            </div>
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Solo Founder, 2-10 employees"
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
                placeholder="Describe the team size..."
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
              disabled={createTeamSize.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {createTeamSize.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team Size"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Size</DialogTitle>
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
              disabled={updateTeamSize.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {updateTeamSize.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Team Size"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the team size <strong>{teamSizeToDelete?.label}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTeamSize.isPending}
              >
                {deleteTeamSize.isPending ? (
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
