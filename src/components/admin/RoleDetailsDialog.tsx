import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Shield, Edit, X } from "lucide-react";
import { useRolePermissions } from "@/api/hooks/useRoles";
import { Role } from "@/api/types";

interface RoleDetailsDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (role: Role) => void;
}

export function RoleDetailsDialog({
  role,
  isOpen,
  onClose,
  onEdit,
}: RoleDetailsDialogProps) {
  const { rolePermissions, isLoading } = useRolePermissions(role?.id || 0);

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-green" />
              Role Details: {role.roleName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(role);
                  onClose();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role Name
              </label>
              <p className="text-lg font-semibold">{role.roleName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-base">
                {role.description || "No description provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                {role.isActive !== false ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role ID
              </label>
              <p className="text-base">{role.id}</p>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Assigned Permissions</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : rolePermissions?.permissions && rolePermissions.permissions.length > 0 ? (
              <div className="space-y-3">
                {rolePermissions.permissions.map((perm: any) => (
                  <div
                    key={perm.id || perm.permissionName}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-brand-green" />
                        <span className="font-medium">{perm.permissionName}</span>
                      </div>
                    </div>
                    <div className="ml-6 space-y-1">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Permission Max:</span>{" "}
                        {perm.permissionAllowedActions && perm.permissionAllowedActions.length > 0
                          ? perm.permissionAllowedActions
                              .map((a: string) => a.charAt(0).toUpperCase() + a.slice(1))
                              .join(", ")
                          : "All Actions"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Role Granted:</span>{" "}
                        {perm.roleAllowedActions === null ||
                        (Array.isArray(perm.roleAllowedActions) &&
                          perm.roleAllowedActions.length === 0)
                          ? "All Actions (from permission)"
                          : perm.roleAllowedActions
                              ?.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1))
                              .join(", ") || "All Actions"}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(perm.roleAllowedActions === null ||
                        (Array.isArray(perm.roleAllowedActions) &&
                          perm.roleAllowedActions.length === 0)
                          ? perm.permissionAllowedActions || ["create", "read", "update", "delete"]
                          : perm.roleAllowedActions || []
                        ).map((action: string) => (
                          <Badge
                            key={action}
                            variant="outline"
                            className="text-xs"
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No permissions assigned to this role</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

