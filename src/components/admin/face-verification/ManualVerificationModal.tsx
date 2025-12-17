import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useManualVerification } from '@/api/hooks/useFaceVerification';
import { Badge } from '@/components/ui/badge';

interface ManualVerificationModalProps {
  userId: number;
  userName: string;
  userEmail: string;
  currentStatus: boolean;
  isAccountPaused?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualVerificationModal({
  userId,
  userName,
  userEmail,
  currentStatus,
  isAccountPaused = false,
  isOpen,
  onClose,
  onSuccess,
}: ManualVerificationModalProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const manualVerificationMutation = useManualVerification();

  const handleSubmit = async (isVerified: boolean) => {
    try {
      await manualVerificationMutation.mutateAsync({
        userId,
        data: {
          isVerified,
          adminNotes: adminNotes.trim() || undefined,
        },
      });
      setAdminNotes('');
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleClose = () => {
    if (!manualVerificationMutation.isPending) {
      setAdminNotes('');
      onClose();
    }
  };

  // Account paused warning
  if (isAccountPaused) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Paused</DialogTitle>
            <DialogDescription>
              This user's account is paused. Please review the user's location and gender data first.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This user's account is paused. Please review the user's location and gender data first before performing face verification action.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Face Verification</DialogTitle>
          <DialogDescription>
            Manually verify or de-verify this user's face verification status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Information */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium text-muted-foreground">User Information</p>
            <p className="font-semibold text-lg">{userName}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge variant={currentStatus ? 'default' : 'secondary'} className={currentStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {currentStatus ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this verification action..."
              maxLength={500}
              rows={4}
              disabled={manualVerificationMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {adminNotes.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={manualVerificationMutation.isPending}
            >
              Cancel
            </Button>
            {!currentStatus && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleSubmit(true)}
                disabled={manualVerificationMutation.isPending}
              >
                {manualVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify User
                  </>
                )}
              </Button>
            )}
            {currentStatus && (
              <Button
                variant="destructive"
                onClick={() => handleSubmit(false)}
                disabled={manualVerificationMutation.isPending}
              >
                {manualVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    De-verifying...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    De-verify User
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

