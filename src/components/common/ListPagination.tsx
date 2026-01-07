import React from "react";
import { Button } from "@/components/ui/button";

const ListPagination = (props) => {
    const {
        pagination,
        isLoading,
        handlePageChange,
    } = props;


    return (
        <div className="flex-shrink-0 pt-4 border-t">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} reports
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1 || isLoading}
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
                        disabled={pagination.page >= pagination.totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default ListPagination;