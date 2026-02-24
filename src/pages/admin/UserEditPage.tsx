import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useUserManagement } from "@/api/hooks/useUserManagement";
import { UpdateUserRequest } from "@/api/types";
import RetryPage from "@/components/common/RetryPage";
import PageLoader from "@/components/common/PageLoader";

const UserEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const userId = id || '';

    const { useUserDetails, updateUser, isUpdating } = useUserManagement();
    const { data: userResponse, isLoading: isLoadingUser } = useUserDetails(userId);

    // Extract user data from API response
    const user = userResponse?.data;

    const [formData, setFormData] = useState<UpdateUserRequest>({});

    const isSaving = isUpdating;

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || undefined,
                countryCode: user.countryCode || undefined,
                stateCode: user.stateCode || undefined,
                cityName: user.cityName || undefined,
                stageCode: user.stage?.code || undefined,
                fundingRangeCode: user.fundingRange?.code || undefined,
                teamSizeCode: user.teamSize?.code || undefined,
                revenueStatusCode: user.revenueStatus?.code || undefined,
                incorporationStatusCode: user.incorporationStatus?.code || undefined,
                isEmailVerified: user.isEmailVerified,
                isOnboardingCompleted: user.isOnboardingCompleted,
                // Legacy fields (for backward compatibility)
                firstName: user.firstName || undefined,
                lastName: user.lastName || undefined,
                phone: user.phone || undefined,
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : undefined,
                gender: user.gender || undefined,
                isPhoneVerified: user.isPhoneVerified,
                isFaceVerified: user.isFaceVerified,
                isAccountPaused: user.isAccountPaused,
            });
        }
    }, [user]);

    const handleChange = (field: keyof UpdateUserRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            // Clean up undefined values
            const cleanedData: Partial<UpdateUserRequest> = {};
            (Object.keys(formData) as Array<keyof UpdateUserRequest>).forEach((key) => {
                const value = formData[key];
                if (value !== undefined && value !== null && value !== '') {
                    (cleanedData as Record<string, any>)[key] = value;
                }
            });

            updateUser(
                { id: user.id, data: cleanedData },
                {
                    onSuccess: (response) => {
                        if (response?.success) {
                            navigate('/admin/users');
                        }
                    },
                    onError: (error: any) => {
                        // Error toast is already handled by the hook
                        console.error('Update error:', error);
                    },
                }
            );
        }
    };

    const handleCancel = () => {
        navigate('/admin/users');
    };

    if (isLoadingUser) {
        return (
            <PageLoader pagename="user" />
        );
    }

    if (!user) {
        return (
            <RetryPage
                message="Failed to load user details"
                btnName="Back to Users"
                onRetry={handleCancel}
            />
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        Edit User: {user.email || user.id}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4 p-6 border rounded-lg">
                    <h4 className="font-semibold text-lg mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="Email"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="countryCode">Country Code</Label>
                            <Input
                                id="countryCode"
                                value={formData.countryCode || ''}
                                onChange={(e) => handleChange('countryCode', e.target.value)}
                                placeholder="AF"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stateCode">State Code</Label>
                            <Input
                                id="stateCode"
                                value={formData.stateCode || ''}
                                onChange={(e) => handleChange('stateCode', e.target.value)}
                                placeholder="BDS"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cityName">City Name</Label>
                            <Input
                                id="cityName"
                                value={formData.cityName || ''}
                                onChange={(e) => handleChange('cityName', e.target.value)}
                                placeholder="City Name"
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4 p-6 border rounded-lg">
                    <h4 className="font-semibold text-lg mb-4">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stageCode">Stage</Label>
                            <Select
                                value={formData.stageCode || ''}
                                onValueChange={(value) => handleChange('stageCode', value === 'none' ? undefined : value)}
                                disabled={isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="idea">Idea / Concept</SelectItem>
                                    <SelectItem value="mvp">MVP / Prototype</SelectItem>
                                    <SelectItem value="early_revenue">Early Revenue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fundingRangeCode">Funding Range</Label>
                            <Select
                                value={formData.fundingRangeCode || ''}
                                onValueChange={(value) => handleChange('fundingRangeCode', value === 'none' ? undefined : value)}
                                disabled={isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select funding range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="early">₹0 - ₹50 Lakh</SelectItem>
                                    <SelectItem value="seed">₹50 Lakh - ₹2 Cr</SelectItem>
                                    <SelectItem value="growth">₹2 Cr+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teamSizeCode">Team Size</Label>
                            <Select
                                value={formData.teamSizeCode || ''}
                                onValueChange={(value) => handleChange('teamSizeCode', value === 'none' ? undefined : value)}
                                disabled={isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="solo">Solo founder</SelectItem>
                                    <SelectItem value="2-5">2-5</SelectItem>
                                    <SelectItem value="6-10">6-10</SelectItem>
                                    <SelectItem value="11+">11+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenueStatusCode">Revenue Status</Label>
                            <Select
                                value={formData.revenueStatusCode || ''}
                                onValueChange={(value) => handleChange('revenueStatusCode', value === 'none' ? undefined : value)}
                                disabled={isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select revenue status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="pre_revenue">Pre-revenue</SelectItem>
                                    <SelectItem value="early_revenue">Early revenue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incorporationStatusCode">Incorporation Status</Label>
                            <Select
                                value={formData.incorporationStatusCode || ''}
                                onValueChange={(value) => handleChange('incorporationStatusCode', value === 'none' ? undefined : value)}
                                disabled={isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select incorporation status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="not_incorporated">Not incorporated</SelectItem>
                                    <SelectItem value="incorporated">Incorporated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Verification & Status */}
                <div className="space-y-4 p-6 border rounded-lg">
                    <h4 className="font-semibold text-lg mb-4">Verification & Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isEmailVerified">Email Verified</Label>
                            <Switch
                                id="isEmailVerified"
                                checked={formData.isEmailVerified || false}
                                onCheckedChange={(checked) => handleChange('isEmailVerified', checked)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isOnboardingCompleted">Onboarding Completed</Label>
                            <Switch
                                id="isOnboardingCompleted"
                                checked={formData.isOnboardingCompleted || false}
                                onCheckedChange={(checked) => handleChange('isOnboardingCompleted', checked)}
                                disabled={isSaving}
                            />
                        </div>
                        {/* Legacy fields (for backward compatibility) */}
                        {user.isPhoneVerified !== undefined && (
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isPhoneVerified">Phone Verified</Label>
                                <Switch
                                    id="isPhoneVerified"
                                    checked={formData.isPhoneVerified || false}
                                    onCheckedChange={(checked) => handleChange('isPhoneVerified', checked)}
                                    disabled={isSaving}
                                />
                            </div>
                        )}
                        {user.isFaceVerified !== undefined && (
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isFaceVerified">Face Verified</Label>
                                <Switch
                                    id="isFaceVerified"
                                    checked={formData.isFaceVerified || false}
                                    onCheckedChange={(checked) => handleChange('isFaceVerified', checked)}
                                    disabled={isSaving}
                                />
                            </div>
                        )}
                        {user.isAccountPaused !== undefined && (
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isAccountPaused">Account Paused</Label>
                                <Switch
                                    id="isAccountPaused"
                                    checked={formData.isAccountPaused || false}
                                    onCheckedChange={(checked) => handleChange('isAccountPaused', checked)}
                                    disabled={isSaving}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                    >
                        {isSaving ? (
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
            </form>
        </div>
    );
};

export default UserEditPage;

