import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationService } from "@/api/services/locationService";
import { CollegeService, uploadCollegeImage } from "@/api/services/collegeService";
import { CourseService } from "@/api/services/courseService";
import type { Country, State, City, CreateCollegeRequest, CourseFee, College, Course } from "@/api/types";
import { INSTITUTION_TYPES } from "@/api/types";

const initialForm: CreateCollegeRequest & { countryId: string } = {
  name: "",
  countryId: "",
  stateId: "",
  cityId: "",
  stateName: "",
  cityName: "",
  locationDisplay: "",
  category: "Private",
};

const emptyCourseFee: CourseFee = { courseId: "", courseName: "", fee: "", feeAmount: undefined, feePeriod: "year" };

function mapCollegeToForm(c: College): (CreateCollegeRequest & { countryId: string }) {
  return {
    name: c.name,
    shortName: c.shortName,
    countryId: c.countryId,
    stateId: c.stateId,
    cityId: c.cityId,
    stateName: c.stateName,
    cityName: c.cityName,
    locationDisplay: c.locationDisplay,
    category: c.category as string,
    address: c.address,
    pinCode: c.pinCode,
    badge: c.badge,
    description: c.description,
    website: c.website,
    phone: c.phone,
    email: c.email,
    logoUrl: c.logoUrl,
    isActive: c.isActive,
    rating: c.rating,
    nirfRank: c.nirfRank,
    placementRate: c.placementRate,
    avgPackage: c.avgPackage,
    eligibility: c.eligibility,
  };
}

export default function AddCollege() {
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCollege, setLoadingCollege] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [courseFees, setCourseFees] = useState<CourseFee[]>([{ ...emptyCourseFee }]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    CourseService.list()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setCoursesList((res.data as Course[]).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)));
        else setCoursesList([]);
      })
      .catch(() => setCoursesList([]));
  }, []);

  useEffect(() => {
    setLoadingCountries(true);
    LocationService.getCountries()
      .then((res) => {
        if (res.success && res.data) setCountries(res.data);
      })
      .catch(() => toast({ title: "Error", description: "Failed to load countries", variant: "destructive" }))
      .finally(() => setLoadingCountries(false));
  }, [toast]);

  useEffect(() => {
    if (isEditMode && editId) {
      setLoadingCollege(true);
      CollegeService.getById(editId)
        .then((res) => {
          if (res.success && res.data) {
            const c = res.data;
            setForm(mapCollegeToForm(c));
            setCourseFees(
              c.courseFees?.length
                ? c.courseFees.map((cf) => ({
                    courseId: (cf as CourseFee & { courseId?: string }).courseId ?? "",
                    courseName: cf.courseName,
                    fee: cf.fee,
                    feeAmount: cf.feeAmount,
                    feePeriod: cf.feePeriod ?? "year",
                  }))
                : [{ ...emptyCourseFee }]
            );
          }
        })
        .catch(() => toast({ title: "Error", description: "College not found", variant: "destructive" }))
        .finally(() => setLoadingCollege(false));
    }
  }, [isEditMode, editId, toast]);

  useEffect(() => {
    if (!form.countryId) {
      setStates([]);
      if (!isEditMode) setForm((f) => ({ ...f, stateId: "", stateName: "", cityId: "", cityName: "", locationDisplay: "" }));
      return;
    }
    setLoadingStates(true);
    LocationService.getStates(form.countryId)
      .then((res) => {
        if (res.success && res.data) setStates(res.data);
        else setStates([]);
      })
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
    if (!isEditMode)
      setForm((f) => ({ ...f, stateId: "", stateName: "", cityId: "", cityName: "", locationDisplay: "" }));
  }, [form.countryId, isEditMode]);

  useEffect(() => {
    if (!form.stateId) {
      setCities([]);
      if (!isEditMode) setForm((f) => ({ ...f, cityId: "", cityName: "", locationDisplay: "" }));
      return;
    }
    setLoadingCities(true);
    LocationService.getCities(form.stateId)
      .then((res) => {
        if (res.success && res.data) setCities(res.data);
        else setCities([]);
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
    const state = states.find((s) => s._id === form.stateId);
    if (!isEditMode)
      setForm((f) => ({
        ...f,
        cityId: "",
        cityName: "",
        stateName: state?.name ?? "",
        locationDisplay: state?.name ?? "",
      }));
  }, [form.stateId, states, isEditMode]);

  useEffect(() => {
    if (!form.cityId || !form.stateName) return;
    const city = cities.find((c) => c._id === form.cityId);
    if (city)
      setForm((f) => ({ ...f, cityName: city.name, locationDisplay: `${city.name}, ${f.stateName}` }));
  }, [form.cityId, form.stateName, cities]);

  const onStateChange = (stateId: string) => {
    const state = states.find((s) => s._id === stateId);
    setForm((f) => ({
      ...f,
      stateId,
      stateName: state?.name ?? "",
      cityId: "",
      cityName: "",
      locationDisplay: state?.name ?? "",
    }));
  };

  const onCityChange = (cityId: string) => {
    const city = cities.find((c) => c._id === cityId);
    setForm((f) => ({
      ...f,
      cityId,
      cityName: city?.name ?? "",
      locationDisplay: city ? `${city.name}, ${f.stateName}` : f.locationDisplay,
    }));
  };

  const addCourseRow = () => setCourseFees((prev) => [...prev, { ...emptyCourseFee }]);
  const removeCourseRow = (index: number) =>
    setCourseFees((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  const updateCourseRow = (index: number, field: keyof CourseFee, value: string | number | undefined) => {
    setCourseFees((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

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
    if (url) setForm((f) => ({ ...f, logoUrl: url }));
    else toast({ title: "Upload failed", description: "Could not upload. Try again or paste URL.", variant: "destructive" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation", description: "College name is required", variant: "destructive" });
      return;
    }
    if (!form.countryId || !form.stateId || !form.cityId) {
      toast({ title: "Validation", description: "Please select country, state and city", variant: "destructive" });
      return;
    }
    if (!form.stateName || !form.cityName || !form.locationDisplay) {
      toast({ title: "Validation", description: "Location details are required", variant: "destructive" });
      return;
    }

    const hasCourseFees = courseFees.some((r) => r.courseId?.trim() || r.courseName?.trim());
    const payload: Omit<CreateCollegeRequest, "countryId"> & { countryId?: string } = {
      ...form,
      countryId: undefined,
    };
    delete (payload as { countryId?: string }).countryId;

    if (hasCourseFees) {
      payload.courseFees = courseFees
        .filter((r) => r.courseId?.trim() || r.courseName?.trim())
        .map((r) => {
          const name = r.courseName?.trim() || coursesList.find((c) => c._id === r.courseId)?.name || "";
          return {
            ...(r.courseId ? { courseId: r.courseId } : undefined),
            courseName: name,
            ...(r.fee ? { fee: r.fee } : undefined),
            ...(r.feeAmount != null ? { feeAmount: r.feeAmount } : undefined),
            ...(r.feePeriod ? { feePeriod: r.feePeriod } : undefined),
          };
        });
      delete payload.fee;
      delete payload.feeAmount;
      delete payload.feePeriod;
    }

    setSubmitting(true);
    try {
      if (isEditMode && editId) {
        const res = await CollegeService.update(editId, payload as CreateCollegeRequest);
        if (res.success && res.data) {
          toast({ title: "Success", description: "College updated successfully" });
          navigate(`/admin/colleges/${editId}`, { replace: true });
        } else {
          toast({ title: "Error", description: "Failed to update college", variant: "destructive" });
        }
      } else {
        const res = await CollegeService.create(payload as CreateCollegeRequest);
        if (res.success && res.data) {
          toast({ title: "Success", description: "College created successfully" });
          navigate("/admin/colleges", { replace: true });
        } else {
          toast({ title: "Error", description: "Failed to create college", variant: "destructive" });
        }
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : (isEditMode ? "Failed to update college" : "Failed to create college");
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loadingCollege) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={isEditMode && editId ? `/admin/colleges/${editId}` : "/admin/colleges"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
            {isEditMode ? "Edit College" : "Add College"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? "Update college details" : "Create a new college or institution"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">College name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. IIT Bombay"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short name</Label>
                <Input
                  id="shortName"
                  value={form.shortName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value || undefined }))}
                  placeholder="e.g. IITB"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Institution type *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. Private, Government" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select
                  value={form.countryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, countryId: v }))}
                  disabled={loadingCountries}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select
                  value={form.stateId}
                  onValueChange={onStateChange}
                  disabled={!form.countryId || loadingStates}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select
                  value={form.cityId}
                  onValueChange={onCityChange}
                  disabled={!form.stateId || loadingCities}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.locationDisplay && (
              <div className="space-y-2">
                <Label>Location display</Label>
                <Input value={form.locationDisplay} readOnly className="bg-muted" />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || undefined }))}
                  placeholder="Street, area"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode">Pin code</Label>
                <Input
                  id="pinCode"
                  value={form.pinCode ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, pinCode: e.target.value || undefined }))}
                  placeholder="e.g. 400076"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses & fees</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add each course with optional fee. Backend will set courses from these rows. Omit top-level fee when using this.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseFees.map((row, index) => (
              <div key={index} className="grid gap-4 grid-cols-1 md:grid-cols-12 items-end border rounded-lg p-4">
                <div className="md:col-span-3 space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={row.courseId || (row.courseName && coursesList.find((c) => c.name === row.courseName)?._id) || ""}
                    onValueChange={(value) => {
                      const course = coursesList.find((c) => c._id === value);
                      setCourseFees((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, courseId: value, courseName: course?.name ?? r.courseName }
                            : r
                        )
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesList.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Fee (display)</Label>
                  <Input
                    placeholder="₹2.5L/yr"
                    value={row.fee ?? ""}
                    onChange={(e) => updateCourseRow(index, "fee", e.target.value || undefined)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Fee amount (number)</Label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={row.feeAmount ?? ""}
                    onChange={(e) => updateCourseRow(index, "feeAmount", e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={row.feePeriod ?? "year"}
                    onValueChange={(v) => updateCourseRow(index, "feePeriod", v as "year" | "semester")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="semester">Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCourseRow(index)}
                    disabled={courseFees.length <= 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCourseRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add course
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>College image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadingImage}
              onClick={() => imageInputRef.current?.click()}
            >
              {uploadingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploadingImage ? "Uploading..." : "Upload college image"}
            </Button>
            <Input
              placeholder="Or paste image URL"
              value={form.logoUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value || undefined }))}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={form.badge ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value || undefined }))}
                  placeholder="e.g. NIRF #1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value || undefined }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))}
                  placeholder="info@college.ac.in"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))}
                  placeholder="+91..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1–5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.rating ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nirfRank">NIRF rank</Label>
                <Input
                  id="nirfRank"
                  type="number"
                  min={1}
                  value={form.nirfRank ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, nirfRank: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placementRate">Placement rate (%)</Label>
                <Input
                  id="placementRate"
                  type="number"
                  min={0}
                  max={100}
                  value={form.placementRate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, placementRate: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 98"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgPackage">Avg package</Label>
                <Input
                  id="avgPackage"
                  value={form.avgPackage ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, avgPackage: e.target.value || undefined }))}
                  placeholder="e.g. ₹18 LPA"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || undefined }))}
                placeholder="Brief description of the college"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eligibility">Eligibility</Label>
              <textarea
                id="eligibility"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.eligibility ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, eligibility: e.target.value || undefined }))}
                placeholder="Eligibility criteria"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green/90">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update College"
            ) : (
              "Create College"
            )}
          </Button>
          <Link to={isEditMode && editId ? `/admin/colleges/${editId}` : "/admin/colleges"}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
