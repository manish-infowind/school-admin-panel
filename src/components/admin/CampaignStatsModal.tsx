import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Users,
  Send,
  Eye,
  MousePointer,
} from "lucide-react";
import { useDetailedCampaignStats } from "@/api/hooks/useCampaigns";
import { DetailedCampaignStats } from "@/api/types";

interface CampaignStatsModalProps {
  campaignId: string;
  campaignName: string;
  trigger: React.ReactNode;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "default",
  subtitle,
  trend
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}%
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const EmailTrackingCard = ({ stats }: { stats: DetailedCampaignStats['emailTracking'] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Email Tracking Overview
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          <div className="text-sm text-muted-foreground">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.retrying}</div>
          <div className="text-sm text-muted-foreground">Retrying</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Failure Rate</span>
          <span className="font-medium">{stats.failureRate.toFixed(1)}%</span>
        </div>
        <Progress value={stats.failureRate} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

const FailureBreakdownCard = ({ breakdown }: { breakdown: DetailedCampaignStats['failureBreakdown'] }) => {
  const totalFailures = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  
  if (totalFailures === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Failure Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No failures recorded
          </div>
        </CardContent>
      </Card>
    );
  }

  const failureTypes = [
    { key: 'invalid_email', label: 'Invalid Email', color: 'destructive' },
    { key: 'user_not_found', label: 'User Not Found', color: 'secondary' },
    { key: 'domain_not_found', label: 'Domain Not Found', color: 'secondary' },
    { key: 'mailbox_full', label: 'Mailbox Full', color: 'default' },
    { key: 'rate_limit', label: 'Rate Limited', color: 'default' },
    { key: 'authentication_error', label: 'Auth Error', color: 'destructive' },
    { key: 'network_error', label: 'Network Error', color: 'default' },
    { key: 'smtp_error', label: 'SMTP Error', color: 'secondary' },
    { key: 'unknown', label: 'Unknown Error', color: 'secondary' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Failure Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {failureTypes.map(({ key, label, color }) => {
          const count = breakdown[key as keyof typeof breakdown] || 0;
          const percentage = totalFailures > 0 ? (count / totalFailures) * 100 : 0;
          
          if (count === 0) return null;
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={color as any}>{count}</Badge>
                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={percentage} className="h-1" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const CampaignStatsModal: React.FC<CampaignStatsModalProps> = ({
  campaignId,
  campaignName,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const { stats, loading, error, fetchDetailedStats } = useDetailedCampaignStats(campaignId);

  useEffect(() => {
    if (open && campaignId) {
      fetchDetailedStats();
    }
  }, [open, campaignId, fetchDetailedStats]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Statistics - {campaignName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Main Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Recipients"
                  value={stats.totalEmailsTracked}
                  icon={Users}
                  subtitle="Emails tracked"
                />
                <StatCard
                  title="Emails Sent"
                  value={stats.totalEmailsSent}
                  icon={Send}
                  color="green"
                  subtitle="Successfully delivered"
                />
                <StatCard
                  title="Emails Failed"
                  value={stats.totalEmailsFailed}
                  icon={XCircle}
                  color="red"
                  subtitle="Failed to deliver"
                />
                <StatCard
                  title="Failure Rate"
                  value={`${stats.emailFailureRate.toFixed(1)}%`}
                  icon={AlertCircle}
                  color="orange"
                  subtitle="Of total emails"
                />
              </div>

              {/* Engagement Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Open Rate"
                  value={`${stats.averageOpenRate.toFixed(1)}%`}
                  icon={Eye}
                  color="blue"
                  subtitle="Average across campaigns"
                />
                <StatCard
                  title="Click Rate"
                  value={`${stats.averageClickRate.toFixed(1)}%`}
                  icon={MousePointer}
                  color="purple"
                  subtitle="Average across campaigns"
                />
                <StatCard
                  title="Pending Emails"
                  value={stats.pendingEmails}
                  icon={Clock}
                  color="orange"
                  subtitle="Waiting to be sent"
                />
              </div>

              {/* Email Tracking Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EmailTrackingCard stats={stats.emailTracking} />
                <FailureBreakdownCard breakdown={stats.failureBreakdown} />
              </div>

              {/* Campaign Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Campaign Status Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.draftCampaigns}</div>
                      <div className="text-sm text-muted-foreground">Draft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.scheduledCampaigns}</div>
                      <div className="text-sm text-muted-foreground">Scheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.completedCampaigns}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.failedCampaigns}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No statistics available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 