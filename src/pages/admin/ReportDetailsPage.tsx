import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    ArrowLeft, 
    Edit2, 
    Save, 
    X, 
    FileText, 
    User, 
    Calendar, 
    Clock,
    AlertTriangle,
    Mail,
    Phone,
    MapPin,
    Loader2
} from "lucide-react";
import { useReports } from "@/api/hooks/useReports";
import { Report, UpdateReportRequest } from "@/api/services/reportService";
import { 
    getReportUserName, 
    getCategoryDisplayName, 
    getParentCategoryDisplayName,
    formatReportType,
    hasReporterInfo,
    hasReportedUserInfo
} from "@/lib/reportUtils";
import PageLoader from "@/components/common/PageLoader";
import RetryPage from "@/components/common/RetryPage";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ReportDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateReportRequest>({
        status: undefined,
        assignedTo: undefined,
        notes: undefined,
        severity: undefined,
    });

    const {
        selectedReport,
        isLoading,
        isUpdating,
        error,
        getReport,
        updateReport,
    } = useReports({ autoFetch: false });

    useEffect(() => {
        if (id) {
            getReport(id);
        }
    }, [id, getReport]);

    // Status Badge
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: "destructive" | "secondary" | "default" | "outline"; label: string; className: string }> = {
            new: { variant: "destructive", label: "New", className: "bg-red-100 text-red-800 hover:bg-red-100" },
            pending: { variant: "destructive", label: "Pending", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
            "in-progress": { variant: "secondary", label: "In Progress", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
            reviewed: { variant: "secondary", label: "Reviewed", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
            resolved: { variant: "default", label: "Resolved", className: "bg-green-100 text-green-800 hover:bg-green-100" },
            closed: { variant: "outline", label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
            dismissed: { variant: "outline", label: "Dismissed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
        };
        const config = statusConfig[status] || statusConfig.new;
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    // Severity Badge
    const getSeverityBadge = (severity: string | null) => {
        const severityConfig = {
            low: { variant: "default" as const, label: "Low", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
            medium: { variant: "secondary" as const, label: "Medium", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
            high: { variant: "destructive" as const, label: "High", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
            critical: { variant: "destructive" as const, label: "Critical", className: "bg-red-100 text-red-800 hover:bg-red-100" },
        };
        const config = severityConfig[severity?.toLowerCase() as keyof typeof severityConfig] || severityConfig.medium;
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    // Format Date
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleEdit = () => {
        if (selectedReport) {
            setEditData({
                status: selectedReport.status as any,
                assignedTo: selectedReport.assignedTo || '',
                notes: selectedReport.notes || '',
                severity: selectedReport.severity as any,
            });
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            status: undefined,
            assignedTo: undefined,
            notes: undefined,
            severity: undefined,
        });
    };

    const handleSave = async () => {
        if (selectedReport && id) {
            const updateData: UpdateReportRequest = {};
            if (editData.status) updateData.status = editData.status;
            if (editData.assignedTo !== undefined) updateData.assignedTo = editData.assignedTo || null;
            if (editData.notes !== undefined) updateData.notes = editData.notes || null;
            if (editData.severity) updateData.severity = editData.severity;

            const success = await updateReport(id, updateData);
            if (success) {
                setIsEditing(false);
                getReport(id);
            }
        }
    };

    if (isLoading) {
        return <PageLoader pagename="report details" />;
    }

    if (error || !selectedReport) {
        return (
            <RetryPage
                message="Failed to load report details"
                btnName="Retry"
                onRetry={() => id && getReport(id)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/reports')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Report Details</h1>
                        <p className="text-sm text-muted-foreground">Report #{selectedReport.id}</p>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                        disabled={isUpdating}
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <p className="text-sm font-medium">{selectedReport.reason || 'N/A'}</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                {isEditing ? (
                                    <Select
                                        value={editData.status}
                                        onValueChange={(value) => setEditData({ ...editData, status: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    getStatusBadge(selectedReport.status)
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Severity</Label>
                                {isEditing ? (
                                    <Select
                                        value={editData.severity}
                                        onValueChange={(value) => setEditData({ ...editData, severity: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    getSeverityBadge(selectedReport.severity)
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <div className="flex flex-col gap-2">
                                <Badge variant="outline" className="w-fit">
                                    {getCategoryDisplayName(selectedReport.category)}
                                </Badge>
                                {selectedReport.subCategory && (
                                    <Badge variant="outline" className="w-fit bg-blue-50">
                                        {selectedReport.subCategory.name || 'Sub-category'}
                                    </Badge>
                                )}
                                {getParentCategoryDisplayName(selectedReport.category) && (
                                    <p className="text-sm text-muted-foreground">
                                        Parent: {getParentCategoryDisplayName(selectedReport.category)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {selectedReport.reportType && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Report Type</Label>
                                    <Badge variant="outline">
                                        {formatReportType(selectedReport.reportType)}
                                    </Badge>
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <Label>Assigned To</Label>
                            {isEditing ? (
                                <Input
                                    value={editData.assignedTo || ''}
                                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                                    placeholder="Enter email or identifier"
                                />
                            ) : (
                                <p className="text-sm">{selectedReport.assignedTo || 'Unassigned'}</p>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Dates</Label>
                            <div className="space-y-1 text-sm">
                                {selectedReport.reportedAt && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Reported: {formatDate(selectedReport.reportedAt)}</span>
                                    </div>
                                )}
                                {selectedReport.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Created: {formatDate(selectedReport.createdAt)}</span>
                                    </div>
                                )}
                                {selectedReport.updatedAt && selectedReport.updatedAt !== selectedReport.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Updated: {formatDate(selectedReport.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - User Information & Description */}
                <div className="space-y-6">
                    {/* Reporter Information */}
                    {hasReporterInfo(selectedReport) ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Reporter Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{getReportUserName(selectedReport.reporter)}</span>
                                </div>
                                {selectedReport.reporter?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{selectedReport.reporter.email}</span>
                                    </div>
                                )}
                                {selectedReport.reporter?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {selectedReport.reporter.countryCode} {selectedReport.reporter.phone}
                                        </span>
                                    </div>
                                )}
                                {selectedReport.reportedByIp && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">IP: {selectedReport.reportedByIp}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : selectedReport.reportedBy && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Reporter
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{selectedReport.reportedBy}</p>
                                {selectedReport.reportedByIp && (
                                    <p className="text-xs text-muted-foreground mt-1">IP: {selectedReport.reportedByIp}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Reported User Information */}
                    {hasReportedUserInfo(selectedReport) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Reported User Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{getReportUserName(selectedReport.reported)}</span>
                                </div>
                                {selectedReport.reported?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{selectedReport.reported.email}</span>
                                    </div>
                                )}
                                {selectedReport.reported?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {selectedReport.reported.countryCode} {selectedReport.reported.phone}
                                        </span>
                                    </div>
                                )}
                                {selectedReport.reported?.accountStatus !== null && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            Account Status: {selectedReport.reported.accountStatus}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Description */}
                    {selectedReport.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing ? (
                                <Textarea
                                    value={editData.notes || ''}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                    placeholder="Add internal notes..."
                                    rows={6}
                                />
                            ) : selectedReport.notes ? (
                                <p className="text-sm whitespace-pre-wrap">{selectedReport.notes}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No notes added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-brand-green hover:bg-brand-green/90 text-white"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ReportDetailsPage;
