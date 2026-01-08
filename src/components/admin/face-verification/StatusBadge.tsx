import { Badge } from '@/components/ui/badge';
import { ComputedStatus, VerificationStatus } from '@/api/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComputedStatus | VerificationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Handle both computed status (Success/Failed/Pending/Processing) and verification status
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    // Computed status values
    Success: {
      label: 'Success',
      variant: 'default',
      className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400',
    },
    Failed: {
      label: 'Failed',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400',
    },
    Pending: {
      label: 'Pending',
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    Processing: {
      label: 'Processing',
      variant: 'default',
      className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400',
    },
    // Legacy verification status values (for backward compatibility)
    pending: {
      label: 'Pending',
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    processing: {
      label: 'Processing',
      variant: 'default',
      className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400',
    },
    success: {
      label: 'Success',
      variant: 'default',
      className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400',
    },
    failed: {
      label: 'Failed',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400',
    },
    timeout: {
      label: 'Timeout',
      variant: 'outline',
      className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400',
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'outline',
      className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400',
    },
  };

  const config = statusConfig[status] || statusConfig.Failed;

  return (
    <Badge
      variant={config.variant}
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

