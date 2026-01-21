import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Loader2, MoreVertical, Trash2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Report } from "@/api/services/reportService";

interface ListOptionDropdownProps {
    report: Report;
    isUpdating: boolean;
    optionChangeHandler: (reportId: string, action: string) => void;
    openDeleteDialog: (report: Report) => void;
}

const ListOptionDropdown = (props: ListOptionDropdownProps) => {
    const {
        report,
        isUpdating,
        optionChangeHandler,
        openDeleteDialog,
    } = props;

    return (
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
                {report.status !== 'new' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-new");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as New
                    </DropdownMenuItem>
                )}
                {report.status !== 'pending' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-pending");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Clock className="h-4 w-4 mr-2" />
                        )}
                        Mark as Pending
                    </DropdownMenuItem>
                )}
                {report.status !== 'in-progress' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-in-progress");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Clock className="h-4 w-4 mr-2" />
                        )}
                        Mark as In Progress
                    </DropdownMenuItem>
                )}
                {report.status !== 'reviewed' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-reviewed");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Reviewed
                    </DropdownMenuItem>
                )}
                {report.status !== 'resolved' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-resolved");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Resolved
                    </DropdownMenuItem>
                )}
                {report.status !== 'closed' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-closed");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Close Report
                    </DropdownMenuItem>
                )}
                {report.status !== 'dismissed' && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            optionChangeHandler(report.id, "status-dismissed");
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Dismiss Report
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(report);
                    }}
                    disabled={isUpdating}
                    className="text-destructive"
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export default ListOptionDropdown;