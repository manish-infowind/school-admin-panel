import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import ActiveFilterBar from "@/components/common/ActiveFilterBar";
import ReportListTable from "@/components/common/ReportListTable";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { useReports } from "@/api/hooks/useReports";
import { Report } from "@/api/services/reportService";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

const Report = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [showActiveFilter, setShowActiveFilter] = useState(false);
    const [filterValues, setFilterValues] = useState({
        status: "all",
        category: "all",
        severity: "all",
        parentCategory: "all",
        sortOrder: "desc",
        searchTerm: "",
    });
    const [dateRange, setDateRange] = useState<{
        startDate: Date | undefined;
        endDate: Date | undefined;
    }>({
        startDate: undefined,
        endDate: undefined
    });
    const [deleteItemType, setDeleteItemType] = useState(false);
    const [deleteReport, setDeleteReport] = useState<Report | null>(null);

    const {
        reports,
        pagination,
        isLoading,
        isUpdating,
        isDeleting,
        fetchReports,
        updateReport,
        deleteReport: deleteReportApi,
        exportReports,
    } = useReports({ autoFetch: false });

    // Initial fetch - only on mount
    useEffect(() => {
        fetchReports({
            page: 1,
            limit: 20, // Show more rows by default
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch reports when filters change (debounced for search)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReports({
                page: 1,
                limit: pagination.limit || 10,
                search: filterValues.searchTerm || undefined,
                status: filterValues.status !== "all" ? filterValues.status as any : undefined,
                severity: filterValues.severity !== "all" ? filterValues.severity as any : undefined,
                category: filterValues.category !== "all" ? filterValues.category : undefined,
                parentCategory: filterValues.parentCategory !== "all" ? filterValues.parentCategory : undefined,
                startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
                endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined,
                sortBy: 'createdAt',
                sortOrder: filterValues.sortOrder as 'asc' | 'desc',
            });
        }, filterValues.searchTerm ? 500 : 0); // Debounce search by 500ms

        return () => clearTimeout(timeoutId);
    }, [filterValues, dateRange, pagination.limit, fetchReports]);

    // Status Badge section
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
            <Badge
                variant={config.variant}
                className={config.className}
            >
                {config.label}
            </Badge>
        );
    };

    // Severity Badge section
    const getSeverityBadge = (severity: string) => {
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

    // Format Date section
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Clear date filters
    const clearDateFilters = useCallback(() => {
        setDateRange({
            startDate: undefined,
            endDate: undefined
        });
    }, []);

    // Handle date range changes
    const handleDateRangeChange = useCallback((from: Date | undefined, to: Date | undefined) => {
        setDateRange({
            startDate: from,
            endDate: to
        });
    }, []);

    // Clear Active Filter
    const clearAllFilters = useCallback(() => {
        setShowActiveFilter(false);
        setDateRange({ startDate: undefined, endDate: undefined });
        setFilterValues({
            status: "all",
            category: "all",
            severity: "all",
            parentCategory: "all",
            sortOrder: "desc",
            searchTerm: "",
        });
    }, []);

    // Active Filter Select-Tab Handler
    const activeFilterHandler = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShowActiveFilter(true);
        setFilterValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Report List Options change handler
    const optionChangeHandler = useCallback(async (reportId: string, action: string) => {
        let statusUpdate: any = null;
        
        if (action === "status-new") {
            statusUpdate = { status: 'new' };
        } else if (action === "status-pending") {
            statusUpdate = { status: 'pending' };
        } else if (action === "status-in-progress") {
            statusUpdate = { status: 'in-progress' };
        } else if (action === "status-reviewed") {
            statusUpdate = { status: 'reviewed' };
        } else if (action === "status-resolved") {
            statusUpdate = { status: 'resolved' };
        } else if (action === "status-closed") {
            statusUpdate = { status: 'closed' };
        } else if (action === "status-dismissed") {
            statusUpdate = { status: 'dismissed' };
        }
        
        if (statusUpdate) {
            await updateReport(reportId, statusUpdate);
            // Refresh the list after status change
            fetchReports({
                page: pagination.page,
                limit: pagination.limit,
                search: filterValues.searchTerm || undefined,
                status: filterValues.status !== "all" ? filterValues.status as any : undefined,
                severity: filterValues.severity !== "all" ? filterValues.severity as any : undefined,
                category: filterValues.category !== "all" ? filterValues.category : undefined,
                parentCategory: filterValues.parentCategory !== "all" ? filterValues.parentCategory : undefined,
                startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
                endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined,
                sortBy: 'createdAt',
                sortOrder: filterValues.sortOrder as 'asc' | 'desc',
            });
        }
    }, [updateReport, filterValues, dateRange, pagination, fetchReports]);

    // Page Change Handler
    const handlePageChange = useCallback((page: number) => {
        fetchReports({
            page,
            limit: pagination.limit,
            search: filterValues.searchTerm || undefined,
            status: filterValues.status !== "all" ? filterValues.status as any : undefined,
            severity: filterValues.severity !== "all" ? filterValues.severity as any : undefined,
            category: filterValues.category !== "all" ? filterValues.category : undefined,
            parentCategory: filterValues.parentCategory !== "all" ? filterValues.parentCategory : undefined,
            startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
            endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined,
            sortBy: 'createdAt',
            sortOrder: filterValues.sortOrder as 'asc' | 'desc',
        });
    }, [filterValues, dateRange, pagination.limit, fetchReports]);

    // View report - navigate to details page
    const handleViewReport = useCallback((report: Report) => {
        navigate(`/admin/reports/${report.id}`);
    }, [navigate]);

    // Delete Report handlers
    const openDeleteDialog = useCallback((report: Report) => {
        setDeleteReport(report);
        setDeleteItemType(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setDeleteReport(null);
        setDeleteItemType(false);
    }, []);

    // Delete Report Handler
    const handleDeleteReport = useCallback(async () => {
        if (deleteReport) {
            const success = await deleteReportApi(deleteReport.id);
            if (success) {
                closeDeleteDialog();
                // Refresh the list after deletion
                fetchReports({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: filterValues.searchTerm || undefined,
                    status: filterValues.status !== "all" ? filterValues.status as any : undefined,
                    severity: filterValues.severity !== "all" ? filterValues.severity as any : undefined,
                    category: filterValues.category !== "all" ? filterValues.category : undefined,
                    parentCategory: filterValues.parentCategory !== "all" ? filterValues.parentCategory : undefined,
                    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
                    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined,
                    sortBy: 'createdAt',
                    sortOrder: filterValues.sortOrder as 'asc' | 'desc',
                });
            }
        }
    }, [deleteReport, deleteReportApi, closeDeleteDialog, filterValues, dateRange, pagination, fetchReports]);

    // Export reports
    const handleExportReports = useCallback(async () => {
        await exportReports({
            search: filterValues.searchTerm || undefined,
            status: filterValues.status !== "all" ? filterValues.status as any : undefined,
            severity: filterValues.severity !== "all" ? filterValues.severity as any : undefined,
            category: filterValues.category !== "all" ? filterValues.category : undefined,
            parentCategory: filterValues.parentCategory !== "all" ? filterValues.parentCategory : undefined,
            startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined,
            endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined,
        });
    }, [filterValues, dateRange, exportReports]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    page="report"
                    heading="Report Management"
                    subHeading="Manage and track system reports with categories, severity levels, and status tracking"
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportReports}
                        disabled={isLoading}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Active Quick Filter Section */}
            <ActiveFilterBar
                showActiveFilter={showActiveFilter}
                filterValues={filterValues}
                dateRange={dateRange}
                clearAllFilters={clearAllFilters}
                activeFilterHandler={activeFilterHandler}
                clearDateFilters={clearDateFilters}
                handleDateRangeChange={handleDateRangeChange}
            />

            {/* Reports Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <ReportListTable
                    isLoading={isLoading}
                    reports={reports}
                    filterValues={filterValues}
                    pagination={pagination}
                    isUpdating={isUpdating}
                    getStatusBadge={getStatusBadge}
                    getSeverityBadge={getSeverityBadge}
                    formatDate={formatDate}
                    onView={handleViewReport}
                    onStatusChange={optionChangeHandler}
                    onDelete={openDeleteDialog}
                    handlePageChange={handlePageChange}
                />
            </motion.div>

            {/* Delete Report Modal */}
            <DeleteConfirmationModal
                isOpen={deleteItemType}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteReport}
                title="Delete Report"
                message="Are you sure you want to delete this report? This action cannot be undone. The report will be permanently removed."
                itemName={deleteReport ? `Report #${deleteReport.id}` : ''}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Report;
