"use client";

import { useState } from "react";
import { UserX, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { memberRemoved, addMemberThunk } from "@/store/sports/groups-slice";
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
  const [isResending, setIsResending] = useState(false);

  const isOwner = member.role?.toLowerCase() === "owner";
  const isPendingOrInvited =
    member.status?.toLowerCase() === "pending" ||
    member.status?.toLowerCase() === "invited";

  const handleResendInvite = async () => {
    if (!member.email) {
      dispatch(
        notificationAdded({
          title: "Cannot resend",
          message: "No email address found for this member.",
          variant: "error",
        })
      );
      return;
    }

    try {
      setIsResending(true);
      await dispatch(
        addMemberThunk({
          groupId,
          input: {
            name: member.name,
            email: member.email,
            role: member.role,
          },
        })
      ).unwrap();

      dispatch(
        notificationAdded({
          title: "Invitation resent",
          message: `A fresh invitation email has been sent to ${member.email}.`,
          variant: "success",
        })
      );
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Failed to resend",
          message: error?.message || "Could not resend invitation email.",
          variant: "error",
        })
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleRemove = () => {
    dispatch(memberRemoved({ groupId, memberId: member.id }));
    dispatch(
      notificationAdded({
        title: "Member removed",
        message: `${member.name} was removed from the group.`,
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

      {canManage && !isOwner ? (
        <div className="mt-auto flex gap-2 pt-4">
          {isPendingOrInvited ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full text-xs font-semibold"
              onClick={handleResendInvite}
              disabled={isResending}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {isResending ? "Sending…" : "Resend"}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive",
              !isPendingOrInvited && "w-full justify-center"
            )}
            onClick={handleRemove}
            aria-label={`Remove ${member.name}`}
          >
            <UserX className="h-4 w-4" />
            Remove
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
