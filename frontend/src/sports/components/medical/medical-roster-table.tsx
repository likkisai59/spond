"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Clock, FileText, Stethoscope, XCircle } from "lucide-react";
import { formatDate } from "@/utils/date";
import type { PCMAPlayerSummary } from "@/types";
import { cn } from "@/utils/cn";

interface MedicalRosterTableProps {
  roster: PCMAPlayerSummary[];
  onAssess: (player: PCMAPlayerSummary) => void;
  onViewCertificate: (player: PCMAPlayerSummary) => void;
  onFillQuestionnaire: (player: PCMAPlayerSummary) => void;
  isDoctorOrAdmin: boolean;
  currentUserId?: string;
}

export function MedicalRosterTable({
  roster,
  onAssess,
  onViewCertificate,
  onFillQuestionnaire,
  isDoctorOrAdmin,
  currentUserId,
}: MedicalRosterTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Cleared":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Cleared
          </Badge>
        );
      case "Unfit":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1">
            <XCircle className="h-3 w-3" />
            Unfit
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-zinc-500/15 text-zinc-500 border-zinc-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
          <tr>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Medical Clearance</th>
            <th className="py-3 px-4">Questionnaire</th>
            <th className="py-3 px-4">Assessing Doctor</th>
            <th className="py-3 px-4">Expires</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {roster.map((player) => {
            const isSelf = currentUserId === player.playerId;
            return (
              <tr key={player.playerId} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-foreground">{player.playerName}</div>
                  {player.playerEmail && (
                    <div className="text-[11px] text-muted-foreground">{player.playerEmail}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{player.role}</td>
                <td className="py-3 px-4">{getStatusBadge(player.medicalStatus)}</td>
                <td className="py-3 px-4">
                  {player.questionnaireSubmitted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {player.assessedBy || player.assignedDoctorEmail || "—"}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {player.expiresAt ? formatDate(player.expiresAt) : "—"}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Certificate Button */}
                    {(player.medicalStatus === "Cleared" || player.medicalStatus === "Expired") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewCertificate(player)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Award className="h-3.5 w-3.5 text-accent" />
                        Certificate
                      </Button>
                    )}

                    {/* Doctor Assessment Button */}
                    {isDoctorOrAdmin && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onAssess(player)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Stethoscope className="h-3.5 w-3.5 text-accent" />
                        Assess
                      </Button>
                    )}

                    {/* Player Self Questionnaire Button */}
                    {isSelf && !player.questionnaireSubmitted && (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => onFillQuestionnaire(player)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Fill Form
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
