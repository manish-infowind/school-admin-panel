import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RefreshCw, MessageSquare, Loader2, ChevronRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { EnquiryService } from "@/api/services/collegeService";
import type { Enquiry, EnquiryStatus } from "@/api/types";
import { format } from "date-fns";

const PAGE_SIZE = 20;
const STATUS_OPTIONS: { value: EnquiryStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

function StatusBadge({ status }: { status?: EnquiryStatus }) {
  if (!status) return <Badge variant="secondary">—</Badge>;
  const variant =
    status === "pending"
      ? "default"
      : status === "reviewed"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant}>
      {status === "pending" ? "Pending" : status === "reviewed" ? "Reviewed" : "Resolved"}
    </Badge>
  );
}

export default function Enquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<EnquiryStatus | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await EnquiryService.list({
        page,
        limit: PAGE_SIZE,
        ...(status ? { status } : undefined),
        ...(fromDate ? { fromDate } : undefined),
        ...(toDate ? { toDate } : undefined),
        sort,
      });
      if (res.success && res.data) {
        setEnquiries(res.data.enquiries);
        setTotal(res.data.pagination?.total ?? res.data.enquiries.length);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? (e as { message: string }).message
          : "Failed to load enquiries";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, status, fromDate, toDate, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Enquiries"
        subHeading="View and manage student enquiries"
        page="enquiries"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : (v as EnquiryStatus))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[140px]"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchEnquiries()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <PageLoader pagename="enquiries" />
      ) : (
        <>
          <div className="space-y-2">
            {enquiries.map((enq) => (
              <Card key={enq._id} className="overflow-hidden">
                <Link to={`/admin/enquiries/${enq._id}`}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium">
                          {enq.name || "—"}
                        </span>
                        <StatusBadge status={enq.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {enq.description || "No description"}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {enq.email && <span>{enq.email}</span>}
                        {enq.mobile && <span>{enq.mobile}</span>}
                        {enq.courseId?.name && (
                          <span>Course: {enq.courseId.name}</span>
                        )}
                        {enq.createdAt && (
                          <span>
                            {format(new Date(enq.createdAt), "PP")}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          {enquiries.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                No enquiries found.
              </CardContent>
            </Card>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
