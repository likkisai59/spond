"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  SearchX,
  UserPlus,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectGroupById } from "@/store/sports/selectors";
import { memberRoleChanged } from "@/store/sports/groups-slice";
import { MemberRoleBadge } from "../components/member-role-badge";
import { StatusBadge } from "../components/status-badge";
import { formatDate } from "@/utils/date";
import { getInitials } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { MEMBER_ROLES, type GroupMember, type MemberRole } from "@/types";
import { cn } from "@/utils/cn";

const AddMemberModal = dynamic(
  () => import("../components/add-member-modal").then((m) => m.AddMemberModal),
  { ssr: false, loading: () => null }
);

const ROLE_FILTERS = ["All", ...MEMBER_ROLES] as const;

function MemberManagerCard({
  member,
  onRoleChange,
}: {
  member: GroupMember;
  onRoleChange: (memberId: string, role: MemberRole) => void;
}) {
  const isOwner = member.role === "Owner";

  return (
    <Card
      interactive
      className="flex h-full flex-col p-5 animate-fade-in-up"
    >
      <div className="flex items-center gap-3.5">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold">{member.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {member.email}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <MemberRoleBadge role={member.role} />
        <StatusBadge status={member.status} />
      </div>

      <p className="mt-3 text-xs font-semibold text-muted-foreground">
        Joined {formatDate(member.joinedAt)}
      </p>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Role
        </p>
        <Select
          value={member.role}
          onValueChange={(value) => onRoleChange(member.id, value as MemberRole)}
          disabled={isOwner}
        >
          <SelectTrigger
            className="w-full"
            aria-label={`Change role for ${member.name}`}
            disabled={isOwner}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMBER_ROLES.map((role) => (
              <SelectItem key={role} value={role} disabled={role === "Owner"}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isOwner ? (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            The owner role cannot be changed (demo mode).
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-4">
        <Button asChild variant="outline" size="sm" className="w-full rounded-full">
          <Link href={`${ROUTES.SPORTS_MEMBERS}/${member.id}`}>
            View profile
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function GroupMembersPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const dispatch = useAppDispatch();
  const group = useAppSelector((state) => selectGroupById(state, groupId));

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [addOpen, setAddOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 250);

  const filteredMembers = useMemo(() => {
    if (!group) return [];
    const query = debouncedSearch.trim().toLowerCase();
    return group.members.filter((member) => {
      const matchesRole = roleFilter === "All" || member.role === roleFilter;
      const matchesQuery =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  }, [group, debouncedSearch, roleFilter]);

  const roleCounts = useMemo(() => {
    if (!group) return new Map<string, number>();
    return group.members.reduce((counts, member) => {
      counts.set(member.role, (counts.get(member.role) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  }, [group]);

  if (!group) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Groups", href: ROUTES.SPORTS_GROUPS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="Group not found"
          description="This group may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_GROUPS}>Back to groups</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    dispatch(memberRoleChanged({ groupId, memberId, role }));
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Groups", href: ROUTES.SPORTS_GROUPS },
          { label: group.name, href: `${ROUTES.SPORTS_GROUPS}/${group.id}` },
          { label: "Members" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Members"
        description={`${group.name} · ${group.memberCount} members`}
        actions={
          <>
            <Button
              variant="accent"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus />
              Add member
            </Button>
            <Button asChild variant="outline">
              <Link href={`${ROUTES.SPORTS_GROUPS}/${groupId}`}>
                <ArrowLeft />
                Back to group
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members…"
            className="pl-9"
            aria-label="Search members"
          />
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1 lg:pb-0"
          role="group"
          aria-label="Filter by role"
        >
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              aria-pressed={roleFilter === role}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                roleFilter === role
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-input text-muted-foreground hover:border-accent/40 hover:text-foreground"
              )}
            >
              {role}
              {role !== "All" && roleCounts.get(role) ? (
                <span className="ml-1 opacity-70">
                  ({roleCounts.get(role)})
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground lg:ml-auto">
          Showing {filteredMembers.length} of {group.members.length} members
        </p>
      </div>

      <div className="mt-6">
        {group.members.length === 0 ? (
          <EmptyCard
            icon={Users}
            title="No members yet"
            description="Add your first member to get started."
            action={
              <Button variant="accent" onClick={() => setAddOpen(true)}>
                <UserPlus />
                Add member
              </Button>
            }
          />
        ) : filteredMembers.length === 0 ? (
          <EmptyCard
            icon={SearchX}
            title="No matching members"
            description="Try a different name, email or role filter."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberManagerCard
                key={member.id}
                member={member}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </div>

      <AddMemberModal
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={groupId}
        groupName={group.name}
      />
    </PageContainer>
  );
}
