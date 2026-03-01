import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { EnquiryService } from "@/api/services/collegeService";
import { API_ERROR_CODES } from "@/api/config";
import type { Enquiry, EnquiryStatus } from "@/api/types";
import type { ApiError } from "@/api/types";
import { format } from "date-fns";

const STATUS_OPTIONS: EnquiryStatus[] = ["pending", "reviewed", "resolved"];

function StatusBadge({ status }: { status?: EnquiryStatus }) {
  if (!status) return <Badge variant="secondary">—</Badge>;
  const variant =
    status === "pending"
      ? "default"
      : status === "reviewed"
        ? "secondary"
        : "outline";
  const label =
    status === "pending"
      ? "Pending"
      : status === "reviewed"
        ? "Reviewed"
        : "Resolved";
  return <Badge variant={variant}>{label}</Badge>;
}

export default function EnquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<EnquiryStatus | "">("");
  const [editNotes, setEditNotes] = useState("");

  const fetchEnquiry = useCallback(() => {
    if (!id) return;
    setLoading(true);
    EnquiryService.getById(id)
      .then((res) => {
        if (res.success && res.data) {
          setEnquiry(res.data);
          setEditStatus((res.data.status as EnquiryStatus) || "");
          setEditNotes(res.data.notes ?? "");
        } else {
          setEnquiry(null);
        }
      })
      .catch((e: unknown) => {
        setEnquiry(null);
        const err = e as ApiError;
        if (err?.code === API_ERROR_CODES.ENQUIRY_NOT_FOUND) {
          toast({
            title: "Not found",
            description: "Enquiry not found",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: err?.message ?? "Failed to load enquiry",
            variant: "destructive",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  const handleSave = async () => {
    if (!id || !enquiry) return;
    setSaving(true);
    try {
      const res = await EnquiryService.update(id, {
        ...(editStatus ? { status: editStatus as EnquiryStatus } : undefined),
        notes: editNotes || undefined,
      });
      if (res.success && res.data) {
        setEnquiry(res.data);
        toast({ title: "Saved", description: "Enquiry updated" });
      } else {
        toast({
          title: "Error",
          description: "Failed to update enquiry",
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const err = e as ApiError;
      toast({
        title: "Error",
        description: err?.message ?? "Failed to update enquiry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    (editStatus && editStatus !== (enquiry?.status ?? "")) ||
    editNotes !== (enquiry?.notes ?? "");

  if (loading) return <PageLoader pagename="enquiry" />;
  if (!enquiry) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link to="/admin/enquiries">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {enquiry.name || "Enquiry"}
            </h1>
            <StatusBadge status={enquiry.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {enquiry.createdAt &&
              `Submitted ${format(new Date(enquiry.createdAt), "PPp")}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {enquiry.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Message
              </p>
              <p className="text-sm whitespace-pre-wrap">{enquiry.description}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {enquiry.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${enquiry.email}`}
                  className="text-primary hover:underline"
                >
                  {enquiry.email}
                </a>
              </div>
            )}
            {enquiry.mobile && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${enquiry.mobile}`}
                  className="text-primary hover:underline"
                >
                  {enquiry.mobile}
                </a>
              </div>
            )}
          </div>
          {enquiry.courseId && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {enquiry.courseId.name}
                {enquiry.courseId.slug && (
                  <span className="text-muted-foreground ml-1">
                    ({enquiry.courseId.slug})
                  </span>
                )}
              </span>
            </div>
          )}
          {(enquiry.createdAt || enquiry.updatedAt) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Created: {enquiry.createdAt && format(new Date(enquiry.createdAt), "PPp")}
                {enquiry.updatedAt &&
                  enquiry.updatedAt !== enquiry.createdAt &&
                  ` · Updated: ${format(new Date(enquiry.updatedAt), "PPp")}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update status & notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={editStatus || "pending"}
              onValueChange={(v) => setEditStatus(v as EnquiryStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "pending"
                      ? "Pending"
                      : s === "reviewed"
                        ? "Reviewed"
                        : "Resolved"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Admin notes</Label>
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={4}
              className="resize-none"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-brand-green hover:bg-brand-green/90 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
