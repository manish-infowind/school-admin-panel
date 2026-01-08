import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FaceVerification, ApprovalData } from '@/api/types';
import { Loader2 } from 'lucide-react';

interface ApprovalModalProps {
  verification: FaceVerification | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: ApprovalData) => void;
  onReject: (data: ApprovalData) => void;
  isLoading?: boolean;
}

export function ApprovalModal({
  verification,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
}: ApprovalModalProps) {
  const [isApproved, setIsApproved] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [overrideScore, setOverrideScore] = useState<string>('');
  const [overrideConfidence, setOverrideConfidence] = useState<string>('');

  if (!verification) return null;

  // Helper to convert score to number
  const getNumericScore = (score: number | string): number => {
    return typeof score === 'string' ? parseFloat(score) : score;
  };

  const handleSubmit = () => {
    const data: ApprovalData = {
      isApproved,
      adminNotes: adminNotes.trim() || undefined,
      overrideScore: overrideScore ? parseFloat(overrideScore) : undefined,
      overrideConfidence: overrideConfidence ? parseFloat(overrideConfidence) : undefined,
    };

    if (isApproved) {
      onApprove(data);
    } else {
      onReject(data);
    }
  };

  const handleClose = () => {
    setIsApproved(true);
    setAdminNotes('');
    setOverrideScore('');
    setOverrideConfidence('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isApproved ? 'Approve' : 'Reject'} Verification
          </DialogTitle>
          <DialogDescription>
            Review and {isApproved ? 'approve' : 'reject'} the face verification for{' '}
            {verification.user.firstName} {verification.user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="approval-toggle">Action</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Reject</span>
                <Switch
                  id="approval-toggle"
                  checked={isApproved}
                  onCheckedChange={setIsApproved}
                />
                <span className="text-sm text-muted-foreground">Approve</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-notes">
              Admin Notes {!isApproved && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="admin-notes"
              placeholder={
                isApproved
                  ? 'Optional notes about this approval...'
                  : 'Please provide a reason for rejection...'
              }
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="override-score">Override Score (0-100)</Label>
              <Input
                id="override-score"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder={getNumericScore(verification.overallScore).toFixed(1)}
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="override-confidence">Override Confidence (0-100)</Label>
              <Input
                id="override-confidence"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder={getNumericScore(verification.confidence).toFixed(1)}
                value={overrideConfidence}
                onChange={(e) => setOverrideConfidence(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Current Scores</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Overall Score: </span>
                <span className="font-semibold">{getNumericScore(verification.overallScore).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence: </span>
                <span className="font-semibold">{getNumericScore(verification.confidence).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!isApproved && !adminNotes.trim())}
            variant={isApproved ? 'default' : 'destructive'}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isApproved ? 'Approve' : 'Reject'} Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

