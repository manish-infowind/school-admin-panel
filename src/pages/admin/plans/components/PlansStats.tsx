import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle2, XCircle } from "lucide-react";

interface PlansStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  } | null;
}

function PlansStats({ stats }: PlansStatsProps) {
  console.log('[PlansStats] Component render - stats:', stats);
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inactive}</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when stats haven't changed
export default memo(PlansStats, (prevProps, nextProps) => {
  if (!prevProps.stats || !nextProps.stats) {
    return prevProps.stats === nextProps.stats;
  }
  return (
    prevProps.stats.total === nextProps.stats.total &&
    prevProps.stats.active === nextProps.stats.active &&
    prevProps.stats.inactive === nextProps.stats.inactive
  );
});
