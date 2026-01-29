import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PageHeader from "@/components/common/PageHeader";
import { useActivityLogs, useAdminUsers } from "@/api/hooks/useActivityLogs";
import { ActivityLogQueryParams, HttpMethod, ActivityType } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import PageLoader from "@/components/common/PageLoader";
import RetryPage from "@/components/common/RetryPage";
import PaginationControls from "@/components/ui/paginationComp";

const ActivityLogs = () => {

  // Filters
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [adminIdFilter, setAdminIdFilter] = useState<string>("all");
  const [httpMethodFilter, setHttpMethodFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"timestamp" | "admin_id">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch admin users for dropdown
  const { users: adminUsers, isLoading: isLoadingAdminUsers } = useAdminUsers();

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setCurrentPage(1); // Reset to first page when search changes
    }, searchText ? 500 : 0);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const pageSizeOptions = [10, 20, 50, 100];

  // UI States
  const [showActiveFilter, setShowActiveFilter] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Build query params
  const queryParams = useMemo<ActivityLogQueryParams>(() => {
    const params: ActivityLogQueryParams = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };

    if (adminIdFilter && adminIdFilter !== "all") params.adminId = adminIdFilter;
    if (httpMethodFilter && httpMethodFilter !== "all") params.httpMethod = httpMethodFilter as HttpMethod;
    if (debouncedSearchText.trim()) params.search = debouncedSearchText.trim();
    if (startDate) {
      // Set to start of day in UTC
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      params.startDate = start.toISOString();
    }
    if (endDate) {
      // Set to end of day in UTC
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      params.endDate = end.toISOString();
    }

    return params;
  }, [currentPage, pageSize, adminIdFilter, httpMethodFilter, debouncedSearchText, startDate, endDate, sortBy, sortOrder]);

  // Fetch activity logs
  const { logs, pagination, isLoading, error, refetch } = useActivityLogs(queryParams);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      (adminIdFilter && adminIdFilter !== "all") ||
      (httpMethodFilter && httpMethodFilter !== "all") ||
      startDate ||
      endDate ||
      debouncedSearchText.trim()
    );
  }, [adminIdFilter, httpMethodFilter, startDate, endDate, debouncedSearchText]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setAdminIdFilter("all");
    setHttpMethodFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchText("");
    setShowActiveFilter(false);
    setCurrentPage(1);
  }, []);

  // Toggle row expansion
  const toggleRowExpansion = useCallback((logId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return timestamp;
    }
  };

  // Get activity type badge
  const getActivityTypeBadge = (type: ActivityType) => {
    const config: Record<ActivityType, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      create: { variant: "default", label: "Create" },
      update: { variant: "secondary", label: "Update" },
      delete: { variant: "destructive", label: "Delete" },
      view: { variant: "outline", label: "View" },
      login: { variant: "default", label: "Login" },
      logout: { variant: "outline", label: "Logout" },
      other: { variant: "secondary", label: "Other" },
    };
    const badgeConfig = config[type] || config.other;
    return (
      <Badge variant={badgeConfig.variant}>
        {badgeConfig.label}
      </Badge>
    );
  };

  // Get HTTP method badge
  const getHttpMethodBadge = (method?: HttpMethod) => {
    if (!method) return null;
    const config: Record<HttpMethod, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      GET: { variant: "default", className: "bg-blue-100 text-blue-800" },
      POST: { variant: "default", className: "bg-green-100 text-green-800" },
      PUT: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      PATCH: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
      DELETE: { variant: "destructive", className: "bg-red-100 text-red-800" },
      OPTIONS: { variant: "outline", className: "bg-gray-100 text-gray-800" },
      HEAD: { variant: "outline", className: "bg-gray-100 text-gray-800" },
    };
    const badgeConfig = config[method] || config.GET;
    return (
      <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
        {method}
      </Badge>
    );
  };

  // Get status code badge
  const getStatusCodeBadge = (statusCode?: number) => {
    if (!statusCode) return null;
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let className = "bg-green-100 text-green-800";

    if (statusCode >= 200 && statusCode < 300) {
      variant = "default";
      className = "bg-green-100 text-green-800";
    } else if (statusCode >= 300 && statusCode < 400) {
      variant = "secondary";
      className = "bg-blue-100 text-blue-800";
    } else if (statusCode >= 400 && statusCode < 500) {
      variant = "destructive";
      className = "bg-yellow-100 text-yellow-800";
    } else if (statusCode >= 500) {
      variant = "destructive";
      className = "bg-red-100 text-red-800";
    }

    return (
      <Badge variant={variant} className={className}>
        {statusCode}
      </Badge>
    );
  };

  // Handle sort
  const handleSort = (field: "timestamp" | "admin_id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (error) {
    return (
      <RetryPage
        message="Failed to load activity logs"
        btnName="Retry"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Activity Logs"
        description="View and monitor admin activity logs across the system"
      />

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Admin User Dropdown */}
          <div className="min-w-[220px]">
            <Select value={adminIdFilter} onValueChange={setAdminIdFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {isLoadingAdminUsers ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  adminUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Search by Admin Name */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by admin name (first name, last name, or email)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* HTTP Method Filter */}
          <div className="min-w-[140px]">
            <Select value={httpMethodFilter} onValueChange={setHttpMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[200px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[200px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
            {adminIdFilter && adminIdFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                User: {adminUsers.find(u => u.id === adminIdFilter)?.fullName || adminUsers.find(u => u.id === adminIdFilter)?.email || adminIdFilter}
                <button
                  onClick={() => setAdminIdFilter("all")}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {httpMethodFilter && httpMethodFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Method: {httpMethodFilter}
                <button
                  onClick={() => setHttpMethodFilter("all")}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {debouncedSearchText.trim() && (
              <Badge variant="secondary" className="gap-1">
                Search: {debouncedSearchText}
                <button
                  onClick={() => setSearchText("")}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {startDate && (
              <Badge variant="secondary" className="gap-1">
                From: {format(startDate, "MMM dd, yyyy")}
                <button
                  onClick={() => setStartDate(undefined)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {endDate && (
              <Badge variant="secondary" className="gap-1">
                To: {format(endDate, "MMM dd, yyyy")}
                <button
                  onClick={() => setEndDate(undefined)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("timestamp")}
                      className="h-8 px-2"
                    >
                      Timestamp
                      {sortBy === "timestamp" && (
                        sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("admin_id")}
                      className="h-8 px-2"
                    >
                      Admin ID
                      {sortBy === "admin_id" && (
                        sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const isExpanded = expandedRows.has(log.id);
                    return (
                      <React.Fragment key={log.id}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpansion(log.id)}>
                          <TableCell>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.adminId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={log.action}>
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell>{getActivityTypeBadge(log.type)}</TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate" title={log.feature}>
                              {log.feature || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{getHttpMethodBadge(log.httpMethod)}</TableCell>
                          <TableCell>{getStatusCodeBadge(log.statusCode)}</TableCell>
                          <TableCell>
                            {log.responseTimeMs !== undefined ? `${log.responseTimeMs}ms` : "N/A"}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30">
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm font-semibold mb-1">Details</div>
                                    <div className="text-sm text-muted-foreground">
                                      {log.details || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold mb-1">Entity</div>
                                    <div className="text-sm text-muted-foreground">
                                      {log.entity ? `${log.entity}${log.entityName ? `: ${log.entityName}` : ""}` : "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold mb-1">Endpoint</div>
                                    <div className="text-sm text-muted-foreground font-mono">
                                      {log.endpoint || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold mb-1">IP Address</div>
                                    <div className="text-sm text-muted-foreground font-mono">
                                      {log.ipAddress || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold mb-1">User Agent</div>
                                    <div className="text-sm text-muted-foreground font-mono text-xs">
                                      {log.userAgent || "N/A"}
                                    </div>
                                  </div>
                                </div>
                                {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                                  <div>
                                    <div className="text-sm font-semibold mb-1">Request Body</div>
                                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                                      {JSON.stringify(log.requestBody, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="p-4 border-t">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pageSize}
                totalItems={pagination.total}
                pageSizeOptions={pageSizeOptions}
                startItem={(pagination.page - 1) * pagination.limit + 1}
                endItem={Math.min(pagination.page * pagination.limit, pagination.total)}
                visiblePages={[]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
