import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Building2, MapPin, RefreshCw, Pencil, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { CollegeService } from "@/api/services/collegeService";
import { LocationService } from "@/api/services/locationService";
import type { College, State, City } from "@/api/types";
import { INSTITUTION_TYPES } from "@/api/types";

const PAGE_SIZE = 10;

export default function Colleges() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await CollegeService.list({
        page,
        limit: PAGE_SIZE,
        ...(category ? { category } : undefined),
        ...(stateId ? { stateId } : undefined),
        ...(cityId ? { cityId } : undefined),
      });
      if (res.success && res.data) {
        setColleges(res.data.colleges);
        setTotal(res.data.pagination?.total ?? res.data.colleges.length);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? (e as { message: string }).message : "Failed to load colleges";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [page, category, stateId, cityId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await LocationService.getStates();
        if (res.success && res.data) setStates(res.data);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      setCityId("");
      return;
    }
    (async () => {
      try {
        const res = await LocationService.getCities(stateId);
        if (res.success && res.data) setCities(res.data);
        else setCities([]);
      } catch {
        setCities([]);
      }
      setCityId("");
    })();
  }, [stateId]);

  const handleDelete = async (col: College, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Permanently delete "${col.name}"? This cannot be undone.`)) return;
    setDeletingId(col._id);
    try {
      const res = await CollegeService.remove(col._id);
      if (res.success) {
        toast({ title: "Success", description: "College deleted" });
        await fetchColleges();
      } else {
        toast({ title: "Error", description: "Failed to delete college", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete college", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Colleges"
        subHeading="Manage colleges and institutions"
        page="colleges"
        openModal={() => {}}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/admin/colleges/add">
          <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add College
          </Button>
        </Link>
        <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Institution type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {INSTITUTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stateId || "all"} onValueChange={(v) => setStateId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {states.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityId || "all"} onValueChange={(v) => setCityId(v === "all" ? "" : v)} disabled={!stateId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => fetchColleges()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <PageLoader pagename="colleges" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colleges.map((col) => {
              const feeDisplay = (col.courseFees?.length ?? 0) > 0
                ? col.courseFees!.map((cf) => cf.fee ? `${cf.courseName}: ${cf.fee}` : cf.courseName).join(" · ")
                : col.fee
                  ? `Fee: ${col.fee}`
                  : null;
              return (
                <Card key={col._id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:min-h-[140px]">
                    <div className="w-full sm:w-28 h-32 sm:h-auto sm:min-h-[140px] shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                      {col.logoUrl ? (
                        <img
                          src={col.logoUrl}
                          alt={col.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <CardHeader className="pb-2 pt-4 sm:pt-6">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-tight">
                            <Link
                              to={`/admin/colleges/${col._id}`}
                              className="hover:underline line-clamp-2"
                            >
                              {col.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-1 shrink-0">
                            {col.isActive !== false && (
                              <Badge variant="secondary">Active</Badge>
                            )}
                            {col.isVerified && (
                              <Badge className="bg-brand-green/20 text-brand-green">Verified</Badge>
                            )}
                            <Link
                              to={`/admin/colleges/${col._id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              title="Edit college"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="Delete college"
                              onClick={(e) => handleDelete(col, e)}
                              disabled={deletingId === col._id}
                            >
                              {deletingId === col._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {(col.shortName || col.category) && (
                          <p className="text-sm text-muted-foreground">
                            {[col.shortName, col.category].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0 pb-4 flex-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{col.locationDisplay}</span>
                        </div>
                        {feeDisplay && (
                          <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                            {feeDisplay}
                          </p>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          {colleges.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No colleges found. Add one to get started.
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
