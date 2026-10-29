import {
  createSlice,
  createAsyncThunk,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ChatMessage, Conversation, SportsGroup } from "@/types";
import { messagesService } from "@/services/sports";
import { fetchGroupsThunk } from "./groups-slice";

export interface MessagesState {
  conversations: Conversation[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MessagesState = { 
  conversations: [],
  status: "idle",
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "sports/messages/fetchConversations",
  async () => {
    return await messagesService.listConversations();
  }
);

export const fetchHistory = createAsyncThunk(
  "sports/messages/fetchHistory",
  async (conversationId: string) => {
    const history = await messagesService.getMessages(conversationId);
    return { conversationId, history };
  }
);

export const startDirectChatThunk = createAsyncThunk(
  "sports/messages/startDirectChat",
  async (targetUserId: string) => {
    return await messagesService.createDirectConversation(targetUserId);
  }
);

export const sendMessageThunk = createAsyncThunk(
  "sports/messages/sendMessage",
  async ({ conversationId, content }: { conversationId: string; content: string }) => {
    return await messagesService.sendMessage(conversationId, content);
  }
);

const messagesSlice = createSlice({
  name: "sports/messages",
  initialState,
  reducers: {
    conversationOpened(state, action: PayloadAction<string>) {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload
      );
      if (conversation) conversation.unreadCount = 0;
    },
    messageSent(state, action: PayloadAction<{ conversationId: string; content: string }>) {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (!conversation) return;
      const now = new Date().toISOString();
      const message: ChatMessage = {
        id: nanoid(8),
        senderId: "me",
        senderName: "You",
        content: action.payload.content,
        sentAt: now,
        isMine: true,
      };
      if (!conversation.messages) conversation.messages = [];
      conversation.messages.push(message);
      conversation.lastMessage = message.content;
      conversation.lastMessageAt = now;
    },
    messageReceived(
      state,
      action: PayloadAction<{
        conversationId: string;
        message: ChatMessage;
      }>
    ) {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (!conversation) return;
      if (!conversation.messages) conversation.messages = [];
      
      // Prevent duplicates by ID
      if (conversation.messages.find((m: ChatMessage) => m.id === action.payload.message.id)) return;

      // Check if this matches a locally sent optimistic message
      const pendingIndex = conversation.messages.findIndex(
        (m: ChatMessage) =>
          (m.isMine || m.senderId === "me" || m.senderId === action.payload.message.senderId) &&
          m.content === action.payload.message.content
      );

      if (pendingIndex !== -1) {
        conversation.messages[pendingIndex] = {
          ...action.payload.message,
          isMine: true,
        };
      } else {
        conversation.messages.push(action.payload.message);
        conversation.unreadCount += 1;
      }

      conversation.lastMessage = action.payload.message.content;
      conversation.lastMessageAt = action.payload.message.sentAt;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        const fetched = action.payload || [];
        const formattedFetched = fetched.map((conv: any) => ({
          id: conv.id || conv._id,
          groupId: conv.group_id || conv.groupId,
          type: (conv.type === "GROUP" || conv.type === "Group") ? ("Group" as const) : ("Direct" as const),
          name: conv.name || (conv.type === "GROUP" ? "Team Chat" : "Member"),
          lastMessage: conv.lastMessage || conv.last_message || "No messages yet.",
          lastMessageAt: conv.lastMessageAt || conv.last_message_at || new Date().toISOString(),
          unreadCount: conv.unreadCount || conv.unread_count || 0,
          messages: state.conversations.find(c => c.id === (conv.id || conv._id))?.messages || conv.messages || [],
          createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
          updatedAt: conv.updatedAt || conv.updated_at || new Date().toISOString(),
        }));
        const map = new Map<string, Conversation>();
        formattedFetched.forEach((c: Conversation) => map.set(c.id, c));
        state.conversations.forEach((c: Conversation) => {
          if (!map.has(c.id)) map.set(c.id, c);
        });
        state.conversations = Array.from(map.values());
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch conversations";
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
        if (conversation) {
          conversation.messages = action.payload.history;
        }
      })
      .addCase(startDirectChatThunk.fulfilled, (state, action) => {
        const conv = action.payload as any;
        if (!conv) return;
        const formatted: Conversation = {
          id: conv.id || conv._id,
          type: "Direct",
          name: conv.name || "Member",
          lastMessage: conv.lastMessage || conv.last_message || "Started a conversation",
          lastMessageAt: conv.lastMessageAt || conv.last_message_at || new Date().toISOString(),
          unreadCount: 0,
          messages: [],
          createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
          updatedAt: conv.updatedAt || conv.updated_at || new Date().toISOString(),
        };
        const existingIdx = state.conversations.findIndex(c => c.id === formatted.id);
        if (existingIdx >= 0) {
          state.conversations[existingIdx] = {
            ...state.conversations[existingIdx],
            ...formatted,
            messages: state.conversations[existingIdx].messages
          };
        } else {
          state.conversations.unshift(formatted);
        }
      })
      .addCase(fetchGroupsThunk.fulfilled, (state, action) => {
        const groups = (action.payload as SportsGroup[]) || [];
        const nonGroupChats = state.conversations.filter((c) => c.type !== "Group");
        const existingGroupChats = state.conversations.filter((c) => c.type === "Group");
        const groupChats: Conversation[] = groups.map((group) => {
          const existing = existingGroupChats.find((c: any) => c.id === group.id || c.groupId === group.id);
          return (
            existing ?? {
              id: group.id,
              type: "Group",
              name: group.name,
              lastMessage: "No messages yet. Start team discussion.",
              lastMessageAt:
                group.updatedAt || group.createdAt || new Date().toISOString(),
              unreadCount: 0,
              messages: [],
              createdAt: group.createdAt || new Date().toISOString(),
              updatedAt: group.updatedAt || new Date().toISOString(),
            }
          );
        });
        state.conversations = [...groupChats, ...nonGroupChats];
      });
  }

});

export const { conversationOpened, messageSent, messageReceived } =
  messagesSlice.actions;
export default messagesSlice.reducer;
