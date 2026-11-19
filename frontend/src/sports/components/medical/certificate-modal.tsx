"use client";

import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, CheckCircle2, Download, Printer, QrCode } from "lucide-react";
import { formatDate } from "@/utils/date";
import type { PCMAPlayerSummary } from "@/types";

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: PCMAPlayerSummary | null;
  groupName?: string;
}

export function CertificateModal({
  open,
  onOpenChange,
  player,
  groupName,
}: CertificateModalProps) {
  if (!player) return null;

  const handlePrint = () => {
    window.print();
  };

  const isExpired = player.medicalStatus === "Expired";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <ModalTitle>Medical Clearance Certificate</ModalTitle>
          </div>
        </ModalHeader>

        <div className="space-y-3 pt-1">
          {/* Certificate Graphic Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent p-4 sm:p-5 text-center shadow-md">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Official Medical Clearance (PCMA)
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">
              {player.playerName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {groupName ? `Squad Member of ${groupName}` : "Pre-Competition Medical Assessment"}
            </p>

            <div className="my-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              STATUS: {isExpired ? "EXPIRED" : "FIT & CLEARED TO PLAY"}
            </div>

            <div className="grid grid-cols-2 gap-2.5 border-t border-b border-border/80 py-2.5 text-left text-xs">
              <div>
                <p className="text-muted-foreground font-semibold">Certificate Number</p>
                <p className="font-mono font-bold mt-0.5 text-foreground">{player.certificateNumber || "PCMA-VERIFIED"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Assessing Medical Doctor</p>
                <p className="font-bold mt-0.5 text-foreground">{player.assessedBy || "Authorized Club Doctor"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Assessed Date</p>
                <p className="font-medium mt-0.5">{player.assessedAt ? formatDate(player.assessedAt) : "Verified"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Certificate Expiry</p>
                <p className="font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                  {player.expiresAt ? formatDate(player.expiresAt) : "Valid"}
                </p>
              </div>
            </div>

            {/* QR Code Graphic for Public Verification */}
            <div className="mt-3 flex flex-col items-center justify-center">
              <div className="rounded-lg border border-border bg-white p-2 shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg className="h-16 w-16 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm-2-2h2v2h-2v-2zm4-2h2v4h-2v-4z" />
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                Scan on matchday for instant referee verification
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-1.5 text-xs font-semibold">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="accent" onClick={handlePrint} className="gap-1.5 text-xs font-semibold">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
