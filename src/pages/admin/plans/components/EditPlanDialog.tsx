import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Plan, UpdatePlanRequest, Feature } from "@/api/types";
import { Checkbox } from "@/components/ui/checkbox";

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: number, data: UpdatePlanRequest) => void;
  isUpdating: boolean;
  plan: Plan | null;
  allFeatures: Feature[];
}

export default function EditPlanDialog({
  open,
  onOpenChange,
  onUpdate,
  isUpdating,
  plan,
  allFeatures,
}: EditPlanDialogProps) {
  console.log('[EditPlanDialog] Component render - open:', open, 'plan:', plan?.id, 'isUpdating:', isUpdating);
  
  const { toast } = useToast();
  const [formData, setFormData] = useState<UpdatePlanRequest>({
    name: "",
    priceCents: 0,
    interval: "month",
    currency: "INR",
    stripePriceId: "",
    ctaLabel: "",
    badge: "",
    sortOrder: 0,
    isActive: true,
    featureIds: [],
  });

  useEffect(() => {
    console.log('[EditPlanDialog] useEffect triggered - plan:', plan?.id, 'open:', open);
    if (plan && open) {
      console.log('[EditPlanDialog] Setting form data from plan:', plan.id);
      setFormData({
        name: plan.name,
        priceCents: plan.priceCents,
        interval: plan.interval,
        currency: plan.currency,
        stripePriceId: plan.stripePriceId || "",
        ctaLabel: plan.ctaLabel || "",
        badge: plan.badge || "",
        sortOrder: plan.sortOrder,
        isActive: plan.isActive,
        featureIds: plan.features?.map((f) => f.id) || [],
      });
    }
  }, [plan, open]);

  const handleUpdate = () => {
    console.log('[EditPlanDialog] Handle update called - plan:', plan?.id, 'formData:', formData);
    if (!plan || !formData.name.trim()) {
      console.log('[EditPlanDialog] Validation failed - name required');
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.priceCents < 0) {
      console.log('[EditPlanDialog] Validation failed - price invalid');
      toast({
        title: "Error",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    console.log('[EditPlanDialog] Calling onUpdate');
    onUpdate(plan.id, formData);
  };

  const handleClose = () => {
    console.log('[EditPlanDialog] Handle close called');
    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Plan Code</Label>
            <Input
              value={plan.code || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Code cannot be changed after creation
            </p>
          </div>
          <div>
            <Label htmlFor="edit-name">Plan Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-priceCents">Price (in cents) *</Label>
              <Input
                id="edit-priceCents"
                type="number"
                value={formData.priceCents}
                onChange={(e) =>
                  setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="edit-interval">Billing Interval *</Label>
              <select
                id="edit-interval"
                value={formData.interval}
                onChange={(e) =>
                  setFormData({ ...formData, interval: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-currency">Currency</Label>
              <Input
                id="edit-currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                }
                maxLength={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-stripePriceId">Stripe Price ID</Label>
            <Input
              id="edit-stripePriceId"
              value={formData.stripePriceId}
              onChange={(e) =>
                setFormData({ ...formData, stripePriceId: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-ctaLabel">CTA Label</Label>
              <Input
                id="edit-ctaLabel"
                value={formData.ctaLabel}
                onChange={(e) =>
                  setFormData({ ...formData, ctaLabel: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-badge">Badge</Label>
              <Input
                id="edit-badge"
                value={formData.badge}
                onChange={(e) =>
                  setFormData({ ...formData, badge: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Associated Features</Label>
            <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
              {allFeatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No features available</p>
              ) : (
                <div className="space-y-2">
                  {allFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-feature-${feature.id}`}
                        checked={formData.featureIds?.includes(feature.id) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              featureIds: [...(formData.featureIds || []), feature.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              featureIds: formData.featureIds?.filter((id) => id !== feature.id) || [],
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`edit-feature-${feature.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {feature.name} ({feature.key})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="edit-isActive">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
