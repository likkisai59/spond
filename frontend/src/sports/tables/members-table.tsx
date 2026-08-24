"use client";

import { UserX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/tables";
import { StatusBadge } from "../components/status-badge";
import { formatDate } from "@/utils/date";
import { getInitials } from "@/utils/helpers";
import type { GroupMember } from "@/types";

export interface MembersTableProps {
  members: GroupMember[];
  groupId: string;
  onRemove?: (memberId: string) => void;
}

export function MembersTable({ members, groupId, onRemove }: MembersTableProps) {
  const columns: DataTableColumn<GroupMember>[] = [
    {
      key: "name",
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{member.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {member.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (member) => <Badge variant="secondary">{member.role}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (member) => <StatusBadge status={member.status} />,
    },
    {
      key: "joinedAt",
      header: "Joined",
      render: (member) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(member.joinedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (member) =>
        member.role === "Owner" ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove?.(member.id)}
            aria-label={`Remove ${member.name} from group ${groupId}`}
          >
            <UserX />
            Remove
          </Button>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={members}
      rowKey={(member) => member.id}
      emptyTitle="No members yet"
      emptyDescription="Invite people and they will appear here once they join."
    />
  );
}
