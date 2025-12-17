import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const CreateUserModal = ({
    open,
    closeUserModal,
    handleSubmit,
    loading,
    formData,
    editable,
    showButtons,
    deleteUser,
    addEditUserFlag,
    handleInputChange,
    handleUpdateList,
    openDeleteDialog
}) => {

    // Memoize Action Button text to prevent every render
    const ButtonText = React.useMemo(() => {
        if (loading) return "Creating...";
        return addEditUserFlag ? "Update User" : "Create User";
    }, [loading, addEditUserFlag]);

    // Memoize Modal Heading text to prevent every render
    const HeadingText = React.useMemo(() => {
        return showButtons ? "View User Details" : addEditUserFlag ? "Update User Details" : "Create New User"
    }, [loading, addEditUserFlag]);


    return (
        <Dialog open={open} onOpenChange={closeUserModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{HeadingText}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="userName">User Name *</Label>
                            <Input
                                id="userName"
                                value={formData.userName}
                                onChange={(e) => handleInputChange("userName", e.target.value)}
                                placeholder="Enter user name"
                                required
                                disabled={editable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactNumber">Contact Number *</Label>
                            <Input
                                id="contactNumber"
                                value={formData.contactNumber}
                                onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                                placeholder="Enter contact number"
                                required
                                disabled={editable}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="Enter user email"
                                required
                                disabled={editable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileScore">Profile Score *</Label>
                            <Input
                                id="profileScore"
                                value={formData.profileScore}
                                onChange={(e) => handleInputChange("profileScore", e.target.value)}
                                placeholder="Enter profile score"
                                required
                                disabled={editable}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => handleInputChange("gender", value)}
                                disabled={editable}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                placeholder="Enter city name"
                                required
                                disabled={editable}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                disabled={editable}
                            />
                            <Label htmlFor="includeUnsubscribed">
                                Do you want to activate?
                            </Label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">

                        {/* visible for Read only user */}
                        {showButtons && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleUpdateList}
                                    disabled={loading}
                                >
                                    Update
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => openDeleteDialog(deleteUser)}
                                    disabled={loading}
                                >
                                    Delete
                                </Button>
                            </>
                        )}

                        {/* visible for New user only */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeUserModal}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button className="" type="submit" disabled={loading || editable}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {ButtonText}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
};

export default React.memo(CreateUserModal);