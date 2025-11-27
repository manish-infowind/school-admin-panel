import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  Eye,
  Lock,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAdminManagement } from "@/api/hooks/useAdminManagement";
import { AdminUser, CreateAdminRequest, UpdateAdminRequest, ChangePasswordRequest } from "@/api/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

export default function AdminManagement() {
  // provide a narrow shape for the auth slice so TS knows about loginState.role
  const auth = useSelector((state: RootState) =>
      state?.auth as { loginState?: { role?: string } } | undefined
  );
  const loginState = auth?.loginState;
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form states for create/edit
  const [formData, setFormData] = useState<CreateAdminRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "admin",
    phone: "",
    location: "",
    bio: "",
    permissions: ["read", "write"],
    isActive: true,
  });

  // Password change form
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    newPassword: "",
    confirmPassword: "",
  });
  
  // Check if current user is superadmin
  const isSuperAdmin = loginState?.role === 'super_admin';

  // Use the admin management hook
  const {
    admins,
    stats,
    pagination,
    isLoading,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingStatus,
    isChangingPassword,
    error,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleStatus,
    changePassword,
    refetch,
  } = useAdminManagement({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Handle search and filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      refetch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter, refetch]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle create admin
  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAdmin(formData);
    setIsCreateModalOpen(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "admin",
      phone: "",
      location: "",
      bio: "",
      permissions: ["read", "write"],
      isActive: true,
    });
  };

  // Handle edit admin
  const handleEditAdmin = async () => {
    if (!selectedAdmin || !formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateAdminRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
      permissions: formData.permissions,
      isActive: formData.isActive,
    };

    updateAdmin({ id: selectedAdmin.id, data: updateData });
    setIsEditModalOpen(false);
    setSelectedAdmin(null);
  };

  // Handle delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    deleteAdmin(selectedAdmin.id);
    setIsDeleteModalOpen(false);
    setSelectedAdmin(null);
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!selectedAdmin || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    changePassword({ id: selectedAdmin.id, data: passwordData });
    setIsPasswordModalOpen(false);
    setSelectedAdmin(null);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  // Open edit modal
  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "",
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      phone: admin.phone,
      location: admin.location,
      bio: admin.bio || "",
      permissions: admin.permissions,
      isActive: admin.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // Open view modal
  const openViewModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsViewModalOpen(true);
  };

  // Open password modal
  const openPasswordModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsPasswordModalOpen(true);
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    return role === 'super_admin' ? (
      <Badge variant="destructive" className="bg-red-600">
        <Shield className="h-3 w-3 mr-1" />
        Super Admin
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-600">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-600">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500">
        <ShieldX className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If not superadmin, show access denied
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShieldX className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access this page. Only Super Admins can manage other admins.
              </p>
            </div>
          </CardContent>
        </Card>
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
              Admin Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage admin accounts, permissions, and access controls
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Add New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name *</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name *</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Username *</label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <Input
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Enter bio"
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Role & Permissions Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Role & Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background h-10"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['read', 'write', 'delete', 'admin'].map((permission) => (
                          <label key={permission} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.includes(permission)}
                              onChange={(e) => {
                                const permissions = formData.permissions || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, permissions: [...permissions, permission] });
                                } else {
                                  setFormData({ ...formData, permissions: permissions.filter(p => p !== permission) });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm capitalize font-medium">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isCreating}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAdmin}
                    disabled={isCreating}
                    className="bg-brand-green hover:bg-brand-green/90 text-white px-6"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Super Admins</span>
              </div>
              <p className="text-2xl font-bold">{stats.superAdmins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Admins</span>
              </div>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShieldX className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Inactive</span>
              </div>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Online</span>
              </div>
              <p className="text-2xl font-bold">{stats.online}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search admins by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Admins List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admins ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading admins...</span>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {(admins as AdminUser[]).map((admin, index) => (
                    <motion.div
                      key={admin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {admin.firstName} {admin.lastName}
                            </h3>
                            {getRoleBadge(admin.role)}
                            {getStatusBadge(admin.isActive)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {admin.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            @{admin.username}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {formatDate(admin.createdAt)}
                            </div>
                            {admin.lastLogin && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last login {formatDate(admin.lastLogin)}
                              </div>
                            )}
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
                            <DropdownMenuItem onClick={() => openViewModal(admin)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(admin)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPasswordModal(admin)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(admin.id)}
                              disabled={isTogglingStatus}
                            >
                              {isTogglingStatus ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : admin.isActive ? (
                                <ShieldX className="h-4 w-4 mr-2" />
                              ) : (
                                <ShieldCheck className="h-4 w-4 mr-2" />
                              )}
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(admin)}
                              disabled={isDeleting}
                              className="text-destructive"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}

                  {(admins as AdminUser[]).length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Admins Found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your search or filters."
                          : "No admins have been created yet."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} admins
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage || isLoading}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={page === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={isLoading}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                        {pagination.totalPages > 5 && (
                          <span className="text-sm text-muted-foreground px-2">...</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage || isLoading}
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
      </motion.div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <Input
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Enter bio"
                  className="h-10"
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Permissions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['read', 'write', 'delete', 'admin'].map((permission) => (
                  <label key={permission} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.includes(permission)}
                      onChange={(e) => {
                        const permissions = formData.permissions || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...permissions, permission] });
                        } else {
                          setFormData({ ...formData, permissions: permissions.filter(p => p !== permission) });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize font-medium">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditAdmin}
                disabled={isUpdating}
                className="bg-brand-green hover:bg-brand-green/90 text-white px-6"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Admin"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Admin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Are you sure you want to delete this admin?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone. The admin account for{" "}
                  <span className="font-medium text-gray-900">
                    {selectedAdmin?.firstName} {selectedAdmin?.lastName}
                  </span>{" "}
                  will be permanently removed.
                </p>
              </div>
            </div>

            {selectedAdmin && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {selectedAdmin.email}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Created {formatDate(selectedAdmin.createdAt)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Admin
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Admin Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Admin Info */}
            {selectedAdmin && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedAdmin.firstName} {selectedAdmin.lastName}</p>
                    <p className="text-sm text-blue-700">{selectedAdmin.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password *</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="h-10"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-yellow-600 text-xs font-bold">!</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Security Notice</p>
                  <p className="text-yellow-700 mt-1">
                    The admin will be notified of this password change. Make sure to use a strong password.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={isChangingPassword}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="bg-brand-green hover:bg-brand-green/90 text-white px-6"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Admin Details
            </DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6">
              {/* Admin Header */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-brand-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedAdmin.firstName} {selectedAdmin.lastName}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedAdmin.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAdmin.email}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {getRoleBadge(selectedAdmin.role)}
                  {getStatusBadge(selectedAdmin.isActive)}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedAdmin.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{selectedAdmin.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedAdmin.location && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">{selectedAdmin.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedAdmin.bio && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Bio</p>
                        <p className="text-sm text-gray-600">{selectedAdmin.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedAdmin.createdAt)}</p>
                      </div>
                    </div>
                    {selectedAdmin.lastLogin && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Last Login</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedAdmin.lastLogin)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">2FA Status</p>
                        <p className="text-sm text-gray-600">
                          {selectedAdmin.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Permissions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedAdmin.permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800 capitalize">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedAdmin);
                  }}
                  className="bg-brand-green hover:bg-brand-green/90 text-white px-6"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Admin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 