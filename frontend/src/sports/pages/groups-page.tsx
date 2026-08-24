"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Users, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectAllGroups, selectUpcomingEvents } from "@/store/sports/selectors";
import { GroupCard } from "../components/group-card";
import { GROUP_CATEGORIES, type GroupCategory } from "@/types";
import { ROUTES } from "@/constants";

export function GroupsPage() {
  const groups = useAppSelector(selectAllGroups);
  const upcomingEvents = useAppSelector(selectUpcomingEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<GroupCategory | "all">("all");
  const debouncedSearch = useDebounce(search, 250);

  const filteredGroups = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesQuery =
        query.length === 0 ||
        group.name.toLowerCase().includes(query) ||
        group.location.toLowerCase().includes(query);
      const matchesCategory = category === "all" || group.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [groups, debouncedSearch, category]);

  const nextEventByGroup = useMemo(() => {
    const map = new Map<string, (typeof upcomingEvents)[number]>();
    upcomingEvents.forEach((event) => {
      if (!map.has(event.groupId)) map.set(event.groupId, event);
    });
    return map;
  }, [upcomingEvents]);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Groups" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Groups"
        description="Teams and clubs you manage or belong to."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_GROUPS_CREATE}>
              <Plus />
              Create group
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search groups by name or location…"
          className="sm:max-w-xs"
          aria-label="Search groups"
        />
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as GroupCategory | "all")}
        >
          <SelectTrigger className="sm:w-52" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {GROUP_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {groups.length === 0 ? (
          <EmptyCard
            icon={Users}
            title="No groups yet"
            description="Create your first group to start organising teams, events and payments."
            action={
              <Button asChild variant="accent">
                <Link href={ROUTES.SPORTS_GROUPS_CREATE}>Create group</Link>
              </Button>
            }
          />
        ) : filteredGroups.length === 0 ? (
          <EmptyCard
            icon={SearchX}
            title="No matching groups"
            description="Try a different search term or category filter."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                nextEvent={nextEventByGroup.get(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
