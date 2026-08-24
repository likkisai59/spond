"use client";

import { UserX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { memberRemoved } from "@/store/sports/groups-slice";
import { StatusBadge } from "./status-badge";
import { getInitials } from "@/utils/helpers";
import type { GroupMember } from "@/types";
import { cn } from "@/utils/cn";

export interface MemberCardProps {
  member: GroupMember;
  groupId: string;
  canManage?: boolean;
  className?: string;
}

export function MemberCard({
  member,
  groupId,
  canManage = true,
  className,
}: MemberCardProps) {
  const dispatch = useAppDispatch();

  const handleInvite = () => {
    dispatch(
      notificationAdded({
        title: "Invite triggered",
        message: `Invitation flow for ${member.name} will be wired to the messaging service.`,
        variant: "info",
      })
    );
  };

  const handleRemove = () => {
    dispatch(memberRemoved({ groupId, memberId: member.id }));
    dispatch(
      notificationAdded({
        title: "Member removed",
        message: `${member.name} was removed from the group (demo mode).`,
        variant: "warning",
      })
    );
  };

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 animate-fade-in-up", className)}
    >
      <div className="flex items-center gap-3.5">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold">{member.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Badge variant="accent">{member.role}</Badge>
        <StatusBadge status={member.status} />
      </div>

      {canManage ? (
        <div className="mt-auto flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-full"
            onClick={handleInvite}
            disabled={member.status === "Active"}
          >
            Invite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemove}
            aria-label={`Remove ${member.name}`}
          >
            <UserX />
            Remove
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
