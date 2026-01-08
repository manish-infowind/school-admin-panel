import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { mockEnquiries } from "@/api/mockData";
import { Calendar, Loader2, Mail, Star } from "lucide-react";
import ListOptionDropdown from "./ListOptionDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListPagination from "./ListPagination";

const ReportList = (props) => {
    const {
        isLoading,
        filterValues,
        pagination,
        isUpdating,
        getStatusBadge,
        formatDate,
        optionChangeHandler,
        handlePageChange,
        handleSelectedReport,
        openDeleteDialog,
    } = props;


    return (
        <div className="lg:col-span-2 flex flex-col">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 flex flex-col"
            >
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            {/* Reports ({pagination.total}) */}
                            Reports ({mockEnquiries.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Report Loading Screen */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Loading reports...</span>
                                </div>
                            ) : (<>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {/* Report List Screen */}
                                    {mockEnquiries.map((reports, index) => (
                                        <motion.div
                                            key={reports?.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${false //selectedEnquiry?.id === reports.id
                                                ? "bg-sidebar-accent border-brand-green"
                                                : "hover:bg-sidebar-accent"
                                                }`}
                                            onClick={() => handleSelectedReport(reports)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium truncate">
                                                            {reports.fullName}
                                                        </h3>
                                                        {reports.isStarred && (
                                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                        )}
                                                        {getStatusBadge(reports.status)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {reports.email}
                                                    </p>
                                                    <p className="text-sm font-medium truncate mt-1">
                                                        {reports.subject}
                                                    </p>

                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(reports.createdAt)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {reports.inquiryCategory}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Report List Options */}
                                                <ListOptionDropdown
                                                    reports={reports}
                                                    isUpdating={isUpdating}
                                                    optionChangeHandler={optionChangeHandler}
                                                    openDeleteDialog={openDeleteDialog}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Empty Report List Section */}
                                    {mockEnquiries.length === 0 && !isLoading && (
                                        <div className="text-center py-8">
                                            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium mb-2">
                                                No Report Found
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {filterValues?.searchTerm ||
                                                    filterValues?.status !== "all" ||
                                                    filterValues?.category !== "all"
                                                    ? "Try adjusting your search or filters."
                                                    : "No report have been submitted yet."}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Section*/}
                                {pagination.totalPages > 1 && (
                                    <ListPagination
                                        pagination={pagination}
                                        isLoading={isLoading}
                                        handlePageChange={handlePageChange}
                                    />
                                )}
                            </>)}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ReportList;