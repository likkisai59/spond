"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Award, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { groupsService } from "@/services/sports/groups.service";
import { formatDate } from "@/utils/date";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      groupsService
        .verifyCertificate(certificateId)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          setError(err?.message || "Medical certificate not found or invalid");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Award className="h-4 w-4" />
            Official Medical Verification
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">PCMA Clearance Check</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pre-Competition Medical Assessment Verification
          </p>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Verifying digital medical certificate...
          </Card>
        ) : error ? (
          <Card className="p-6 text-center border-destructive/30 bg-destructive/5 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-destructive">Certificate Invalid</h3>
            <p className="text-xs text-muted-foreground">{error}</p>
            <p className="text-[11px] text-muted-foreground font-mono">ID: {certificateId}</p>
          </Card>
        ) : data ? (
          <Card className="p-6 border-emerald-500/30 bg-card shadow-lg text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              {data.is_valid ? <ShieldCheck className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8 text-amber-500" />}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {data.is_valid ? "VALID & CLEARED TO PLAY" : "CLEARANCE EXPIRED"}
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
                {data.player_name || "Player"}
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {data.certificate_number}
              </p>
            </div>

            <div className="divide-y divide-border text-left text-xs border-t border-b border-border py-2">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-medium">Assessing Doctor</span>
                <span className="font-bold">{data.doctor_name || "Club Medical Officer"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-medium">Certified Date</span>
                <span>{data.issued_at ? formatDate(data.issued_at) : "Verified"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-medium">Valid Until</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {data.expires_at ? formatDate(data.expires_at) : "Active"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              Verified through Spond Sports Health & Safety Registry.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
