"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  conversationOpened,
  messageReceived,
  messageSent,
  fetchConversations,
  fetchHistory,
} from "@/store/sports/messages-slice";
import { selectAllConversations, selectConversationById } from "@/store/sports/selectors";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { AttachmentMenuButton } from "../components/attachment-menu-button";
import { ConversationCard } from "../components/conversation-card";
import { EmojiPickerButton } from "../components/emoji-picker-button";
import { formatDate } from "@/utils/date";
import { getInitials } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

type ConversationFilter = "all" | "Group" | "Direct";

const AUTO_REPLIES = [
  "Got it, thanks!",
  "Sounds good 👍",
  "I'll confirm shortly.",
  "Perfect, see you there!",
] as const;

export function MessagesPage() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectAllConversations);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useChatWebSocket(activeId);

  const activeConversation = useAppSelector((state) =>
    selectConversationById(state, activeId ?? "")
  );

  const filteredConversations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesFilter =
        filter === "all" || conversation.type === filter;
      const matchesQuery =
        query.length === 0 ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [conversations, filter, debouncedSearch]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages?.length, activeId]);

  const handleSelect = (conversationId: string) => {
    setActiveId(conversationId);
    dispatch(conversationOpened(conversationId));
    dispatch(fetchHistory(conversationId));
  };

  const handleEmojiPick = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`);
  };

  const handleAttachment = (fileName: string) => {
    if (!activeId) return;
    dispatch(messageSent({ conversationId: activeId, content: `📎 ${fileName}` }));
    dispatch(
      notificationAdded({
        title: "File attached",
        message: `${fileName} was shared in the conversation (demo mode).`,
        variant: "success",
      })
    );
  };

  const handleAttachmentUpload = () => {
    dispatch(
      notificationAdded({
        title: "Attachments",
        message: "Device uploads in chat will be wired to the storage service.",
        variant: "info",
      })
    );
  };

  const handleSend = () => {
    const content = draft.trim();
    if (content.length === 0 || !activeId) return;
    dispatch(messageSent({ conversationId: activeId, content }));
    sendMessage(content);
    setDraft("");
  };

  return (
    <PageContainer as="main" maxWidth="wide">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Messages" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Messages"
        description="Group conversations and direct messages in one inbox."
      />

      <div className="mt-6 grid overflow-hidden rounded-lg border border-border/70 md:grid-cols-[320px,1fr] md:gap-0 gap-4 animate-fade-in-up">
        <div
          className={cn(
            "flex-col border-border/70 bg-card md:flex md:border-r",
            activeId ? "hidden" : "flex"
          )}
        >
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

          <div className="max-h-[420px] flex-1 space-y-1 overflow-y-auto p-2 md:max-h-[560px]">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeId}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                No conversations found.
              </p>
            )}
          </div>
        </div>

        <div className={cn("flex-col bg-card", activeId ? "flex" : "hidden md:flex")}>
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-border/70 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                  onClick={() => setActiveId(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(activeConversation.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {activeConversation.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.type === "Group" ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Group conversation
                      </span>
                    ) : (
                      "Direct message"
                    )}
                  </p>
                </div>
                <Badge variant={activeConversation.type === "Group" ? "gradient" : "secondary"}>
                  {activeConversation.type}
                </Badge>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4 md:max-h-[440px] lg:max-h-[500px]"
              >
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[60%]",
                        message.isMine
                          ? "rounded-br-md bg-brand-gradient text-white"
                          : "rounded-bl-md bg-card border border-border/60"
                      )}
                    >
                      {!message.isMine ? (
                        <p className="mb-0.5 text-[11px] font-bold text-accent">
                          {message.senderName}
                        </p>
                      ) : null}
                      <p>{message.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-right text-[10px]",
                          message.isMine ? "text-white/70" : "text-muted-foreground"
                        )}
                      >
                        {formatDate(message.sentAt, "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-border/70 p-3">
                <AttachmentMenuButton
                  onAttach={handleAttachment}
                  onUploadClick={handleAttachmentUpload}
                />
                <EmojiPickerButton onPick={handleEmojiPick} />
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter") handleSend();
                  }}
                  placeholder="Write a message…"
                  aria-label="Write a message"
                />
                <Button
                  variant="accent"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSend}
                  disabled={draft.trim().length === 0}
                  aria-label="Send message"
                >
                  <Send />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyCard
                icon={MessageSquare}
                title="Select a conversation"
                description="Pick a group chat or direct message from the list to start messaging."
                className="border-none shadow-none"
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
