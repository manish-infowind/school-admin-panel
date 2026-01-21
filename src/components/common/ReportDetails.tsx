import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Eye, Loader2, FileText, User, AlertTriangle, Edit2, Save, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Report, UpdateReportRequest } from "@/api/services/reportService";
import { 
    getReportUserName, 
    getCategoryDisplayName, 
    getParentCategoryDisplayName,
    formatReportType,
    hasReporterInfo,
    hasReportedUserInfo
} from "@/lib/reportUtils";

interface ReportDetailsProps {
    isUpdating: boolean;
    selectedReport: Report | null;
    getStatusBadge: (status: string) => React.ReactNode;
    getSeverityBadge: (severity: string) => React.ReactNode;
    formatDate: (dateString: string) => string;
    updateReport: (id: string, data: UpdateReportRequest) => Promise<boolean>;
    fetchReports: () => void;
}

const ReportDetails = (props: ReportDetailsProps) => {
    const {
        isUpdating,
        selectedReport,
        getStatusBadge,
        getSeverityBadge,
        formatDate,
        updateReport,
        fetchReports,
    } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateReportRequest>({
        status: undefined,
        assignedTo: undefined,
        notes: undefined,
        severity: undefined,
    });

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
        if (selectedReport) {
            const updateData: UpdateReportRequest = {};
            if (editData.status) updateData.status = editData.status;
            if (editData.assignedTo !== undefined) updateData.assignedTo = editData.assignedTo || null;
            if (editData.notes !== undefined) updateData.notes = editData.notes || null;
            if (editData.severity) updateData.severity = editData.severity;

            const success = await updateReport(selectedReport.id, updateData);
            if (success) {
                setIsEditing(false);
                fetchReports();
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
        >
            <Card className="flex-1 flex flex-col h-full min-h-0">
                <CardHeader className="flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Report Details
                        </CardTitle>
                        {selectedReport && !isEditing && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                disabled={isUpdating}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent 
                    className="flex-1 min-h-0 p-6"
                    style={{ 
                        maxHeight: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {selectedReport ? (
                        <div className="space-y-6 pr-2">
                            {/* Report ID and Basic Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-brand-green" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            Report #{selectedReport.id}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedReport.reason}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status:</span>
                                        {isEditing ? (
                                            <Select
                                                value={editData.status}
                                                onValueChange={(value) => setEditData({ ...editData, status: value as any })}
                                            >
                                                <SelectTrigger className="w-[180px]">
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Severity:</span>
                                        {isEditing ? (
                                            <Select
                                                value={editData.severity}
                                                onValueChange={(value) => setEditData({ ...editData, severity: value as any })}
                                            >
                                                <SelectTrigger className="w-[180px]">
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
                                            getSeverityBadge(selectedReport.severity || 'medium')
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Category:</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="capitalize">
                                                {getCategoryDisplayName(selectedReport.category)}
                                            </Badge>
                                            {selectedReport.subCategory && (
                                                <Badge variant="outline" className="capitalize bg-blue-50">
                                                    {selectedReport.subCategory.name || 'Sub-category'}
                                                </Badge>
                                            )}
                                            {getParentCategoryDisplayName(selectedReport.category) && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({getParentCategoryDisplayName(selectedReport.category)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedReport.reportType && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Report Type:</span>
                                            <Badge variant="outline" className="capitalize">
                                                {formatReportType(selectedReport.reportType)}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Reporter Information */}
                                {hasReporterInfo(selectedReport) ? (
                                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-900">Reporter Information</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">{getReportUserName(selectedReport.reporter)}</span>
                                            </div>
                                            {selectedReport.reporter?.email && (
                                                <p className="text-muted-foreground">Email: {selectedReport.reporter.email}</p>
                                            )}
                                            {selectedReport.reporter?.phone && (
                                                <p className="text-muted-foreground">Phone: {selectedReport.reporter.countryCode} {selectedReport.reporter.phone}</p>
                                            )}
                                            {selectedReport.reportedByIp && (
                                                <p className="text-xs text-muted-foreground">IP: {selectedReport.reportedByIp}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : selectedReport.reportedBy && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Reported by: {selectedReport.reportedBy}
                                        </span>
                                        {selectedReport.reportedByIp && (
                                            <span className="text-xs text-muted-foreground">(IP: {selectedReport.reportedByIp})</span>
                                        )}
                                    </div>
                                )}

                                {/* Reported User Information */}
                                {hasReportedUserInfo(selectedReport) && (
                                    <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-red-900">Reported User Information</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-red-600" />
                                                <span className="font-medium">{getReportUserName(selectedReport.reported)}</span>
                                            </div>
                                            {selectedReport.reported?.email && (
                                                <p className="text-muted-foreground">Email: {selectedReport.reported.email}</p>
                                            )}
                                            {selectedReport.reported?.phone && (
                                                <p className="text-muted-foreground">Phone: {selectedReport.reported.countryCode} {selectedReport.reported.phone}</p>
                                            )}
                                            {selectedReport.reported?.accountStatus !== null && (
                                                <p className="text-muted-foreground">Account Status: {selectedReport.reported.accountStatus}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedReport.assignedTo && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Assigned to: {selectedReport.assignedTo}
                                        </span>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-2">
                                        <Label htmlFor="assignedTo">Assigned To</Label>
                                        <Input
                                            id="assignedTo"
                                            value={editData.assignedTo || ''}
                                            onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                                            placeholder="Enter email or identifier"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {selectedReport.reportedAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                Reported {formatDate(selectedReport.reportedAt)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedReport.createdAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                Created {formatDate(selectedReport.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedReport.updatedAt && selectedReport.updatedAt !== selectedReport.createdAt && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                Updated {formatDate(selectedReport.updatedAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {selectedReport.description && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Description</h4>
                                    <div className="bg-muted p-3 rounded-lg">
                                        <p className="text-sm whitespace-pre-wrap">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Notes</h4>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editData.notes || ''}
                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                            placeholder="Add internal notes..."
                                            rows={4}
                                        />
                                    </div>
                                ) : selectedReport.notes ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm whitespace-pre-wrap text-gray-800">
                                            {selectedReport.notes}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-sm text-gray-500">No notes yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Add notes to track progress on this report</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isUpdating}
                                        className="flex-1"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isUpdating}
                                        className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
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
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                No Report Selected
                            </h3>
                            <p className="text-muted-foreground">
                                Select a report from the list to view details and manage it.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReportDetails;
