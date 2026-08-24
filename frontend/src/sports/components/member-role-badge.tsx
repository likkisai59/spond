import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { MemberRole } from "@/types";

const ROLE_VARIANTS: Record<MemberRole, BadgeProps["variant"]> = {
  Owner: "gradient",
  Admin: "accent",
  Coach: "success",
  Treasurer: "warning",
  Member: "secondary",
};

export interface MemberRoleBadgeProps {
  role: MemberRole;
  className?: string;
}

export function MemberRoleBadge({ role, className }: MemberRoleBadgeProps) {
  return (
    <Badge variant={ROLE_VARIANTS[role]} className={className}>
      {role}
    </Badge>
  );
}
