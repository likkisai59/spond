import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  string,
  "success" | "warning" | "destructive" | "secondary" | "accent"
> = {
  Paid: "success",
  Active: "success",
  Ongoing: "success",
  Going: "success",
  Pending: "warning",
  Invited: "warning",
  Maybe: "warning",
  Upcoming: "accent",
  Overdue: "destructive",
  Cancelled: "destructive",
  Inactive: "secondary",
  Completed: "secondary",
  Closed: "secondary",
  "No response": "secondary",
  Requested: "warning",
  Confirmed: "success",
  Available: "success",
  Limited: "warning",
  Booked: "secondary",
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"} className={className}>
      {status}
    </Badge>
  );
}
