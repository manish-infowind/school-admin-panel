import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Star,
  ImageIcon,
  Loader2,
  Power,
  Trash2,
  Pencil,
} from "lucide-react";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { CollegeService } from "@/api/services/collegeService";
import type { College } from "@/api/types";
import { format } from "date-fns";

export default function CollegeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCollege = useCallback(() => {
    if (!id) return;
    setLoading(true);
    CollegeService.getById(id)
      .then((res) => {
        if (res.success && res.data) setCollege(res.data);
        else setCollege(null);
      })
      .catch(() => {
        setCollege(null);
        toast({ title: "Error", description: "College not found", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => {
    fetchCollege();
  }, [fetchCollege]);

  const handleStatusChange = async () => {
    if (!id || !college) return;
    const nextActive = college.isActive === false;
    setUpdatingStatus(true);
    try {
      const res = await CollegeService.updateStatus(id, nextActive);
      if (res.success && res.data) {
        setCollege(res.data);
        toast({ title: "Success", description: nextActive ? "College activated" : "College deactivated" });
      } else {
        toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !college) return;
    if (!window.confirm(`Permanently delete "${college.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await CollegeService.remove(id);
      if (res.success) {
        toast({ title: "Success", description: "College deleted" });
        navigate("/admin/colleges", { replace: true });
      } else {
        toast({ title: "Error", description: "Failed to delete college", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete college", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader pagename="college" />;
  if (!college) return null;

  const hasCourseFees = (college.courseFees?.length ?? 0) > 0;
  const hasHighlights = (college.highlights?.length ?? 0) > 0;
  const hasFacilities = (college.facilities?.length ?? 0) > 0;
  const hasGallery = (college.galleryUrls?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Back + header with logo */}
      <div className="flex items-start gap-4">
        <Link to="/admin/colleges">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex gap-6 flex-1 min-w-0 flex-wrap">
          <div className="shrink-0">
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt={college.name}
                className="w-24 h-24 rounded-xl object-cover border shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center border">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {college.name}
              </h1>
              {college.badge && (
                <Badge variant="secondary">{college.badge}</Badge>
              )}
              {college.isActive !== false && (
                <Badge variant="outline">Active</Badge>
              )}
              {college.isVerified && (
                <Badge className="bg-brand-green/20 text-brand-green border-0">Verified</Badge>
              )}
            </div>
            {(college.shortName || college.category) && (
              <p className="text-muted-foreground">
                {[college.shortName, college.category].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Link to={`/admin/colleges/${college._id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4 mr-1" />}
                {college.isActive === false ? "Activate" : "Deactivate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{college.locationDisplay}</p>
          {college.address && (
            <p className="text-sm text-muted-foreground">{college.address}</p>
          )}
          {college.pinCode && (
            <p className="text-sm text-muted-foreground">Pin code: {college.pinCode}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats: rating, NIRF, placement, avg package */}
      {(college.rating != null || college.nirfRank != null || college.placementRate != null || college.avgPackage) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {college.rating != null && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {college.rating}
                  </p>
                </div>
              )}
              {college.nirfRank != null && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">NIRF Rank</p>
                  <p className="font-medium">{college.nirfRank}</p>
                </div>
              )}
              {college.placementRate != null && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Placement rate</p>
                  <p className="font-medium">{college.placementRate}%</p>
                </div>
              )}
              {college.avgPackage && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg package</p>
                  <p className="font-medium">{college.avgPackage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses & fees */}
      {(hasCourseFees || college.courses?.length || college.fee) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Courses &amp; fees</CardTitle>
          </CardHeader>
          <CardContent>
            {hasCourseFees ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4 font-medium">Course</th>
                      <th className="pb-2 pr-4 font-medium">Fee</th>
                      <th className="pb-2 font-medium">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {college.courseFees!.map((cf, i) => (
                      <tr key={cf._id ?? i} className="border-b last:border-0">
                        <td className="py-2 pr-4">{cf.courseName}</td>
                        <td className="py-2 pr-4">{cf.fee ?? "—"}</td>
                        <td className="py-2">{cf.feePeriod ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                {college.courses?.length ? (
                  <p className="text-sm text-muted-foreground mb-2">
                    Courses: {college.courses.join(", ")}
                  </p>
                ) : null}
                {college.fee && (
                  <p className="text-sm"><strong>Fee:</strong> {college.fee}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      {(college.phone || college.email || college.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {college.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`tel:${college.phone}`} className="hover:underline">{college.phone}</a>
              </div>
            )}
            {college.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`mailto:${college.email}`} className="hover:underline">{college.email}</a>
              </div>
            )}
            {college.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {college.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {(college.description || college.eligibility) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {college.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{college.description}</p>
            )}
            {college.eligibility && (
              <div>
                <p className="text-sm font-medium mb-1">Eligibility</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{college.eligibility}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Highlights */}
      {hasHighlights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {college.highlights!.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Facilities */}
      {hasFacilities && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {college.facilities!.map((f, i) => (
                <Badge key={i} variant="secondary">{f}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {hasGallery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {college.galleryUrls!.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border aspect-video bg-muted"
                >
                  <img
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      {(college.createdAt || college.updatedAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {college.createdAt && (
              <p>Created: {format(new Date(college.createdAt), "PPp")}</p>
            )}
            {college.updatedAt && college.updatedAt !== college.createdAt && (
              <p>Updated: {format(new Date(college.updatedAt), "PPp")}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
