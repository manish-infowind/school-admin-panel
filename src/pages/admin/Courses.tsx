import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageLoader from "@/components/common/PageLoader";
import { useToast } from "@/hooks/use-toast";
import { CourseService } from "@/api/services/courseService";
import type { Course, CreateCourseRequest } from "@/api/types";

const initialForm: CreateCourseRequest = {
  name: "",
  isActive: true,
  sortOrder: 0,
};

export default function Courses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCourseRequest>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await CourseService.list();
      if (res.success && Array.isArray(res.data)) {
        const list = res.data as Course[];
        list.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        setCourses(list);
      } else {
        setCourses([]);
      }
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? (e as { message: string }).message : "Failed to load courses";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingId(course._id);
    setForm({
      name: course.name,
      isActive: course.isActive !== false,
      sortOrder: course.sortOrder ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation", description: "Course name is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await CourseService.update(editingId, {
          name: form.name.trim(),
          isActive: form.isActive,
          sortOrder: form.sortOrder,
        });
        if (res.success) {
          toast({ title: "Success", description: "Course updated" });
          setDialogOpen(false);
          await fetchCourses();
        } else {
          toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
        }
      } else {
        const res = await CourseService.create({
          name: form.name.trim(),
          isActive: form.isActive,
          sortOrder: form.sortOrder,
        });
        if (res.success) {
          toast({ title: "Success", description: "Course created" });
          setDialogOpen(false);
          await fetchCourses();
        } else {
          toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
        }
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Request failed";
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Permanently delete "${course.name}"?`)) return;
    setDeletingId(course._id);
    try {
      const res = await CourseService.remove(course._id);
      if (res.success) {
        toast({ title: "Success", description: "Course deleted" });
        await fetchCourses();
      } else {
        toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Courses"
        subHeading="Manage courses for college filters and listings"
        page="courses"
        openModal={openAdd}
      />
      <div className="flex items-center gap-4">
        <Button className="bg-brand-green hover:bg-brand-green/90 text-white" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {loading ? (
        <PageLoader pagename="courses" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Slug</th>
                    <th className="text-left p-4 font-medium">Order</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 font-medium">{course.name}</td>
                      <td className="p-4 text-muted-foreground">{course.slug}</td>
                      <td className="p-4">{course.sortOrder ?? "—"}</td>
                      <td className="p-4">
                        {course.isActive !== false ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(course)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Delete"
                          onClick={() => handleDelete(course)}
                          disabled={deletingId === course._id}
                        >
                          {deletingId === course._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {courses.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No courses yet. Add one to get started.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit course" : "Add course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Name *</Label>
              <Input
                id="course-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. B.Tech, MBA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-sortOrder">Sort order</Label>
              <Input
                id="course-sortOrder"
                type="number"
                value={form.sortOrder ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value ? Number(e.target.value) : 0 }))}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="course-active"
                checked={form.isActive !== false}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-input"
              />
              <Label htmlFor="course-active" className="font-normal cursor-pointer">
                Active (show in consumer dropdown)
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green/90">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : editingId ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
