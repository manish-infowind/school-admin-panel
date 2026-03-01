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
import { Plus, Calendar, RefreshCw, Pencil, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { EventService } from "@/api/services/eventService";
import type { Event } from "@/api/types";
import { format } from "date-fns";

const PAGE_SIZE = 20;

export default function Events() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"startDate" | "endDate">("startDate");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await EventService.list({
        page,
        limit: PAGE_SIZE,
        sort,
      });
      if (res.success && res.data) {
        setEvents(res.data.events);
        setTotal(res.data.pagination?.total ?? res.data.events.length);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? (e as { message: string }).message
          : "Failed to load events";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, sort]);

  const handleDelete = async (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    setDeletingId(event._id);
    try {
      const res = await EventService.remove(event._id);
      if (res.success) {
        toast({ title: "Success", description: "Event deleted" });
        await fetchEvents();
      } else {
        toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Events"
        subHeading="Manage banner events for the customer portal"
        page="events"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/admin/events/add">
          <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </Link>
        <Select value={sort} onValueChange={(v) => setSort(v as "startDate" | "endDate")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startDate">Start date</SelectItem>
            <SelectItem value="endDate">End date</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchEvents()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <PageLoader pagename="events" />
      ) : (
        <>
          <div className="space-y-2">
            {events.map((ev) => (
              <Card key={ev._id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {ev.imageUrl && (
                    <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-md overflow-hidden bg-muted">
                      <img
                        src={ev.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{ev.name}</span>
                      {ev.isActive !== false ? (
                        <Badge className="bg-brand-green/20 text-brand-green">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {ev.shortDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                        {ev.shortDescription}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {ev.startDate && format(new Date(ev.startDate), "PP")}
                        {ev.endDate && ` – ${format(new Date(ev.endDate), "PP")}`}
                      </span>
                      {ev.venue && <span>{ev.venue}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/admin/events/${ev._id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit event">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete event"
                      onClick={(e) => handleDelete(ev, e)}
                      disabled={deletingId === ev._id}
                    >
                      {deletingId === ev._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {events.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                No events yet. Add one to show on the customer portal banner.
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
