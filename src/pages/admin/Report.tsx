import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import PageHeader from "@/components/common/PageHeader";
import ActiveFilterBar from "@/components/common/ActiveFilterBar";
import ReportList from "@/components/common/ReportList";
import ReportDetails from "@/components/common/ReportDetails";
import { mockEnquiries } from "@/api/mockData";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";


const Report = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const isFetchingRef = useRef(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [showActiveFilter, setShowActiveFilter] = useState(false);
    const [filterValues, setFilterValues] = useState({
        status: "all",
        category: "all",
        sortOrder: "desc",
        searchTerm: "",
    });
    const [dateRange, setDateRange] = useState({
        startDate: undefined,
        endDate: undefined
    });
    const [selectedReportData, setSelectedReportData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [deleteItemType, setDeleteItemType] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);


    // Clear date filters
    const clearDateFilters = () => {
        setDateRange({
            startDate: undefined,
            endDate: undefined
        });
        const params = {
            page: 1,
            search: filterValues?.searchTerm || undefined,
            status: filterValues?.status !== "all" ? filterValues?.status : undefined,
            category: filterValues?.category !== "all" ? filterValues?.category : undefined,
            sortOrder: filterValues?.sortOrder,
        };
        fetchReports(params);
    };

    // Handle date range changes
    const handleDateRangeChange = useCallback((from: Date | undefined, to: Date | undefined) => {
        setDateRange({
            startDate: from,
            endDate: to
        });
        const params = {
            page: 1,
            search: filterValues?.searchTerm || undefined,
            status: filterValues?.status !== "all" ? filterValues?.status : undefined,
            category: filterValues?.category !== "all" ? filterValues?.category : undefined,
            sortOrder: filterValues?.sortOrder,
            startDate: from ? format(from, 'yyyy-MM-dd') : undefined,
            endDate: to ? format(to, 'yyyy-MM-dd') : undefined,
        };
        fetchReports(params);
    }, [dateRange]);


    // Fetch enquiries
    const fetchReports = useCallback(async (params) => {
        if (isFetchingRef.current) {
            return;
        };
        try {
            isFetchingRef.current = true;
            setIsLoading(true);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enquiries';
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [toast]);

    // Status Badge section
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            new: { variant: "destructive" as const, label: "New" },
            "in-progress": { variant: "secondary" as const, label: "In Progress" },
            replied: { variant: "default" as const, label: "Replied" },
            closed: { variant: "outline" as const, label: "Closed" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <Badge
                variant={config.variant}
                className={
                    config.variant === "default"
                        ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                        : ""
                }
            >
                {config.label}
            </Badge>
        );
    };

    // Format Date section
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Clear Active Filter
    const clearAllFilters = useCallback(() => {
        setShowActiveFilter(false);
        setFilterValues({
            status: "all",
            category: "all",
            sortOrder: "desc",
            searchTerm: "",
        });
    }, []);

    // Active Filter Select-Tab Handler
    const activeFilterHandler = useCallback((e) => {
        const { name, value } = e.target;
        setShowActiveFilter(true);
        setFilterValues({
            ...filterValues,
            [name]: value
        });
    }, [filterValues]);

    // Report List Options change handler
    const optionChangeHandler = useCallback(async (reportId, textType) => {
        const report = mockEnquiries.find((e) => e.id === reportId)
        console.log('optionChangeHandler_ooo', report);
        
        if (report) {
            const success = true;
            if (success) {
                toast({
                    title: "Star Updated",
                    description: `Enquiry ${report.isStarred ? "unstarred" : "starred"}.`,
                });
            }
        };
    }, []);

    // Page Change Handler
    const handlePageChange = useCallback(() => {
        console.log("handlePageChange");
    }, []);

    const handleSelectedReport = useCallback((reports) => {
        console.log("handleEnquirySelect", reports);
        setSelectedReportData(reports);
    }, []);

    // Open Reply Modal Box
    const openReplyBoxHandler = useCallback(() => {
        setIsReplyDialogOpen(true);
    }, []);

    // Close Reply Modal Box
    const closeReplyBoxHandler = useCallback(() => {
        setIsReplyDialogOpen(false);
    }, []);

    // Save Reply section
    const handleReply = useCallback((replyMessage) => {
        setIsReplyDialogOpen(false);
    }, []);

    // Close Delete Report Section Handler
    const openDeleteDialog = useCallback((user) => {
        setDeleteUser(user);
        setDeleteItemType(true);
    }, [])

    // Close Delete Report Section Handler
    const closeDeleteDialog = useCallback(() => {
        setDeleteUser(null);
        setDeleteItemType(false);
    }, []);

    // Delete Report Section Handler
    const handleDeleteUser = useCallback(() => {
        setDeleteItemType(false);
        console.log("deleteUser", deleteUser);
    }, []);


    return (
        <div className="space-y-6">
            <PageHeader
                page="report"
                heading="Report Management"
                subHeading="Manage and respond to customer enquiries and contact form submissions"
            />

            {/* Active Quick Filter Section whole CARD section */}
            <ActiveFilterBar
                showActiveFilter={showActiveFilter}
                filterValues={filterValues}
                dateRange={dateRange}
                clearAllFilters={clearAllFilters}
                activeFilterHandler={activeFilterHandler}
                clearDateFilters={clearDateFilters}
                handleDateRangeChange={handleDateRangeChange}
            />


            <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
                {/* Enquiries List */}
                <ReportList
                    isLoading={isLoading}
                    filterValues={filterValues}
                    pagination={pagination}
                    isUpdating={isUpdating}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    optionChangeHandler={optionChangeHandler}
                    handlePageChange={handlePageChange}
                    handleSelectedReport={handleSelectedReport}
                    openDeleteDialog={openDeleteDialog}
                />

                {/* Enquiry Details */}
                <ReportDetails
                    isUpdating={isUpdating}
                    isReplyDialogOpen={isReplyDialogOpen}
                    selectedReportData={selectedReportData}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    openReplyBoxHandler={openReplyBoxHandler}
                    closeReplyBoxHandler={closeReplyBoxHandler}
                    handleReply={handleReply}
                    optionChangeHandler={optionChangeHandler}
                />

                {/* Delete Report Modal */}
                <DeleteConfirmationModal
                    isOpen={deleteItemType}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDeleteUser}
                    title="Delete Report"
                    message="Are you sure you want to delete this Report? This action cannot be undone. The enquiry from John Doe will be permanently removed."
                    itemName={deleteUser ? `${deleteUser.fullName}` : ''}
                    isLoading={isUpdating}
                />
            </div>
        </div >
    )
};

export default Report;