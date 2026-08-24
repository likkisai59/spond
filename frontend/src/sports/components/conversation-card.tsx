import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/helpers";
import { formatRelative } from "@/utils/date";
import type { Conversation } from "@/types";

export interface ConversationCardProps {
  conversation: Conversation;
  isActive?: boolean;
  onSelect: (conversationId: string) => void;
  className?: string;
}

export function ConversationCard({
  conversation,
  isActive = false,
  onSelect,
  className,
}: ConversationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted",
        className
      )}
      aria-current={isActive ? "true" : undefined}
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold">
            {conversation.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-[10px] font-medium",
              isActive ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {formatRelative(conversation.lastMessageAt)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-xs",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {conversation.lastMessage}
          </span>
          {conversation.unreadCount > 0 ? (
            <Badge variant="accent" className="shrink-0 px-2 py-0 text-[10px]">
              {conversation.unreadCount}
            </Badge>
          ) : null}
        </span>
      </span>
    </button>
  );
}
