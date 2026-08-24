"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectAllConversations, selectConversationById } from "@/store/sports/selectors";
import { ChatWindow } from "../components/chat-window";
import { ConversationCard } from "../components/conversation-card";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

type ConversationFilter = "all" | "Group" | "Direct";

export function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversations = useAppSelector(selectAllConversations);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const debouncedSearch = useDebounce(search, 250);

  const activeConversation = useAppSelector((state) =>
    selectConversationById(state, params.conversationId)
  );

  const filteredConversations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesFilter = filter === "all" || conversation.type === filter;
      const matchesQuery =
        query.length === 0 ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [conversations, filter, debouncedSearch]);

  if (!activeConversation) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Messages", href: ROUTES.SPORTS_MESSAGES },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={MessageSquare}
          title="Conversation not found"
          description="This conversation may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_MESSAGES}>Back to messages</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer as="main" maxWidth="wide">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Messages", href: ROUTES.SPORTS_MESSAGES },
          { label: activeConversation.name },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Messages"
        description="Group conversations and direct messages in one inbox."
      />

      <div className="mt-6 grid animate-fade-in-up gap-4 overflow-hidden rounded-lg border border-border/70 md:grid-cols-[320px,1fr] md:gap-0">
        <div className="hidden flex-col border-border/70 bg-card md:flex md:border-r">
          <div className="space-y-3 border-b border-border/70 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations…"
                className="pl-9"
                aria-label="Search conversations"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "Group", "Direct"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                    filter === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item === "Group" ? "Groups" : item === "Direct" ? "Members" : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[520px] flex-1 space-y-1 overflow-y-auto p-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === params.conversationId}
                  onSelect={(id) =>
                    router.push(`${ROUTES.SPORTS_MESSAGES}/${id}`)
                  }
                />
              ))
            ) : (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                No conversations found.
              </p>
            )}
          </div>
        </div>

        <ChatWindow conversationId={params.conversationId} />
      </div>
    </PageContainer>
  );
}
