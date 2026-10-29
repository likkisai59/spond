"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  SearchX,
  Table2,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { removeMemberThunk, fetchGroupsThunk, deleteGroupThunk, updateGroupPermissionsThunk } from "@/store/sports/groups-slice";
import { fetchPaymentsThunk } from "@/store/sports/payments-slice";
import { fetchEventsThunk } from "@/store/sports/events-slice";
import type { FeatureToggles, GroupRolePermissions } from "@/types";
import { DEFAULT_FEATURE_TOGGLES, DEFAULT_ROLE_PERMISSIONS, canAccessFeature } from "../utils/permissions";
import {
  selectAllFiles,
  selectAllPolls,
  selectAllPayments,
  selectGroupById,
  selectUpcomingEvents,
} from "@/store/sports/selectors";
import {
  AddMemberModal,
  EventCard,
  FileCard,
  MemberCard,
  PollCard,
} from "../components";
import { EventsTable, MembersTable, PaymentsTable } from "../tables";
import { MOCK_POSTS } from "../mocks/activity.mock";
import { formatDate } from "@/utils/date";
import { getInitials } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const SETTINGS_FEATURES = [
  {
    key: "events" as const,
    label: "Events & Matches",
    description: "Access and participate in group events, matches, and training schedules.",
  },
  {
    key: "attendance" as const,
    label: "Attendance Tracking",
    description: "Track event attendance, mark member presence, and view RSVP records.",
  },
  {
    key: "polls" as const,
    label: "Team Polls",
    description: "Vote on team decisions, polls, and view voting results.",
  },
  {
    key: "payments" as const,
    label: "Payments & Dues",
    description: "View payment requests, membership dues, and track payment receipts.",
  },
  {
    key: "files" as const,
    label: "Files & Documents",
    description: "Browse, view, and download group tactical documents and shared files.",
  },
  {
    key: "chat" as const,
    label: "Team Chat",
    description: "Access team wall announcements, posts, and group discussion feeds.",
  },
] as const;

const SETTINGS_ROLES = [
  { key: "member" as const, label: "Member" },
  { key: "coach" as const, label: "Coach" },
  { key: "treasurer" as const, label: "Treasurer" },
  { key: "admin" as const, label: "Admin" },
] as const;

export function GroupDetailsPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const group = useAppSelector((state) => selectGroupById(state, groupId));
  const upcomingEvents = useAppSelector(selectUpcomingEvents);
  const polls = useAppSelector(selectAllPolls);
  const payments = useAppSelector(selectAllPayments);
  const files = useAppSelector(selectAllFiles);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentsThunk(groupId));
    dispatch(fetchEventsThunk(groupId));
    if (!group) {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, groupId, group]);

  const [memberSearch, setMemberSearch] = useState("");
  const [membersView, setMembersView] = useState<"cards" | "table">("cards");
  const debouncedMemberSearch = useDebounce(memberSearch, 250);

  const groupEvents = useMemo(
    () => upcomingEvents.filter((event) => event.groupId === groupId),
    [upcomingEvents, groupId]
  );
  const groupPolls = useMemo(
    () => polls.filter((poll) => poll.groupId === groupId),
    [polls, groupId]
  );
  const groupPayments = useMemo(
    () => payments.filter((payment) => payment.groupId === groupId),
    [payments, groupId]
  );
  const groupFiles = useMemo(
    () => files.filter((file) => file.groupId === groupId),
    [files, groupId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customPosts, setCustomPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPostInput, setShowNewPostInput] = useState(false);

  const groupPosts = useMemo(
    () =>
      [...customPosts, ...MOCK_POSTS.filter((post) => post.groupId === groupId)].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      ),
    [groupId, customPosts]
  );

  const filteredMembers = useMemo(() => {
    if (!group) return [];
    const members = group.members ?? [];
    const query = debouncedMemberSearch.trim().toLowerCase();
    if (query.length === 0) return members;
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
    );
  }, [group, debouncedMemberSearch]);

  const [permissionsState, setPermissionsState] = useState<GroupRolePermissions>(() => {
    return (
      group?.rolePermissions ||
      group?.role_permissions ||
      (group as any)?.rolePermissions ||
      (group as any)?.role_permissions ||
      DEFAULT_ROLE_PERMISSIONS
    );
  });

  useEffect(() => {
    if (group) {
      const perms =
        group.rolePermissions ||
        group.role_permissions ||
        (group as any)?.rolePermissions ||
        (group as any)?.role_permissions;
      if (perms) {
        setPermissionsState(perms);
      }
    }
  }, [group]);

  const [selectedRole, setSelectedRole] = useState<"member" | "coach" | "treasurer" | "admin">("member");
  const [savingPermissions, setSavingPermissions] = useState(false);

  const currentUserRoleInGroup = useMemo(() => {
    if (!group || !currentUser) return "member";
    const currentUserId = currentUser.id || (currentUser as any)._id;
    const currentUserEmail = currentUser.email?.toLowerCase().trim();

    if (group.createdBy && group.createdBy === currentUserId) return "owner";
    if (group.created_by && group.created_by === currentUserId) return "owner";

    const member = (group.members ?? []).find((m: any) => {
      if (m.userId && m.userId === currentUserId) return true;
      if (m.user_id && m.user_id === currentUserId) return true;
      if (m.id && m.id === currentUserId) return true;
      if (m.email && currentUserEmail && m.email.toLowerCase().trim() === currentUserEmail) return true;
      return false;
    });

    if (member?.role) {
      return member.role.toLowerCase().trim();
    }

    if (currentUser.role === "admin" && (group.createdBy === currentUserId || group.created_by === currentUserId)) {
      return "owner";
    }

    return "member";
  }, [group, currentUser]);

  const isOwnerOrAdmin = useMemo(() => {
    return (
      currentUserRoleInGroup === "owner" ||
      currentUserRoleInGroup === "admin" ||
      currentUser?.role === "super_admin" ||
      (group && (group.createdBy === currentUser?.id || group.created_by === currentUser?.id))
    );
  }, [currentUserRoleInGroup, currentUser, group]);

  const canAccessEvents = canAccessFeature(group, currentUserRoleInGroup, "events");
  const canAccessPolls = canAccessFeature(group, currentUserRoleInGroup, "polls");
  const canAccessPayments = canAccessFeature(group, currentUserRoleInGroup, "payments");
  const canAccessFiles = canAccessFeature(group, currentUserRoleInGroup, "files");
  const canAccessChat = canAccessFeature(group, currentUserRoleInGroup, "chat");

  const handleToggleFeature = (role: "member" | "coach" | "treasurer" | "admin", feature: keyof FeatureToggles) => {
    setPermissionsState((prev) => {
      const currentRolePerms = prev[role] || { ...DEFAULT_FEATURE_TOGGLES };
      return {
        ...prev,
        [role]: {
          ...currentRolePerms,
          [feature]: !currentRolePerms[feature],
        },
      };
    });
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    try {
      await dispatch(updateGroupPermissionsThunk({ groupId, permissions: permissionsState })).unwrap();
      dispatch(
        notificationAdded({
          title: "Settings saved",
          message: "Role-based feature access permissions updated successfully.",
          variant: "success",
        })
      );
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error saving settings",
          message: error?.message || "Failed to update role permissions.",
          variant: "error",
        })
      );
    } finally {
      setSavingPermissions(false);
    }
  };

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

  const handleInvite = () => {
    setInviteOpen(true);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await dispatch(removeMemberThunk({ groupId, memberId })).unwrap();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error removing member",
          message: error?.message || "Failed to remove member from group",
          variant: "error",
        })
      );
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteGroupThunk(groupId)).unwrap();
      dispatch(
        notificationAdded({
          title: "Group deleted",
          message: "The group has been successfully deleted.",
          variant: "success",
        })
      );
      router.push(ROUTES.SPORTS_GROUPS);
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error deleting group",
          message: error?.message || "Failed to delete group",
          variant: "error",
        })
      );
    }
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Groups", href: ROUTES.SPORTS_GROUPS },
          { label: group.name },
        ]}
        className="mb-4"
      />

      <Card className="animate-fade-in-up p-6 sm:p-8">
        <div className="-mx-6 -mt-6 mb-6 h-28 overflow-hidden rounded-t-lg bg-brand-gradient sm:-mx-8 sm:-mt-8 sm:h-32">
          {group.coverImage || (group as any).cover_image ? (
            <img
              src={group.coverImage || (group as any).cover_image}
              alt={`${group.name} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_85%_-20%,rgba(255,255,255,0.25),transparent_45%)]"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-3xl">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <AvatarImage src={group.logoUrl || (group as any).logo || (group as any).logo_url} alt={group.name} />
            <AvatarFallback className="rounded-3xl text-xl">
              {getInitials(group.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
              {group.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="gradient">{group.category}</Badge>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />
                {group.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                {group.memberCount} members
              </span>
              <span>· Since {formatDate(group.createdAt)}</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {group.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              {canAccessChat && (
                <Button asChild variant="outline">
                  <Link href={`/sports/messages?conversationId=${groupId}`}>
                    <MessageSquare className="mr-1.5 h-4 w-4 text-primary" />
                    Team Chat
                  </Link>
                </Button>
              )}
              {isOwnerOrAdmin && (
                <Button variant="outline" onClick={handleInvite}>
                  <UserPlus />
                  Invite
                </Button>
              )}
              {isOwnerOrAdmin && canAccessEvents && (
                <Button asChild variant="accent">
                  <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
                    <CalendarDays />
                    New event
                  </Link>
                </Button>
              )}
            </div>
            {isOwnerOrAdmin && (
              <Button
                variant="destructive"
                onClick={handleDeleteGroup}
                className="w-full sm:w-auto"
              >
                <Trash2 />
                Delete group
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {isOwnerOrAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <h2 className="mb-3 text-lg font-extrabold tracking-tight">
                  Upcoming events
                </h2>
                {!canAccessEvents ? (
                  <EmptyCard
                    icon={Lock}
                    title="Only club admin can see this"
                    description="Events and matches have been turned off for your role by the club administrator."
                  />
                ) : groupEvents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {groupEvents.slice(0, 2).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <EmptyCard
                    title="No upcoming events"
                    description="Schedule the next session for this group."
                  />
                )}
              </section>

              <section>
                <h2 className="mb-3 text-lg font-extrabold tracking-tight">
                  Recent posts
                </h2>
                {!canAccessChat ? (
                  <EmptyCard
                    icon={Lock}
                    title="Only club admin can see this"
                    description="Team chat and announcements have been turned off for your role by the club administrator."
                  />
                ) : groupPosts.length > 0 ? (
                  <div className="space-y-3">
                    {groupPosts.slice(0, 3).map((post) => (
                      <Card key={post.id} className="p-4">
                        <p className="text-sm leading-relaxed">{post.content}</p>
                        <p className="mt-2 text-xs font-semibold text-muted-foreground">
                          {post.author} · {formatDate(post.createdAt)}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyCard
                    title="No posts yet"
                    description="Announcements from coaches and admins will appear here."
                  />
                )}
              </section>
            </div>

            <section>
              <h2 className="mb-3 text-lg font-extrabold tracking-tight">
                Members preview
              </h2>
              <Card className="p-5">
                <ul className="space-y-3">
                  {(group.members ?? []).slice(0, 5).map((member) => {
                    const targetUserId = member.userId || member.user_id || member.id;
                    const isMe = Boolean(currentUser?.id && targetUserId === currentUser.id);

                    return (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                        {!isMe && targetUserId ? (
                          <Link
                            href={`/sports/messages?userId=${targetUserId}`}
                            className="inline-flex items-center gap-1 rounded-full border border-border/80 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            title={`Chat with ${member.name}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                            <span>Chat</span>
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                  {group.memberCount ?? (group.members ?? []).length} members in total
                </p>
              </Card>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search members…"
                className="pl-9"
                aria-label="Search members"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`${ROUTES.SPORTS_GROUPS}/${groupId}/members`}>
                  <Users />
                  Member manager
                </Link>
              </Button>
              <div className="flex rounded-full border border-input p-1">
                <button
                  type="button"
                  onClick={() => setMembersView("cards")}
                  aria-label="Card view"
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    membersView === "cards"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMembersView("table")}
                  aria-label="Table view"
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    membersView === "table"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Table2 className="h-4 w-4" />
                </button>
              </div>
              {isOwnerOrAdmin && (
                <Button variant="outline" onClick={handleInvite}>
                  <UserPlus />
                  Invite
                </Button>
              )}
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <EmptyCard
              icon={SearchX}
              title="No matching members"
              description="Try a different name or email."
            />
          ) : membersView === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  groupId={groupId}
                  canManage={isOwnerOrAdmin}
                />
              ))}
            </div>
          ) : (
            <MembersTable
              members={filteredMembers}
              groupId={groupId}
              onRemove={isOwnerOrAdmin ? handleRemoveMember : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {!canAccessEvents ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Events and matches have been turned off for your role by the club administrator."
            />
          ) : (
            <>
              {isOwnerOrAdmin && (
                <div className="flex justify-end">
                  <Button asChild variant="accent" size="sm">
                    <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
                      <Plus />
                      New event
                    </Link>
                  </Button>
                </div>
              )}
              <EventsTable events={groupEvents} />
            </>
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          {!canAccessPolls ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Polls and team voting have been turned off for your role by the club administrator."
            />
          ) : (
            <>
              {isOwnerOrAdmin && (
                <div className="flex justify-end">
                  <Button asChild variant="accent" size="sm">
                    <Link href={ROUTES.SPORTS_POLLS_CREATE}>
                      <Plus />
                      New poll
                    </Link>
                  </Button>
                </div>
              )}
              {groupPolls.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {groupPolls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} groupName={group.name} />
                  ))}
                </div>
              ) : (
                <EmptyCard
                  title="No polls yet"
                  description="Create a poll to gather votes from this group."
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {!canAccessFiles ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Shared files and documents have been turned off for your role by the club administrator."
            />
          ) : groupFiles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {groupFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No files yet"
              description="Shared documents, drills and media will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {!canAccessPayments ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Payments and fee requests have been turned off for your role by the club administrator."
            />
          ) : (
            <>
              {isOwnerOrAdmin && (
                <div className="flex justify-end">
                  <Button asChild variant="accent" size="sm">
                    <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
                      <Plus />
                      Request payment
                    </Link>
                  </Button>
                </div>
              )}
              <PaymentsTable
                payments={groupPayments}
                groupNameById={{ [group.id]: group.name }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {!canAccessChat ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Team chat and announcements have been turned off for your role by the club administrator."
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Recent announcements & posts</h3>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setShowNewPostInput((prev) => !prev)}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Create post
                </Button>
              </div>

              {showNewPostInput ? (
                <Card className="p-4 space-y-3 animate-fade-in-up border-accent/40">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write an announcement or message for the group..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewPostInput(false);
                        setNewPostContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={!newPostContent.trim()}
                      onClick={() => {
                        if (!newPostContent.trim()) return;
                        setCustomPosts((prev) => [
                          {
                            id: `post-${Date.now()}`,
                            groupId,
                            author: "You",
                            content: newPostContent.trim(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          },
                          ...prev,
                        ]);
                        setNewPostContent("");
                        setShowNewPostInput(false);
                        dispatch(
                          notificationAdded({
                            title: "Post created",
                            message: "Your post was shared with the group.",
                            variant: "success",
                          })
                        );
                      }}
                    >
                      Publish post
                    </Button>
                  </div>
                </Card>
              ) : null}

              {groupPosts.length > 0 ? (
                groupPosts.map((post) => (
                  <Card key={post.id} className="p-5">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    <p className="mt-3 text-xs font-semibold text-muted-foreground">
                      {post.author} · {formatDate(post.createdAt)}
                    </p>
                  </Card>
                ))
              ) : (
                <EmptyCard
                  title="No posts yet"
                  description="Posts from coaches and admins will appear here."
                />
              )}
            </>
          )}
        </TabsContent>

        {isOwnerOrAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Role-Based Feature Permissions</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize which group sections and features are accessible for each member role.
                  </p>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="self-start sm:self-auto"
                >
                  {savingPermissions ? "Saving..." : "Save Preferences"}
                </Button>
              </div>

              {/* Role selection pills */}
              <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
                {SETTINGS_ROLES.map((r) => {
                  const isSelected = selectedRole === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setSelectedRole(r.key)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      )}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {/* Feature toggles list */}
              <div className="mt-6 divide-y divide-border">
                {SETTINGS_FEATURES.map((feature) => {
                  const roleConfig = permissionsState[selectedRole] || DEFAULT_FEATURE_TOGGLES;
                  const isEnabled = roleConfig[feature.key] !== false;

                  return (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="pr-4">
                        <p className="text-sm font-semibold">{feature.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        onClick={() => handleToggleFeature(selectedRole, feature.key)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                          isEnabled ? "bg-accent" : "bg-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {group && (
        <AddMemberModal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          groupId={groupId}
          groupName={group.name}
        />
      )}
    </PageContainer>
  );
}
