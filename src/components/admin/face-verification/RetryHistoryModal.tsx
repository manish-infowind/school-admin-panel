import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useRetryHistory } from '@/api/hooks/useFaceVerification';
import { StatusBadge } from './StatusBadge';
import { ScoreIndicator } from './ScoreIndicator';
import { VideoPlayer } from './VideoPlayer';
import { ImageGallery } from './ImageGallery';
import { format } from 'date-fns';
import { RetryAttempt } from '@/api/types';

interface RetryHistoryModalProps {
  groupId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RetryHistoryModal({ groupId, isOpen, onClose }: RetryHistoryModalProps) {
  const { data: historyData, isLoading, error } = useRetryHistory(groupId);

  if (!groupId) return null;

  const history = historyData?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Retry History</DialogTitle>
          <DialogDescription>
            {history && (
              <>
                Group ID: {history.verificationGroupId} | Total Attempts: {history.totalRetries}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load retry history</p>
          </div>
        ) : !history || history.attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No retry history found</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Summary Section */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h3 className="font-semibold text-lg mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Final Status:</span>{' '}
                  <StatusBadge status={history.finalStatus} />
                </div>
                <div>
                  <span className="text-muted-foreground">Final Score:</span>{' '}
                  <span className="font-semibold">
                    {typeof history.finalOverallScore === 'string' 
                      ? parseFloat(history.finalOverallScore).toFixed(1) 
                      : history.finalOverallScore.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Final Confidence:</span>{' '}
                  <span className="font-semibold">
                    {typeof history.finalConfidence === 'string' 
                      ? parseFloat(history.finalConfidence).toFixed(1) 
                      : history.finalConfidence.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Is Verified:</span>{' '}
                  <Badge variant={history.finalIsVerified ? 'default' : 'secondary'}>
                    {history.finalIsVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Attempts List */}
            <div>
              <h3 className="font-semibold text-lg mb-4">All Attempts ({history.attempts.length})</h3>
              {history.attempts.map((attempt: RetryAttempt) => {
              const numericScore = typeof attempt.overallScore === 'string' 
                ? parseFloat(attempt.overallScore) 
                : attempt.overallScore;
              const numericConfidence = typeof attempt.confidence === 'string' 
                ? parseFloat(attempt.confidence) 
                : attempt.confidence;

              return (
                <div
                  key={attempt.id}
                  className="border rounded-lg p-4 space-y-4 mb-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {attempt.attemptNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold">Attempt {attempt.attemptNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(attempt.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={attempt.status} />
                      <Badge variant={attempt.isVerified ? 'default' : 'secondary'}>
                        {attempt.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ScoreIndicator
                      score={numericScore}
                      label="Overall Score"
                      showValue={true}
                    />
                    <ScoreIndicator
                      score={numericConfidence}
                      label="Confidence"
                      showValue={true}
                    />
                  </div>

                  {attempt.videoUrl && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Verification Video</h5>
                      <VideoPlayer videoUrl={attempt.videoUrl} />
                    </div>
                  )}

                  {attempt.sourceImages && attempt.sourceImages.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Source Images ({attempt.sourceImages.length})</h5>
                      <ImageGallery images={attempt.sourceImages} />
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                    {attempt.requestId && <p><strong>Request ID:</strong> {attempt.requestId}</p>}
                    {attempt.matchCount !== undefined && attempt.totalComparisons !== undefined && (
                      <p><strong>Matches:</strong> {attempt.matchCount} / {attempt.totalComparisons}</p>
                    )}
                    {attempt.totalProcessingTime && (
                      <p><strong>Processing Time:</strong> {attempt.totalProcessingTime}ms</p>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

