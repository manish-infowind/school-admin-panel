import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Plan } from "@/api/types";

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
  plan: Plan | null;
}

export default function DeletePlanDialog({
  open,
  onOpenChange,
  onDelete,
  isDeleting,
  plan,
}: DeletePlanDialogProps) {
  console.log('[DeletePlanDialog] Component render - open:', open, 'plan:', plan?.id, 'isDeleting:', isDeleting);
  
  const handleDelete = () => {
    console.log('[DeletePlanDialog] Handle delete called');
    onDelete();
  };
  
  const handleClose = (open: boolean) => {
    console.log('[DeletePlanDialog] Handle close called - open:', open);
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the plan <strong>{plan?.name}</strong>?
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This will soft delete the plan (set as inactive).
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
