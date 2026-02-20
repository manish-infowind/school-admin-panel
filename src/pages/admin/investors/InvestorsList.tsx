import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Loader2,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowUpDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInvestors } from "@/api/hooks/useInvestors";
import { Investor, InvestorsQueryParams } from "@/api/types";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";

export default function InvestorsList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [status, setStatus] = useState<string>("");
  const [minInvestmentCount, setMinInvestmentCount] = useState<number | undefined>(undefined);
  const [maxInvestmentCount, setMaxInvestmentCount] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<InvestorsQueryParams['sort_by']>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams: InvestorsQueryParams = {
    page: currentPage,
    limit,
    search: debouncedSearch || undefined,
    country_code: countryCode || undefined,
    state_code: stateCode || undefined,
    city_name: cityName || undefined,
    status: status || undefined,
    min_investment_count: minInvestmentCount,
    max_investment_count: maxInvestmentCount,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data, isLoading, error, refetch } = useInvestors(queryParams);

  const investors = data?.investors || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (field: InvestorsQueryParams['sort_by']) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge variant="default" className="bg-green-600">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500">
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const viewInvestor = (investorId: string) => {
    navigate(`/admin/investors/${investorId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCountryCode("");
    setStateCode("");
    setCityName("");
    setStatus("");
    setMinInvestmentCount(undefined);
    setMaxInvestmentCount(undefined);
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Investors Management"
        subHeading="View and manage all investors and their investments"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Country Code (e.g., IN, US)"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            />
            <Input
              placeholder="State Code (e.g., MH, CA)"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value.toUpperCase())}
            />
            <Input
              placeholder="City Name"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            <Input
              type="number"
              placeholder="Min Investment Count"
              value={minInvestmentCount || ""}
              onChange={(e) => setMinInvestmentCount(e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max Investment Count"
              value={maxInvestmentCount || ""}
              onChange={(e) => setMaxInvestmentCount(e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investors List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investors ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">Failed to load investors</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </div>
            )}

            {isLoading ? (
              <PageLoader pagename="investors" />
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('name')}
                            className="h-8 px-2"
                          >
                            Name
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('investment_count')}
                            className="h-8 px-2"
                          >
                            Investments
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('created_at')}
                            className="h-8 px-2"
                          >
                            Created
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            <div className="flex flex-col items-center">
                              <TrendingUp className="h-12 w-12 mb-4" />
                              <p>No investors found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        investors.map((investor: Investor) => (
                          <TableRow
                            key={investor.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => viewInvestor(investor.id)}
                          >
                            <TableCell className="font-medium">
                              {investor.first_name} {investor.last_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {investor.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {investor.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {investor.city_name}, {investor.state_name}, {investor.country_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-semibold">
                                {investor.investment_count}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(investor.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(investor.created_at)}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewInvestor(investor.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} investors
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage || isLoading}
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
                        disabled={!pagination.hasNextPage || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
