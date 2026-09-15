"use client";

import { Check, HelpCircle, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type DataTableColumn } from "@/components/tables";
import { AttendanceBadge } from "../components/attendance-badge";
import { getInitials } from "@/utils/helpers";
import type { AttendanceResponse } from "@/types";
import { cn } from "@/utils/cn";

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  response: AttendanceResponse;
}

export interface AttendanceTableProps {
  records: AttendanceRecord[];
  onSetResponse?: (memberId: string, response: AttendanceResponse) => void;
  readOnly?: boolean;
}

const RESPONSE_ACTIONS: {
  response: AttendanceResponse;
  icon: typeof Check;
  activeClass: string;
}[] = [
  {
    response: "Present",
    icon: Check,
    activeClass: "bg-emerald-500 text-white",
  },
  {
    response: "Absent",
    icon: X,
    activeClass: "bg-rose-500 text-white",
  },
];

export function AttendanceTable({ records, onSetResponse, readOnly }: AttendanceTableProps) {
  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      key: "memberName",
      header: "Member",
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(record.memberName)}</AvatarFallback>
          </Avatar>
          <p className="min-w-0 truncate text-sm font-bold">
            {record.memberName}
          </p>
        </div>
      ),
    },
    {
      key: "response",
      header: "Response",
      render: (record) => <AttendanceBadge response={record.response} />,
    },
    {
      key: "actions",
      header: "Mark",
      className: "text-right",
      render: (record) =>
        onSetResponse ? (
          <div className="flex justify-end gap-1.5">
            {RESPONSE_ACTIONS.map(({ response, icon: Icon, activeClass }) => {
              const active =
                record.response === response ||
                (response === "Present" && record.response === "Going") ||
                (response === "Absent" && (record.response === "No response" || record.response === "Maybe"));
              return (
                <button
                  key={response}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && onSetResponse(record.memberId, response)}
                  aria-label={`Mark ${record.memberName} as ${response}`}
                  aria-pressed={active}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    active
                      ? cn("border-transparent", activeClass)
                      : "border-border/70 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                    readOnly && "cursor-not-allowed opacity-60 hover:border-border/70 hover:text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      rowKey={(record) => record.memberId}
      emptyTitle="No members to track"
      emptyDescription="Members of this group will appear here."
    />
  );
}
