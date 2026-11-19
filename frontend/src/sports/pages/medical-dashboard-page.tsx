"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, ArrowLeft, HeartPulse, Search, UserCheck } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAuth, useDebounce } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectGroupById } from "@/store/sports/selectors";
import { groupsService } from "@/services/sports/groups.service";
import {
  MedicalStatsCards,
  MedicalRosterTable,
  QuestionnaireModal,
  DoctorAssessmentModal,
  CertificateModal,
} from "../components/medical";
import type { PCMADashboardData, PCMAPlayerSummary, PCMAStatus } from "@/types";
import { ROUTES } from "@/constants";

export function MedicalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { user: currentUser } = useAuth();

  const group = useAppSelector((state) => selectGroupById(state, groupId));
  const [data, setData] = useState<PCMADashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [statusFilter, setStatusFilter] = useState<PCMAStatus | "All">("All");

  // Modals state
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PCMAPlayerSummary | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupsService.getMedicalDashboard(groupId);
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load medical clearance dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchDashboardData();
    }
  }, [groupId]);

  const currentUserId = currentUser?.id || (currentUser as any)?._id;
  const currentUserEmail = currentUser?.email?.toLowerCase().trim();
  const assignedDocEmail = (data?.assignedDoctorEmail || group?.assigned_doctor_email || "").toLowerCase().trim();

  const isDoctorOrAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === "admin" || currentUser.role === "super_admin" || currentUser.role === "sports_admin") {
      return true;
    }
    if (assignedDocEmail && currentUserEmail === assignedDocEmail) {
      return true;
    }
    if (group && (group.createdBy === currentUserId || group.created_by === currentUserId)) {
      return true;
    }
    return false;
  }, [currentUser, assignedDocEmail, currentUserEmail, group, currentUserId]);

  const filteredRoster = useMemo(() => {
    if (!data?.roster) return [];
    return data.roster.filter((p) => {
      const matchesSearch =
        debouncedSearch.length === 0 ||
        p.playerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.playerEmail && p.playerEmail.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesStatus = statusFilter === "All" || p.medicalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.roster, debouncedSearch, statusFilter]);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: group?.name || "Group", href: `${ROUTES.SPORTS_GROUPS}/${groupId}` },
          { label: "Medical Clearance (PCMA)" },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <HeartPulse className="h-4 w-4" />
            Pre-Competition Medical Assessment (PCMA)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Squad Medical Clearance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor squad fitness clearance, verify health questionnaires, and review digital certificates.
          </p>
        </div>

        <div className="flex gap-2">
          {currentUser?.role !== "doctor" && (
            <Button variant="outline" size="sm" onClick={() => router.push(`${ROUTES.SPORTS_GROUPS}/${groupId}`)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Group
            </Button>
          )}
          <Button variant="accent" size="sm" onClick={() => setQuestionnaireOpen(true)} className="gap-1.5">
            <HeartPulse className="h-4 w-4" />
            Health Questionnaire
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading squad medical status...
        </Card>
      ) : error ? (
        <EmptyCard
          icon={Activity}
          title="Medical Clearance Unavailable"
          description={error}
          action={
            <Button variant="outline" onClick={() => router.push(`${ROUTES.SPORTS_GROUPS}/${groupId}`)}>
              Return to Group
            </Button>
          }
        />
      ) : data ? (
        <div className="space-y-6">
          {/* Live Squad Counts */}
          <MedicalStatsCards stats={data.stats} />

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search squad players..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["All", "Cleared", "Pending", "Unfit", "Expired"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    statusFilter === status
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Squad Roster Table */}
          {filteredRoster.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No squad players match the selected filters.
            </Card>
          ) : (
            <MedicalRosterTable
              roster={filteredRoster}
              onAssess={(player) => {
                setSelectedPlayer(player);
                setAssessmentModalOpen(true);
              }}
              onViewCertificate={(player) => {
                setSelectedPlayer(player);
                setCertificateModalOpen(true);
              }}
              onFillQuestionnaire={() => {
                setQuestionnaireOpen(true);
              }}
              isDoctorOrAdmin={isDoctorOrAdmin}
              currentUserId={currentUserId}
            />
          )}
        </div>
      ) : null}

      {/* Modals */}
      <QuestionnaireModal
        open={questionnaireOpen}
        onOpenChange={setQuestionnaireOpen}
        groupId={groupId}
        onSuccess={fetchDashboardData}
      />

      <DoctorAssessmentModal
        open={assessmentModalOpen}
        onOpenChange={setAssessmentModalOpen}
        groupId={groupId}
        player={selectedPlayer}
        onSuccess={fetchDashboardData}
      />

      <CertificateModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        player={selectedPlayer}
        groupName={group?.name}
      />
    </PageContainer>
  );
}
