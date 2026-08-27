"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, Send, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  conversationOpened,
  messageReceived,
  messageSent,
} from "@/store/sports/messages-slice";
import { selectConversationById } from "@/store/sports/selectors";
import { AttachmentMenuButton } from "./attachment-menu-button";
import { ConversationCard } from "./conversation-card";
import { EmojiPickerButton } from "./emoji-picker-button";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { MOCK_CHAT_PARTICIPANTS } from "@/data";
import { formatDate } from "@/utils/date";
import { getInitials } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const AUTO_REPLIES = [
  "Got it, thanks!",
  "Sounds good 👍",
  "I'll confirm shortly.",
  "Perfect, see you there!",
] as const;

export interface ChatWindowProps {
  conversationId: string;
  className?: string;
}

export function ChatWindow({ conversationId, className }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector((state) =>
    selectConversationById(state, conversationId)
  );

  const [draft, setDraft] = useState("");
  const [justSent, setJustSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useChatWebSocket(conversationId);

  const participants = useMemo(
    () => MOCK_CHAT_PARTICIPANTS[conversationId] ?? [],
    [conversationId]
  );
  const onlineCount = participants.filter((p) => p.online).length;

  useEffect(() => {
    if (conversationId) dispatch(conversationOpened(conversationId));
  }, [conversationId, dispatch]);

  const replyName = useMemo(() => {
    const lastIncoming = conversation?.messages?.findLast((m) => !m.isMine);
    if (lastIncoming) return lastIncoming.senderName;
    const onlineParticipant = participants.find((p) => p.online);
    return onlineParticipant?.name ?? conversation?.name ?? "Team member";
  }, [conversation, participants]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages?.length, conversationId]);

  if (!conversation) return null;

  const handleSend = () => {
    const content = draft.trim();
    if (content.length === 0) return;
    dispatch(messageSent({ conversationId, content }));
    sendMessage(content);
    setDraft("");
    setJustSent(true);
    window.setTimeout(() => setJustSent(false), 2000);
  };

  const handleAttachment = (fileName: string) => {
    dispatch(messageSent({ conversationId, content: `📎 ${fileName}` }));
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

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col bg-card", className)}>
      <div className="flex items-center gap-3 border-b border-border/70 p-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          asChild
        >
          <Link href={ROUTES.SPORTS_MESSAGES} aria-label="Back to messages">
            <ArrowLeft />
          </Link>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{conversation.name}</p>
          {conversation.type === "Group" ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {participants.length} members
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {onlineCount} online
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {onlineCount > 0 ? "Online now" : "Last seen recently"}
            </p>
          )}
        </div>
        <Badge variant={conversation.type === "Group" ? "gradient" : "secondary"}>
          {conversation.type}
        </Badge>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4 md:max-h-[480px] lg:max-h-[560px]"
      >
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-fade-in-up",
              message.isMine ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[60%]",
                message.isMine
                  ? "rounded-br-md bg-brand-gradient text-white"
                  : "rounded-bl-md border border-border/60 bg-card"
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
                  "mt-1 flex items-center justify-end gap-1 text-[10px]",
                  message.isMine ? "text-white/70" : "text-muted-foreground"
                )}
              >
                {formatDate(message.sentAt, "h:mm a")}
                {message.isMine ? (
                  justSent && message === conversation.messages.at(-1) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )
                ) : null}
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
        <EmojiPickerButton
          onPick={(emoji) => setDraft((current) => `${current}${emoji}`)}
        />
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
    </div>
  );
}

export { ConversationCard };
