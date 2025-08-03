import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  RefreshCw,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useFailedEmails } from "@/api/hooks/useCampaigns";
import { FailedEmail } from "@/api/types";
import { format } from "date-fns";

interface FailedEmailsModalProps {
  campaignId: string;
  campaignName: string;
  trigger: React.ReactNode;
}

const getFailureReasonIcon = (reason: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    invalid_email: XCircle,
    user_not_found: AlertCircle,
    domain_not_found: AlertTriangle,
    mailbox_full: AlertCircle,
    rate_limit: Clock,
    authentication_error: XCircle,
    network_error: RefreshCw,
    smtp_error: AlertTriangle,
    unknown: AlertCircle,
  };
  return iconMap[reason] || AlertCircle;
};

const getFailureReasonColor = (reason: string) => {
  const colorMap: Record<string, string> = {
    invalid_email: "destructive",
    user_not_found: "secondary",
    domain_not_found: "secondary",
    mailbox_full: "default",
    rate_limit: "default",
    authentication_error: "destructive",
    network_error: "default",
    smtp_error: "secondary",
    unknown: "secondary",
  };
  return colorMap[reason] || "secondary";
};

const getFailureReasonLabel = (reason: string) => {
  const labelMap: Record<string, string> = {
    invalid_email: "Invalid Email",
    user_not_found: "User Not Found",
    domain_not_found: "Domain Not Found",
    mailbox_full: "Mailbox Full",
    rate_limit: "Rate Limited",
    authentication_error: "Auth Error",
    network_error: "Network Error",
    smtp_error: "SMTP Error",
    unknown: "Unknown Error",
  };
  return labelMap[reason] || "Unknown Error";
};

export const FailedEmailsModal: React.FC<FailedEmailsModalProps> = ({
  campaignId,
  campaignName,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const { failedEmails, loading, error, fetchFailedEmails, retryFailedEmails } = useFailedEmails(campaignId);

  useEffect(() => {
    if (open && campaignId) {
      fetchFailedEmails();
    }
  }, [open, campaignId, fetchFailedEmails]);

  const handleRetry = async () => {
    try {
      await retryFailedEmails();
      // Modal will stay open to show updated list
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
            <AlertCircle className="h-5 w-5 text-destructive" />
            Failed Emails - {campaignName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {failedEmails.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ready for Retry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {failedEmails.filter(email => email.retryCount < email.maxRetries).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Permanently Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {failedEmails.filter(email => email.retryCount >= email.maxRetries).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              disabled={loading || failedEmails.filter(email => email.retryCount < email.maxRetries).length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry Failed Emails
            </Button>
            <Button
              variant="outline"
              onClick={fetchFailedEmails}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
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

          {/* Failed Emails Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : failedEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-2" />
                <p className="text-sm">No failed emails found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Failure Reason</TableHead>
                    <TableHead>Retry Count</TableHead>
                    <TableHead>SMTP Code</TableHead>
                    <TableHead>Failed At</TableHead>
                    <TableHead>Next Retry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedEmails.map((email) => {
                    const ReasonIcon = getFailureReasonIcon(email.failureReason);
                    const isPermanentlyFailed = email.retryCount >= email.maxRetries;
                    
                    return (
                      <TableRow key={email._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {email.recipientEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getFailureReasonColor(email.failureReason) as any}>
                            <ReasonIcon className="h-3 w-3 mr-1" />
                            {getFailureReasonLabel(email.failureReason)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={isPermanentlyFailed ? "text-destructive" : "text-muted-foreground"}>
                              {email.retryCount}/{email.maxRetries}
                            </span>
                            {isPermanentlyFailed && (
                              <XCircle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {email.smtpResponseCode ? (
                            <Badge variant="outline">
                              {email.smtpResponseCode}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(email.failedAt), "MMM dd, HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {email.nextRetryAt && !isPermanentlyFailed ? (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(email.nextRetryAt), "MMM dd, HH:mm")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 