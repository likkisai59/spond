"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/shared/card";
import { groupsService } from "@/services/sports/groups.service";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { Stethoscope, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { PCMAPlayerSummary } from "@/types";

interface DoctorAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  player: PCMAPlayerSummary | null;
  onSuccess?: () => void;
}

export function DoctorAssessmentModal({
  open,
  onOpenChange,
  groupId,
  player,
  onSuccess,
}: DoctorAssessmentModalProps) {
  const dispatch = useAppDispatch();
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clinicalRecord, setClinicalRecord] = useState<any>(null);

  const [assessmentForm, setAssessmentForm] = useState({
    bloodPressure: "120/80",
    heartRateBpm: 72,
    vision: "Normal",
    cardiovascular: "Normal",
    musculoskeletal: "Normal",
    clinicalNotes: "",
    validityMonths: 6,
  });

  useEffect(() => {
    if (open && player) {
      setLoadingDetails(true);
      groupsService
        .getClinicalDetails(groupId, player.playerId)
        .then((res) => {
          setClinicalRecord(res.data);
        })
        .catch(() => {
          setClinicalRecord(null);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [open, groupId, player]);

  const handleAssessment = async (outcome: "Fit" | "Unfit") => {
    if (!player) return;
    setSubmitting(true);
    try {
      await groupsService.submitAssessment(groupId, {
        player_id: player.playerId,
        blood_pressure: assessmentForm.bloodPressure,
        heart_rate_bpm: Number(assessmentForm.heartRateBpm) || 72,
        vision: assessmentForm.vision,
        cardiovascular: assessmentForm.cardiovascular,
        musculoskeletal: assessmentForm.musculoskeletal,
        clinical_notes: assessmentForm.clinicalNotes || (outcome === "Fit" ? "Medically cleared for competition" : "Temporarily unfit to play"),
        outcome,
        validity_months: assessmentForm.validityMonths,
      });

      dispatch(
        notificationAdded({
          title: outcome === "Fit" ? "Player Cleared" : "Player Marked Unfit",
          message:
            outcome === "Fit"
              ? `Medical clearance certificate issued for ${player.playerName}.`
              : `${player.playerName} marked as unfit to play.`,
          variant: outcome === "Fit" ? "success" : "warning",
        })
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Assessment submission failed",
          message: error?.message || "Could not complete assessment.",
          variant: "error",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const qAnswers = clinicalRecord?.questionnaire?.answers;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-accent" />
            <ModalTitle>Clinical Medical Assessment</ModalTitle>
          </div>
          {player && (
            <p className="text-xs text-muted-foreground mt-1">
              Evaluating: <span className="font-semibold text-foreground">{player.playerName}</span> ({player.playerEmail || player.role})
            </p>
          )}
        </ModalHeader>

        <div className="space-y-5 pt-2">
          {/* Health questionnaire declaration review */}
          <Card className="p-4 bg-muted/30 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Player Self-Declaration Summary
            </h4>
            {loadingDetails ? (
              <p className="text-xs text-muted-foreground animate-pulse">Loading clinical declaration...</p>
            ) : qAnswers ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Heart Condition: <span className={qAnswers.heart_condition ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>{qAnswers.heart_condition ? "Yes" : "No"}</span></div>
                <div>Chest Pain in Exercise: <span className={qAnswers.chest_pain_exercise ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>{qAnswers.chest_pain_exercise ? "Yes" : "No"}</span></div>
                <div>Dizziness/Fainting: <span className={qAnswers.dizziness_or_fainting ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>{qAnswers.dizziness_or_fainting ? "Yes" : "No"}</span></div>
                <div>Bone/Joint Issue: <span className={qAnswers.bone_or_joint_problem ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>{qAnswers.bone_or_joint_problem ? "Yes" : "No"}</span></div>
                {qAnswers.current_medications && <div className="col-span-2">Meds: <span className="font-medium">{qAnswers.current_medications}</span></div>}
                {qAnswers.allergies && <div className="col-span-2">Allergies: <span className="font-medium">{qAnswers.allergies}</span></div>}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
                <AlertCircle className="h-4 w-4" />
                Player has not submitted their health questionnaire yet.
              </div>
            )}
          </Card>

          {/* Vitals Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Vitals & Examination
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold">Blood Pressure</label>
                <Input
                  value={assessmentForm.bloodPressure}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, bloodPressure: e.target.value }))}
                  placeholder="120/80"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Heart Rate (BPM)</label>
                <Input
                  type="number"
                  value={assessmentForm.heartRateBpm}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, heartRateBpm: Number(e.target.value) || 0 }))}
                  placeholder="72"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Vision Check</label>
                <Input
                  value={assessmentForm.vision}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, vision: e.target.value }))}
                  placeholder="Normal / Corrected"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Cardiovascular</label>
                <Input
                  value={assessmentForm.cardiovascular}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, cardiovascular: e.target.value }))}
                  placeholder="Normal / Murmur"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Musculoskeletal</label>
                <Input
                  value={assessmentForm.musculoskeletal}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, musculoskeletal: e.target.value }))}
                  placeholder="Normal / Guarding"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Clearance Validity</label>
                <select
                  value={assessmentForm.validityMonths}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, validityMonths: Number(e.target.value) }))}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months (Standard)</option>
                  <option value={12}>12 Months (Annual)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold">Clinical Examination Notes</label>
              <Input
                value={assessmentForm.clinicalNotes}
                onChange={(e) => setAssessmentForm((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
                placeholder="Fit for active sports competition without restrictions..."
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleAssessment("Unfit")}
                disabled={submitting}
                className="flex-1 sm:flex-none gap-1.5 text-xs font-bold"
              >
                <XCircle className="h-4 w-4" />
                Declare Unfit
              </Button>
              <Button
                type="button"
                variant="accent"
                onClick={() => handleAssessment("Fit")}
                disabled={submitting}
                className="flex-1 sm:flex-none gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Certify Fit & Issue Clearance
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
