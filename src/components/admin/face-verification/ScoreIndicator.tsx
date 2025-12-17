import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreIndicatorProps {
  score: number | string;
  maxScore?: number;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  className?: string;
}

export function ScoreIndicator({
  score,
  maxScore = 100,
  label,
  color = 'primary',
  showValue = true,
  className,
}: ScoreIndicatorProps) {
  // Convert score to number if it's a string
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  const percentage = Math.min((numericScore / maxScore) * 100, 100);

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const getColorByScore = (scoreValue: number) => {
    if (scoreValue >= 90) return 'success';
    if (scoreValue >= 80) return 'primary';
    if (scoreValue >= 70) return 'warning';
    return 'danger';
  };

  const finalColor = color === 'primary' ? getColorByScore(numericScore) : color;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showValue && (
          <span className={cn('font-semibold', {
            'text-green-600 dark:text-green-400': finalColor === 'success',
            'text-blue-600 dark:text-blue-400': finalColor === 'primary',
            'text-yellow-600 dark:text-yellow-400': finalColor === 'warning',
            'text-red-600 dark:text-red-400': finalColor === 'danger',
          })}>
            {numericScore.toFixed(1)}%
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className="h-2"
      />
    </div>
  );
}

