import { useState } from "react";
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
import { CreatePlanRequest, Feature } from "@/api/types";
import { Checkbox } from "@/components/ui/checkbox";

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreatePlanRequest) => void;
  isCreating: boolean;
  allFeatures: Feature[];
}

export default function CreatePlanDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating,
  allFeatures,
}: CreatePlanDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreatePlanRequest>({
    code: "",
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

  const handleCreate = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Code and name are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.priceCents < 0) {
      toast({
        title: "Error",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Validate code format
    if (!/^[a-z0-9_]+$/.test(formData.code)) {
      toast({
        title: "Error",
        description: "Code must contain only lowercase letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }

    onCreate(formData);
  };

  const handleClose = () => {
    setFormData({
      code: "",
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Plan Code *</Label>
            <Input
              id="code"
              placeholder="e.g., premium"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toLowerCase() })
              }
              pattern="[a-z0-9_]+"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lowercase letters, numbers, and underscores only. Cannot be changed after creation.
            </p>
          </div>
          <div>
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Premium Plan"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceCents">Price (in cents) *</Label>
              <Input
                id="priceCents"
                type="number"
                value={formData.priceCents}
                onChange={(e) =>
                  setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: 999 = ₹9.99
              </p>
            </div>
            <div>
              <Label htmlFor="interval">Billing Interval *</Label>
              <select
                id="interval"
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
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                }
                maxLength={3}
                pattern="[A-Z]{3}"
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
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
            <Label htmlFor="stripePriceId">Stripe Price ID</Label>
            <Input
              id="stripePriceId"
              value={formData.stripePriceId}
              onChange={(e) =>
                setFormData({ ...formData, stripePriceId: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaLabel">CTA Label</Label>
              <Input
                id="ctaLabel"
                value={formData.ctaLabel}
                onChange={(e) =>
                  setFormData({ ...formData, ctaLabel: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
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
                        id={`feature-${feature.id}`}
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
                        htmlFor={`feature-${feature.id}`}
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
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
