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
import { Loader2, Eye, Edit, FileText, MoreVertical, Trash2 } from "lucide-react";
import ListPagination from "./ListPagination";
import { Report } from "@/api/services/reportService";
import { getCategoryDisplayName, getParentCategoryDisplayName, getReportUserName } from "@/lib/reportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  getSeverityBadge: (severity: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
  onView: (report: Report) => void;
  onEdit?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onStatusChange?: (reportId: string, action: string) => void;
  handlePageChange: (page: number) => void;
  isUpdating?: boolean;
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
  getSeverityBadge,
  formatDate,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  handlePageChange,
  isUpdating = false,
  filterValues,
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reports ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading reports...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[100px]">Severity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-[120px]">Reporter</TableHead>
                    <TableHead className="w-[120px]">Reported</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
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
                    reports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">#{report.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{getCategoryDisplayName(report.category)}</span>
                            {report.subCategory && (
                              <Badge variant="outline" className="w-fit mt-1 text-xs">
                                {report.subCategory.name}
                              </Badge>
                            )}
                            {getParentCategoryDisplayName(report.category) && (
                              <span className="text-xs text-muted-foreground">
                                {getParentCategoryDisplayName(report.category)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getSeverityBadge(report.severity || 'medium')}</TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate" title={report.reason || ''}>
                            {report.reason || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {report.reporter ? getReportUserName(report.reporter) : report.reportedBy || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {report.reported ? getReportUserName(report.reported) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.createdAt ? formatDate(report.createdAt) : 'N/A'}
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
                            {(onEdit || onDelete || onStatusChange) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(report)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {onStatusChange && (
                                    <>
                                      {report.status !== 'new' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(report.id, 'status-new')}>
                                          Mark as New
                                        </DropdownMenuItem>
                                      )}
                                      {report.status !== 'in-progress' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(report.id, 'status-in-progress')}>
                                          Mark as In Progress
                                        </DropdownMenuItem>
                                      )}
                                      {report.status !== 'resolved' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(report.id, 'status-resolved')}>
                                          Mark as Resolved
                                        </DropdownMenuItem>
                                      )}
                                      {report.status !== 'closed' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(report.id, 'status-closed')}>
                                          Close Report
                                        </DropdownMenuItem>
                                      )}
                                    </>
                                  )}
                                  {onDelete && (
                                    <DropdownMenuItem 
                                      onClick={() => onDelete(report)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Section */}
            {pagination.totalPages > 1 && (
              <div className="mt-4">
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
  );
};

export default ReportListTable;
