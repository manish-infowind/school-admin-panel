import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  TrendingUp,
  DollarSign,
  Building2,
  Target,
  Loader2,
} from "lucide-react";
import { useInvestor } from "@/api/hooks/useInvestors";
import { Investment } from "@/api/types";
import PageLoader from "@/components/common/PageLoader";
import RetryPage from "@/components/common/RetryPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvestorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const investorId = id || '';

  const { data: investor, isLoading, error } = useInvestor(investorId);

  const backToInvestors = () => {
    navigate('/admin/investors');
  };

  if (isLoading) {
    return <PageLoader pagename="investor" />;
  }

  if (error || !investor) {
    return (
      <RetryPage
        message="Failed to load investor details"
        btnName="Back to Investors"
        onRetry={backToInvestors}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: number | { value: number; label: string }) => {
    const statusValue = typeof status === 'object' ? status.value : status;
    const statusLabel = typeof status === 'object' ? status.label : (statusValue === 1 ? 'Active' : 'Inactive');
    
    return statusValue === 1 ? (
      <Badge variant="default" className="bg-green-600">{statusLabel}</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500">{statusLabel}</Badge>
    );
  };

  const getInvestmentStage = (investment: any) => {
    return investment.stage?.label || investment.stage_label || 'N/A';
  };

  const getInvestmentFund = (investment: any) => {
    // Use formatted_amount from API if available (e.g., "S$7,994,169")
    if (investment.fund?.formatted_amount) {
      return investment.fund.formatted_amount;
    }
    // Fallback to formatting manually
    const amount = investment.fund_amount || investment.fund?.amount || 0;
    const currency = investment.fund_currency || investment.fund?.currency || 'INR';
    return formatCurrency(amount, currency);
  };

  const getInvestmentCurrency = (investment: any) => {
    return investment.fund_currency || investment.fund?.currency || 'INR';
  };

  const getInvestmentFundType = (investment: any) => {
    return investment.fund?.type || investment.fund_type || 'N/A';
  };

  const getInvestmentStatus = (investment: any) => {
    // Check for nested status object first
    if (investment.status && typeof investment.status === 'object') {
      return investment.status;
    }
    // Check for status_value
    if (investment.status_value !== undefined) {
      return investment.status_value;
    }
    // Fallback to status number
    return investment.status || 1;
  };

  const getInvestmentGeographicalPreferences = (investment: any) => {
    // Check if it's the new array format
    if (Array.isArray(investment.geographical_preferences) && investment.geographical_preferences.length > 0) {
      return investment.geographical_preferences;
    }
    // Fallback to old format
    if (investment.geographical_preferences_flat) {
      const pref = investment.geographical_preferences_flat;
      const items = [];
      if (pref.cities) {
        pref.cities.forEach((city: string, index: number) => {
          items.push({
            city,
            state: pref.states?.[index] || '',
            country: pref.countries?.[index] || '',
            priority: index + 1,
          });
        });
      }
      return items;
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={backToInvestors}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              {investor.first_name} {investor.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">Investor Details</p>
          </div>
        </div>
        {getStatusBadge(
          typeof investor.status === 'object' 
            ? investor.status 
            : { value: investor.status, label: investor.status === 1 ? 'Active' : 'Inactive' }
        )}
      </div>

      {/* Top Row - Basic Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email, Location, Last Updated */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium truncate">{investor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {investor.city_name}, {investor.state_name}, {investor.country_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(investor.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone, Website, Created */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{investor.phone}</p>
              </div>
            </div>
            {investor.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={investor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline truncate block"
                  >
                    {investor.website}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(investor.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Investments</span>
              <Badge variant="outline" className="text-lg font-semibold">
                {investor.investments?.length || investor.investment_count || 0}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Investment Statistics</p>
              {investor.investments && investor.investments.length > 0 && (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Active: {investor.investments.filter((inv: any) => {
                      const status = getInvestmentStatus(inv);
                      return (typeof status === 'object' ? status.value : status) === 1;
                    }).length}
                  </p>
                  <p className="text-muted-foreground">
                    Inactive: {investor.investments.filter((inv: any) => {
                      const status = getInvestmentStatus(inv);
                      return (typeof status === 'object' ? status.value : status) !== 1;
                    }).length}
                  </p>
                  <Separator className="my-2" />
                  <p className="text-muted-foreground">
                    Total Fund Amount: {(() => {
                      const total = investor.investments.reduce((sum: number, inv: any) => {
                        return sum + (inv.fund_amount || inv.fund?.amount || 0);
                      }, 0);
                      // Get the most common currency or default to first investment's currency
                      const currencies = investor.investments.map((inv: any) => getInvestmentCurrency(inv));
                      const mostCommonCurrency = currencies[0] || 'INR';
                      return formatCurrency(total, mostCommonCurrency);
                    })()}
                  </p>
                  {investor.portfolio_highlights?.averageTicketSize && (
                    <p className="text-muted-foreground">
                      Avg Ticket: {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(investor.portfolio_highlights.averageTicketSize)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Highlights - Full Width */}
      {investor.portfolio_highlights && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {investor.portfolio_highlights.description && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{investor.portfolio_highlights.description}</p>
                </div>
              )}
              {investor.portfolio_highlights.totalInvestments !== undefined && (
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Total Investments</p>
                  <p className="text-3xl font-bold">{investor.portfolio_highlights.totalInvestments}</p>
                </div>
              )}
              {investor.portfolio_highlights.averageTicketSize !== undefined && (
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Average Ticket Size</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(investor.portfolio_highlights.averageTicketSize)}
                  </p>
                </div>
              )}
              {investor.portfolio_highlights.notable_investments && investor.portfolio_highlights.notable_investments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Notable Investments</p>
                  <div className="flex flex-wrap gap-2">
                    {investor.portfolio_highlights.notable_investments.map((investment, index) => (
                      <Badge key={index} variant="outline">
                        {investment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {investor.portfolio_highlights.focus_areas && investor.portfolio_highlights.focus_areas.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {investor.portfolio_highlights.focus_areas.map((area, index) => (
                    <Badge key={index} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Investments List - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investments ({investor.investments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!investor.investments || investor.investments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No investments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Stage</TableHead>
                    <TableHead className="min-w-[150px]">Fund Amount</TableHead>
                    <TableHead className="min-w-[120px]">Fund Type</TableHead>
                    <TableHead className="min-w-[120px]">Source</TableHead>
                    <TableHead className="min-w-[250px]">Location</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[180px]">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investor.investments.map((investment: any) => {
                    const geoPrefs = getInvestmentGeographicalPreferences(investment);
                    const investmentStatus = getInvestmentStatus(investment);
                    const createdDate = investment.timestamps?.created_at || investment.created_at;
                    const statusValue = typeof investmentStatus === 'object' ? investmentStatus.value : investmentStatus;
                    const statusLabel = typeof investmentStatus === 'object' ? investmentStatus.label : (statusValue === 1 ? 'Active' : 'Inactive');
                    
                    return (
                      <TableRow key={investment.id}>
                        <TableCell className="min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">{getInvestmentStage(investment)}</span>
                            </div>
                            {investment.stage?.description && (
                              <p className="text-xs text-muted-foreground ml-6">
                                {investment.stage.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium whitespace-nowrap">
                              {getInvestmentFund(investment)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          {getInvestmentFundType(investment) && getInvestmentFundType(investment) !== 'N/A' ? (
                            <Badge variant="outline">{getInvestmentFundType(investment)}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <Badge variant="secondary">{investment.fund_source || investment.fund?.source || '-'}</Badge>
                        </TableCell>
                        <TableCell className="min-w-[250px]">
                          {geoPrefs.length > 0 ? (
                            <div className="text-sm space-y-1">
                              {geoPrefs.slice(0, 3).map((pref: any, index: number) => (
                                <div key={index} className="flex items-center gap-1 flex-wrap">
                                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="whitespace-nowrap">
                                    {pref.city}, {pref.state}
                                  </span>
                                  {pref.priority !== undefined && (
                                    <Badge variant="outline" className="text-xs ml-1 whitespace-nowrap">
                                      P{pref.priority}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              {geoPrefs.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{geoPrefs.length - 3} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No preference</span>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          {getStatusBadge({ value: statusValue, label: statusLabel })}
                        </TableCell>
                        <TableCell className="min-w-[180px] text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(createdDate)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
