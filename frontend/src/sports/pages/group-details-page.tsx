"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  MapPin,
  Plus,
  Search,
  SearchX,
  Table2,
  UserPlus,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { memberRemoved } from "@/store/sports/groups-slice";
import {
  selectAllFiles,
  selectAllPolls,
  selectAllPayments,
  selectGroupById,
  selectUpcomingEvents,
} from "@/store/sports/selectors";
import {
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

export function GroupDetailsPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const dispatch = useAppDispatch();

  const group = useAppSelector((state) => selectGroupById(state, groupId));
  const upcomingEvents = useAppSelector(selectUpcomingEvents);
  const polls = useAppSelector(selectAllPolls);
  const payments = useAppSelector(selectAllPayments);
  const files = useAppSelector(selectAllFiles);

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
  const groupPosts = useMemo(
    () =>
      MOCK_POSTS.filter((post) => post.groupId === groupId).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      ),
    [groupId]
  );

  const filteredMembers = useMemo(() => {
    if (!group) return [];
    const query = debouncedMemberSearch.trim().toLowerCase();
    if (query.length === 0) return group.members;
    return group.members.filter(
      (member) =>
        (member.name || "").toLowerCase().includes(query) ||
        (member.email || "").toLowerCase().includes(query)
    );
  }, [group, debouncedMemberSearch]);

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
    dispatch(
      notificationAdded({
        title: "Invite members",
        message: "Member invitations will be wired to the messaging service.",
        variant: "info",
      })
    );
  };

  const handleRemoveMember = (memberId: string) => {
    dispatch(memberRemoved({ groupId, memberId }));
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
          <div
            className="h-full w-full bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_85%_-20%,rgba(255,255,255,0.25),transparent_45%)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-3xl">
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
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleInvite}>
              <UserPlus />
              Invite
            </Button>
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
                <CalendarDays />
                New event
              </Link>
            </Button>
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
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <h2 className="mb-3 text-lg font-extrabold tracking-tight">
                  Upcoming events
                </h2>
                {groupEvents.length > 0 ? (
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
                {groupPosts.length > 0 ? (
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
                  {group.members.slice(0, 5).map((member) => (
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
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                  {group.memberCount} members in total
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
              <Button variant="outline" onClick={handleInvite}>
                <UserPlus />
                Invite
              </Button>
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
                />
              ))}
            </div>
          ) : (
            <MembersTable
              members={filteredMembers}
              groupId={groupId}
              onRemove={handleRemoveMember}
            />
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild variant="accent" size="sm">
              <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
                <Plus />
                New event
              </Link>
            </Button>
          </div>
          <EventsTable events={groupEvents} />
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild variant="accent" size="sm">
              <Link href={ROUTES.SPORTS_POLLS_CREATE}>
                <Plus />
                New poll
              </Link>
            </Button>
          </div>
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
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {groupFiles.length > 0 ? (
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
          <div className="flex justify-end">
            <Button asChild variant="accent" size="sm">
              <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
                <Plus />
                Request payment
              </Link>
            </Button>
          </div>
          <PaymentsTable
            payments={groupPayments}
            groupNameById={{ [group.id]: group.name }}
          />
        </TabsContent>

        <TabsContent value="posts" className="space-y-3">
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
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
