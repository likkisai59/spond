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
      
      // Prevent duplicates
      if (conversation.messages.find((m: ChatMessage) => m.id === action.payload.message.id)) return;

      conversation.messages.push(action.payload.message);
      conversation.lastMessage = action.payload.message.content;
      conversation.lastMessageAt = action.payload.message.sentAt;
      conversation.unreadCount += 1;
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
        state.conversations = fetched.map((conv: Conversation) => ({
          ...conv,
          messages: state.conversations.find(c => c.id === conv.id)?.messages || conv.messages || []
        }));
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch conversations";
        state.conversations = [];
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
        if (conversation) {
          conversation.messages = action.payload.history;
        }
      })
      .addCase(fetchGroupsThunk.fulfilled, (state, action) => {
        const groups = (action.payload as SportsGroup[]) || [];
        const directChats = state.conversations.filter((c) => c.type === "Direct");
        const groupChats: Conversation[] = groups.map((group) => {
          const existing = state.conversations.find((c) => c.id === group.id);
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
        state.conversations = [...groupChats, ...directChats];
      });
  }

});

export const { conversationOpened, messageSent, messageReceived } =
  messagesSlice.actions;
export default messagesSlice.reducer;
