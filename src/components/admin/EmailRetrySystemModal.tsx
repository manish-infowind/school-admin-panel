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
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Timer,
} from "lucide-react";
import { useEmailRetrySystem } from "@/api/hooks/useCampaigns";
import { EmailRetryStats } from "@/api/types";
import { format } from "date-fns";

interface EmailRetrySystemModalProps {
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

const SystemStatusCard = ({ stats }: { stats: EmailRetryStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5" />
        System Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.emailsInRetryQueue}</div>
          <div className="text-sm text-muted-foreground">In Retry Queue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.averageRetrySuccessRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Success Rate</span>
          <span className="font-medium">{stats.averageRetrySuccessRate.toFixed(1)}%</span>
        </div>
        <Progress value={stats.averageRetrySuccessRate} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

const RetryTimelineCard = ({ stats }: { stats: EmailRetryStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Retry Timeline
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.emailsRetriedToday}</div>
          <div className="text-sm text-muted-foreground">Retried Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.emailsRetriedThisWeek}</div>
          <div className="text-sm text-muted-foreground">Retried This Week</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {stats.lastRetryProcessRun && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Process Run</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(stats.lastRetryProcessRun), "MMM dd, HH:mm")}
            </span>
          </div>
        )}
        
        {stats.nextRetryProcessRun && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Next Process Run</span>
            </div>
            <span className="text-sm text-blue-600">
              {format(new Date(stats.nextRetryProcessRun), "MMM dd, HH:mm")}
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const EmailRetrySystemModal: React.FC<EmailRetrySystemModalProps> = ({
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const { retryStats, loading, error, fetchRetryStats, triggerRetry } = useEmailRetrySystem();

  useEffect(() => {
    if (open) {
      fetchRetryStats();
    }
  }, [open, fetchRetryStats]);

  const handleTriggerRetry = async () => {
    try {
      await triggerRetry();
      // Stats will be refreshed automatically by the hook
    } catch (error) {
      // Error is handled by the hook
    }
  };

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
            <RefreshCw className="h-5 w-5" />
            Email Retry System Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleTriggerRetry}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Trigger Manual Retry
            </Button>
            <Button
              variant="outline"
              onClick={fetchRetryStats}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Stats
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : retryStats ? (
            <>
              {/* Main Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Failed Emails"
                  value={retryStats.totalFailedEmails}
                  icon={XCircle}
                  color="red"
                  subtitle="Across all campaigns"
                />
                <StatCard
                  title="In Retry Queue"
                  value={retryStats.emailsInRetryQueue}
                  icon={Clock}
                  color="orange"
                  subtitle="Waiting for retry"
                />
                <StatCard
                  title="Retried Today"
                  value={retryStats.emailsRetriedToday}
                  icon={RefreshCw}
                  color="blue"
                  subtitle="Processed today"
                />
                <StatCard
                  title="Success Rate"
                  value={`${retryStats.averageRetrySuccessRate.toFixed(1)}%`}
                  icon={CheckCircle}
                  color="green"
                  subtitle="Average retry success"
                />
              </div>

              {/* Detailed Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemStatusCard stats={retryStats} />
                <RetryTimelineCard stats={retryStats} />
              </div>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Automatic Retry Interval</span>
                        <Badge variant="outline">Every 5 minutes</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Retry Strategy</span>
                        <Badge variant="outline">Exponential Backoff</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Retry Delays</span>
                        <Badge variant="outline">5min, 10min, 20min...</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Retries</span>
                        <Badge variant="outline">Configurable per campaign</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No retry statistics available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 