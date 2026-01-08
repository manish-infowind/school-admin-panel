import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Loader2, MoreVertical, Star, Trash2, XCircle } from "lucide-react";


const ListOptionDropdown = (props) => {
    const {
        reports,
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
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        optionChangeHandler(reports?.id, "star");
                    }}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Star className="h-4 w-4 mr-2" />
                    )}
                    {reports?.isStarred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        optionChangeHandler(reports?.id, "replied");
                    }}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Replied
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        optionChangeHandler(reports?.id, "closed");
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
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(reports);
                        // optionChangeHandler(reports?.id, "delete");
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