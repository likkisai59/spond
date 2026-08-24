"use client";

import Link from "next/link";
import { Plus, Vote } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hooks";
import {
  selectActivePolls,
  selectAllGroups,
  selectClosedPolls,
} from "@/store/sports/selectors";
import { PollCard } from "../components/poll-card";
import { ROUTES } from "@/constants";

export function PollsPage() {
  const activePolls = useAppSelector(selectActivePolls);
  const closedPolls = useAppSelector(selectClosedPolls);
  const groups = useAppSelector(selectAllGroups);
  const groupNames = Object.fromEntries(groups.map((g) => [g.id, g.name]));

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Polls" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Polls"
        description="Gather votes from members on venues, kits, tour destinations and more."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_POLLS_CREATE}>
              <Plus />
              Create poll
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activePolls.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedPolls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activePolls.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  groupName={groupNames[poll.groupId]}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              icon={Vote}
              title="No active polls"
              description="Create a poll and members can vote instantly."
              action={
                <Button asChild variant="accent">
                  <Link href={ROUTES.SPORTS_POLLS_CREATE}>Create poll</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {closedPolls.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {closedPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  groupName={groupNames[poll.groupId]}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No closed polls"
              description="Finished polls will be archived here with their results."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
