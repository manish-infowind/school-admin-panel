import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Plan, Feature } from "@/api/types";
import { Checkbox } from "@/components/ui/checkbox";

interface ManageFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (planId: number, featureIds: number[]) => void;
  isSaving: boolean;
  plan: Plan | null;
  allFeatures: Feature[];
}

export default function ManageFeaturesDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
  plan,
  allFeatures,
}: ManageFeaturesDialogProps) {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && plan) {
      // Use plan data from list (immediate, no API call needed)
      if (plan.features && plan.features.length > 0) {
        const featureIds = plan.features.map((f) => f.id);
        setSelectedFeatureIds(featureIds);
      } else {
        setSelectedFeatureIds([]);
      }
    } else if (!open) {
      // Clear when dialog closes
      setSelectedFeatureIds([]);
    }
  }, [open, plan?.id]);

  const toggleFeature = (featureId: number) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSave = () => {
    if (!plan) return;
    onSave(plan.id, selectedFeatureIds);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Features for {plan.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select features to associate with this plan. Changes will replace all existing associations.
          </p>
          <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
            {allFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features available</p>
            ) : (
              <div className="space-y-3">
                {allFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`manage-feature-${feature.id}`}
                      checked={selectedFeatureIds.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`manage-feature-${feature.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {feature.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {feature.key} {feature.description && `- ${feature.description}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Associations"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
