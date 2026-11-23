"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import { groupsService } from "@/services/sports/groups.service";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { CheckCircle2, HeartPulse } from "lucide-react";
import { cn } from "@/utils/cn";

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onSuccess?: () => void;
}

export function QuestionnaireModal({
  open,
  onOpenChange,
  groupId,
  onSuccess,
}: QuestionnaireModalProps) {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    heartCondition: false,
    chestPainExercise: false,
    dizzinessOrFainting: false,
    boneOrJointProblem: false,
    currentMedications: "",
    allergies: "",
    additionalNotes: "",
  });

  const questions = [
    {
      key: "heartCondition" as const,
      label: "Have you ever been told by a doctor that you have a heart condition?",
    },
    {
      key: "chestPainExercise" as const,
      label: "Do you ever feel chest pain or tightness when engaging in physical exercise?",
    },
    {
      key: "dizzinessOrFainting" as const,
      label: "Do you ever lose balance, feel dizzy, or lose consciousness during or after training?",
    },
    {
      key: "boneOrJointProblem" as const,
      label: "Do you have a current bone, joint, or muscle problem that could be aggravated by high intensity sports?",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await groupsService.submitQuestionnaire(groupId, {
        heart_condition: formData.heartCondition,
        chest_pain_exercise: formData.chestPainExercise,
        dizziness_or_fainting: formData.dizzinessOrFainting,
        bone_or_joint_problem: formData.boneOrJointProblem,
        current_medications: formData.currentMedications || undefined,
        allergies: formData.allergies || undefined,
        additional_notes: formData.additionalNotes || undefined,
      });

      dispatch(
        notificationAdded({
          title: "Questionnaire submitted",
          message: "Your health declaration has been securely sent for medical review.",
          variant: "success",
        })
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Submission failed",
          message: error?.message || "Could not submit questionnaire. Please try again.",
          variant: "error",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-accent" />
            <ModalTitle>Pre-Competition Health Questionnaire</ModalTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required for sports competition clearance. Your answers are private and strictly accessible by authorized medical doctors.
          </p>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
            {questions.map((q) => {
              const val = formData[q.key];
              return (
                <div
                  key={q.key}
                  className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-muted/20"
                >
                  <p className="text-xs sm:text-sm font-medium pr-4">{q.label}</p>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, [q.key]: true }))}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-bold transition-colors",
                        val
                          ? "bg-destructive text-destructive-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, [q.key]: false }))}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-bold transition-colors",
                        !val
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Current Medications</label>
              <Input
                placeholder="None or list medications..."
                value={formData.currentMedications}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentMedications: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Allergies</label>
              <Input
                placeholder="None or list allergies..."
                value={formData.allergies}
                onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Additional Medical Notes (Optional)</label>
            <Input
              placeholder="Any past surgeries or relevant medical background..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              className="mt-1 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Health Declaration"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
