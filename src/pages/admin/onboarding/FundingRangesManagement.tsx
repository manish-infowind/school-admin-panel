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
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useFundingRanges,
  useCreateFundingRange,
  useUpdateFundingRange,
  useDeleteFundingRange,
} from "@/api/hooks/useOnboarding";
import { FundingRange, CreateReferenceDataRequest, UpdateReferenceDataRequest } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";

export default function FundingRangesManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFundingRange, setSelectedFundingRange] = useState<FundingRange | null>(null);
  const [fundingRangeToDelete, setFundingRangeToDelete] = useState<FundingRange | null>(null);

  const { data: fundingRanges = [], isLoading } = useFundingRanges({ includeInactive });
  const createFundingRange = useCreateFundingRange();
  const updateFundingRange = useUpdateFundingRange();
  const deleteFundingRange = useDeleteFundingRange();

  const [formData, setFormData] = useState<CreateReferenceDataRequest>({
    code: "",
    label: "",
    description: "",
    sortOrder: 0,
    active: true,
  });

  const filteredFundingRanges = fundingRanges.filter(
    (fundingRange) =>
      fundingRange.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fundingRange.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fundingRange.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({
      code: "",
      label: "",
      description: "",
      sortOrder: fundingRanges.length > 0 ? Math.max(...fundingRanges.map(f => f.sortOrder)) + 1 : 0,
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

  const openEditModal = (fundingRange: FundingRange) => {
    setSelectedFundingRange(fundingRange);
    setFormData({
      code: fundingRange.code,
      label: fundingRange.label,
      description: fundingRange.description || "",
      sortOrder: fundingRange.sortOrder,
      active: fundingRange.active,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setIsEditDialogOpen(false);
    setSelectedFundingRange(null);
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

    createFundingRange.mutate(formData, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedFundingRange || !formData.code.trim() || !formData.label.trim()) {
      toast({
        title: "Error",
        description: "Code and label are required",
        variant: "destructive",
      });
      return;
    }

    updateFundingRange.mutate(
      { id: selectedFundingRange.id, data: formData },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!fundingRangeToDelete) return;
    deleteFundingRange.mutate(fundingRangeToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setFundingRangeToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        page="funding-ranges"
        heading="Funding Ranges Management"
        subHeading="Manage funding ranges for onboarding"
        openModal={openCreateModal}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Funding Ranges</CardTitle>
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
                  placeholder="Search funding ranges..."
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
            <PageLoader pagename="funding-ranges" />
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
                  {filteredFundingRanges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <DollarSign className="h-12 w-12 mb-4" />
                          <p>No funding ranges found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFundingRanges.map((fundingRange) => (
                      <TableRow key={fundingRange.id}>
                        <TableCell className="font-mono text-sm">{fundingRange.code}</TableCell>
                        <TableCell className="font-medium">{fundingRange.label}</TableCell>
                        <TableCell>{fundingRange.description || "-"}</TableCell>
                        <TableCell>{fundingRange.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={fundingRange.active ? "default" : "secondary"}>
                            {fundingRange.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{fundingRange.id}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(fundingRange)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setFundingRangeToDelete(fundingRange);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={deleteFundingRange.isPending}
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
            <DialogTitle>Create New Funding Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., early, seed, series_a"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase with underscores only (e.g., early, seed, series_a)
              </p>
            </div>
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., $0 - $500K, $500K - $2M"
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
                placeholder="Describe the funding range..."
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
              disabled={createFundingRange.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {createFundingRange.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Funding Range"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Funding Range</DialogTitle>
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
              disabled={updateFundingRange.isPending}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {updateFundingRange.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Funding Range"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Funding Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the funding range <strong>{fundingRangeToDelete?.label}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFundingRange.isPending}
              >
                {deleteFundingRange.isPending ? (
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
