import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Eye, Edit, FileText } from "lucide-react";
import ListPagination from "./ListPagination";

interface Report {
  id: string;
  category: {
    name: string;
    parent?: string;
  };
  severity: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface ReportListTableProps {
  isLoading: boolean;
  reports: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  handlePageChange: (page: number) => void;
  filterValues?: {
    status?: string;
    category?: string;
    searchTerm?: string;
  };
}

const ReportListTable: React.FC<ReportListTableProps> = ({
  isLoading,
  reports,
  pagination,
  getStatusBadge,
  formatDate,
  onView,
  onEdit,
  handlePageChange,
  filterValues,
}) => {
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

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reports ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading reports...</span>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-[120px]">Severity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center">
                              <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                              <p className="font-medium">No reports found</p>
                              <p className="text-sm mt-1">
                                {filterValues?.searchTerm || filterValues?.status !== "all" || filterValues?.category !== "all"
                                  ? "Try adjusting your search or filters."
                                  : "No reports have been submitted yet."}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report, index) => (
                          <TableRow
                            key={report.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{report.category.name}</span>
                                {report.category.parent && (
                                  <span className="text-xs text-muted-foreground">
                                    Parent: {report.category.parent}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                            <TableCell>
                              <div className="max-w-[300px] truncate" title={report.reason}>
                                {report.reason}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(report.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onView(report)}
                                  className="h-8"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onEdit(report)}
                                  className="h-8"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Section */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex-shrink-0">
                  <ListPagination
                    pagination={pagination}
                    isLoading={isLoading}
                    handlePageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportListTable;
