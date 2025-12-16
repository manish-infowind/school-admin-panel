import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoles, useRolePermissions, roleKeys } from "@/api/hooks/useRoles";
import { Role, UpdateRoleRequest } from "@/api/types";
import { RolePermissionsDialog } from "./RolePermissionsDialog";

interface RoleEditDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleEditDialog({
  role,
  isOpen,
  onClose,
}: RoleEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateRole, isUpdatingRole } = useRoles();
  const { rolePermissions } = useRolePermissions(role?.id || 0);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [formData, setFormData] = useState<UpdateRoleRequest>({
    roleName: "",
    description: "",
    isActive: true,
  });

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName,
        description: role.description || "",
        isActive: role.isActive !== false,
      });
    }
  }, [role]);

  const handleSave = () => {
    if (!role) return;

    if (!formData.roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    updateRole(role.id, formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!role) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-green" />
              Edit Role: {role.roleName}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Role Details</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-roleName">Role Name</Label>
                  <Input
                    id="edit-roleName"
                    placeholder="e.g., admin, moderator"
                    value={formData.roleName}
                    onChange={(e) =>
                      setFormData({ ...formData, roleName: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use lowercase with underscores (e.g., admin, super_admin)
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Describe the role's purpose..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdatingRole}
                  className="bg-brand-green hover:bg-brand-green/90"
                >
                  {isUpdatingRole ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage permissions assigned to this role. Click the button below to assign or remove permissions.
                  </p>
                  <Button
                    onClick={() => setIsPermissionsDialogOpen(true)}
                    className="bg-brand-green hover:bg-brand-green/90"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>

                {/* Current Permissions Preview */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Current Permissions</h3>
                  {rolePermissions?.permissions && rolePermissions.permissions.length > 0 ? (
                    <div className="space-y-2">
                      {rolePermissions.permissions.map((perm: any) => (
                        <div
                          key={perm.id || perm.permissionName}
                          className="border rounded-lg p-3 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-brand-green" />
                            <span className="font-medium text-sm">{perm.permissionName}</span>
                          </div>
                          <div className="ml-6 text-xs text-muted-foreground">
                            <span className="font-medium">Granted Actions:</span>{" "}
                            {perm.roleAllowedActions === null ||
                            (Array.isArray(perm.roleAllowedActions) &&
                              perm.roleAllowedActions.length === 0)
                              ? "All Actions"
                              : perm.roleAllowedActions
                                  ?.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1))
                                  .join(", ") || "All Actions"}
                          </div>
                          <div className="ml-6 flex flex-wrap gap-1 mt-1">
                            {(perm.roleAllowedActions === null ||
                            (Array.isArray(perm.roleAllowedActions) &&
                              perm.roleAllowedActions.length === 0)
                              ? perm.permissionAllowedActions || ["create", "read", "update", "delete"]
                              : perm.roleAllowedActions || []
                            ).map((action: string) => (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No permissions assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      {role && (
        <RolePermissionsDialog
          roleId={role.id}
          roleName={role.roleName}
          isOpen={isPermissionsDialogOpen}
          onClose={() => {
            setIsPermissionsDialogOpen(false);
            // Refresh role permissions after closing
            if (role?.id) {
              queryClient.invalidateQueries({ queryKey: roleKeys.rolePermissions(role.id) });
            }
          }}
        />
      )}
    </>
  );
}

