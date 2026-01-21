import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, FileText, User } from "lucide-react";
import ListOptionDropdown from "./ListOptionDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListPagination from "./ListPagination";
import { Report } from "@/api/services/reportService";
import { getReportUserName, getCategoryDisplayName, getParentCategoryDisplayName } from "@/lib/reportUtils";

interface ReportListProps {
    isLoading: boolean;
    reports: Report[];
    filterValues: {
        status?: string;
        category?: string;
        severity?: string;
        searchTerm?: string;
    };
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    isUpdating: boolean;
    getStatusBadge: (status: string) => React.ReactNode;
    getSeverityBadge: (severity: string) => React.ReactNode;
    formatDate: (dateString: string) => string;
    optionChangeHandler: (reportId: string, action: string) => void;
    handlePageChange: (page: number) => void;
    handleSelectedReport: (report: Report) => void;
    openDeleteDialog: (report: Report) => void;
    selectedReportId?: string;
}

const ReportList = (props: ReportListProps) => {
    const {
        isLoading,
        reports,
        filterValues,
        pagination,
        isUpdating,
        getStatusBadge,
        getSeverityBadge,
        formatDate,
        optionChangeHandler,
        handlePageChange,
        handleSelectedReport,
        openDeleteDialog,
        selectedReportId,
    } = props;


    return (
        <div className="lg:col-span-2 flex flex-col" style={{ height: '100%', minHeight: 0 }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 flex flex-col"
                style={{ height: '100%', minHeight: 0 }}
            >
                <Card className="flex-1 flex flex-col" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <CardHeader className="flex-shrink-0 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Reports ({pagination.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col" style={{ minHeight: 0, overflow: 'hidden', padding: '1rem' }}>
                        {/* Report Loading Screen */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Loading reports...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ minHeight: 0, maxHeight: '100%' }}>
                                    {/* Report List Screen */}
                                    {reports.map((report, index) => (
                                            <motion.div
                                                key={report?.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedReportId === report.id
                                                        ? "bg-sidebar-accent border-brand-green"
                                                        : "hover:bg-sidebar-accent"
                                                }`}
                                                style={{ minHeight: '110px', flexShrink: 0 }}
                                                onClick={() => handleSelectedReport(report)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h3 className="font-medium truncate">
                                                                {report.reason || `Report #${report.id}`}
                                                            </h3>
                                                            {getStatusBadge(report.status)}
                                                            {getSeverityBadge(report.severity || 'medium')}
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {getCategoryDisplayName(report.category)}
                                                                </Badge>
                                                                {report.subCategory && (
                                                                    <Badge variant="outline" className="text-xs bg-blue-50">
                                                                        {report.subCategory.name || 'Sub-category'}
                                                                    </Badge>
                                                                )}
                                                                {getParentCategoryDisplayName(report.category) && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ({getParentCategoryDisplayName(report.category)})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                {report.reporter && (
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="h-3 w-3" />
                                                                        <span>Reporter: {getReportUserName(report.reporter)}</span>
                                                                    </div>
                                                                )}
                                                                {report.reported && (
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="h-3 w-3" />
                                                                        <span>Reported: {getReportUserName(report.reported)}</span>
                                                                    </div>
                                                                )}
                                                                {!report.reporter && report.reportedBy && (
                                                                    <span>By: {report.reportedBy}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(report.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Report List Options */}
                                                    <ListOptionDropdown
                                                        report={report}
                                                        isUpdating={isUpdating}
                                                        optionChangeHandler={optionChangeHandler}
                                                        openDeleteDialog={openDeleteDialog}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Empty Report List Section */}
                                        {reports.length === 0 && !isLoading && (
                                            <div className="text-center py-8">
                                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium mb-2">
                                                    No Reports Found
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {filterValues?.searchTerm ||
                                                        filterValues?.status !== "all" ||
                                                        filterValues?.category !== "all" ||
                                                        filterValues?.severity !== "all"
                                                        ? "Try adjusting your search or filters."
                                                        : "No reports have been submitted yet."}
                                                </p>
                                            </div>
                                    )}
                                </div>
                                
                                {/* Pagination Section*/}
                                {pagination.totalPages > 1 && (
                                    <div className="flex-shrink-0 pt-4 border-t mt-4">
                                        <ListPagination
                                            pagination={pagination}
                                            isLoading={isLoading}
                                            handlePageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ReportList;