import {
  createSlice,
  createAsyncThunk,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ChatMessage, Conversation } from "@/types";
import { messagesService } from "@/services/sports/messages.service";
import { MOCK_CONVERSATIONS } from "@/sports/mocks/messages.mock";

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
      if (conversation.messages.find(m => m.id === action.payload.message.id)) return;

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
        // Merge state or overwrite, fallback to mock if empty
        const fetched = action.payload.length > 0 ? action.payload : MOCK_CONVERSATIONS;
        state.conversations = fetched.map(conv => ({
          ...conv,
          messages: state.conversations.find(c => c.id === conv.id)?.messages || conv.messages || []
        }));
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch conversations";
        // Fallback to mock data if API fails (e.g. not signed in)
        state.conversations = MOCK_CONVERSATIONS;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
        if (conversation) {
          conversation.messages = action.payload.history;
        }
      });
  }
});

export const { conversationOpened, messageSent, messageReceived } =
  messagesSlice.actions;
export default messagesSlice.reducer;
