import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventService } from "@/api/services/eventService";
import { uploadCollegeImage } from "@/api/services/collegeService";
import { API_ERROR_CODES } from "@/api/config";
import type { Event, CreateEventRequest } from "@/api/types";
import type { ApiError } from "@/api/types";

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export default function AddEvent() {
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreateEventRequest & { isActive: boolean }>({
    name: "",
    startDate: "",
    endDate: "",
    shortDescription: "",
    longDescription: "",
    imageUrl: "",
    venue: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode && editId) {
      setLoading(true);
      EventService.getById(editId)
        .then((res) => {
          if (res.success && res.data) {
            const e = res.data as Event;
            setForm({
              name: e.name,
              startDate: toDateInputValue(e.startDate),
              endDate: toDateInputValue(e.endDate),
              shortDescription: e.shortDescription ?? "",
              longDescription: e.longDescription ?? "",
              imageUrl: e.imageUrl ?? "",
              venue: e.venue ?? "",
              isActive: e.isActive !== false,
            });
          }
        })
        .catch((e: unknown) => {
          const err = e as ApiError;
          if (err?.code === API_ERROR_CODES.EVENT_NOT_FOUND) {
            toast({ title: "Not found", description: "Event not found", variant: "destructive" });
          } else {
            toast({ title: "Error", description: err?.message ?? "Failed to load event", variant: "destructive" });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, editId, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image", variant: "destructive" });
      return;
    }
    if (file.size === 0) {
      toast({ title: "Invalid file", description: "File is empty. Choose a valid image.", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    const url = await uploadCollegeImage(file);
    setUploadingImage(false);
    e.target.value = "";
    if (url) {
      setForm((f) => ({ ...f, imageUrl: url }));
      toast({ title: "Uploaded", description: "Event image uploaded" });
    } else {
      toast({ title: "Upload failed", description: "Could not upload. Try again or paste URL.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast({ title: "Validation", description: "Name is required", variant: "destructive" });
      return;
    }
    if (!form.startDate) {
      toast({ title: "Validation", description: "Start date is required", variant: "destructive" });
      return;
    }
    if (!form.endDate) {
      toast({ title: "Validation", description: "End date is required", variant: "destructive" });
      return;
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      toast({ title: "Validation", description: "End date must be on or after start date", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const body: CreateEventRequest = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        shortDescription: form.shortDescription?.trim() || undefined,
        longDescription: form.longDescription?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        venue: form.venue?.trim() || undefined,
        isActive: form.isActive,
      };
      if (isEditMode && editId) {
        const res = await EventService.update(editId, body);
        if (res.success) {
          toast({ title: "Saved", description: "Event updated" });
          navigate("/admin/events", { replace: true });
        } else {
          toast({ title: "Error", description: "Failed to update event", variant: "destructive" });
        }
      } else {
        const res = await EventService.create(body);
        if (res.success) {
          toast({ title: "Success", description: "Event created" });
          navigate("/admin/events", { replace: true });
        } else {
          toast({ title: "Error", description: "Failed to create event", variant: "destructive" });
        }
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast({
        title: "Error",
        description: apiErr?.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to={isEditMode ? "/admin/events" : "/admin/events"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? "Edit event" : "Add event"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEditMode ? "Event details" : "New event"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Admission Open 2024"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short description (banner / cards)</Label>
              <Textarea
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                placeholder="e.g. Apply now for B.Tech and MBA programs."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long description (detail page)</Label>
              <Textarea
                id="longDescription"
                value={form.longDescription}
                onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))}
                placeholder="Full details for the event detail page."
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Event image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingImage ? "Uploading..." : "Upload image"}
                </Button>
                <span className="text-sm text-muted-foreground">or paste URL below</span>
              </div>
              {form.imageUrl && (
                <div className="mt-2">
                  <img
                    src={form.imageUrl}
                    alt="Event"
                    className="h-32 w-auto rounded-md border object-cover"
                  />
                </div>
              )}
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://cdn.example.com/events/event.jpg"
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                placeholder="e.g. Main Campus"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked === true }))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (show on customer portal banner)
              </Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-brand-green hover:bg-brand-green/90 text-white"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditMode ? "Save changes" : "Create event"}
              </Button>
              <Link to="/admin/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
