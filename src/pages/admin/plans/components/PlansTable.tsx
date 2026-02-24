import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreVertical,
  Package,
  Link as LinkIcon,
} from "lucide-react";
import { Plan } from "@/api/types";
import { format } from "date-fns";

interface PlansTableProps {
  plans: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onManageFeatures: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
  isTogglingStatus: boolean;
}

function PlansTable({
  plans,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  onManageFeatures,
  onToggleStatus,
  isTogglingStatus,
}: PlansTableProps) {
  console.log('[PlansTable] Component render - plans count:', plans.length, 'currentPage:', currentPage);
  
  const formatPrice = (cents: number) => {
    return `₹${(cents / 100).toFixed(2)}`;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <Package className="h-12 w-12 mb-4" />
                    <p>No plans found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-mono text-sm">{plan.code}</TableCell>
                  <TableCell className="font-medium">
                    {plan.name}
                    {plan.badge && (
                      <Badge variant="secondary" className="ml-2">
                        {plan.badge}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(plan.priceCents)}</TableCell>
                  <TableCell className="capitalize">{plan.interval}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan.features?.length || 0} features
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "secondary" : "outline"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(plan.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onManageFeatures(plan)}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Manage Features
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleStatus(plan)}
                          disabled={isTogglingStatus}
                        >
                          {plan.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
            {pagination.total} plans
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!pagination.hasPrevPage || currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders when props haven't changed
export default memo(PlansTable, (prevProps, nextProps) => {
  // Only re-render if these props actually change
  return (
    prevProps.plans.length === nextProps.plans.length &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.pagination.total === nextProps.pagination.total &&
    prevProps.isTogglingStatus === nextProps.isTogglingStatus &&
    JSON.stringify(prevProps.plans.map(p => p.id)) === JSON.stringify(nextProps.plans.map(p => p.id))
  );
});
