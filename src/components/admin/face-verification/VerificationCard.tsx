import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';
import { ScoreIndicator } from './ScoreIndicator';
import { FaceVerification } from '@/api/types';
import { Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VerificationCardProps {
  verification: FaceVerification;
  onViewDetails: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function VerificationCard({
  verification,
  onViewDetails,
  onApprove,
  onReject,
}: VerificationCardProps) {
  const user = verification.user;
  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.phone}</p>
            </div>
          </div>
          <StatusBadge status={verification.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ScoreIndicator
            score={verification.overallScore}
            label="Overall Score"
            showValue={true}
          />
          <ScoreIndicator
            score={verification.confidence}
            label="Confidence"
            showValue={true}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(verification.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div>
            {verification.matchCount}/{verification.totalComparisons} matches
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(verification.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {verification.status === 'Pending' && (
            <>
              {onApprove && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onApprove(verification.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onReject(verification.id)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

