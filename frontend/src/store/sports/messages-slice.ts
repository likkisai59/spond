import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ChatMessage, Conversation } from "@/types";
import { MOCK_CONVERSATIONS } from "@/sports/mocks/messages.mock";

export interface MessagesState {
  conversations: Conversation[];
}

const initialState: MessagesState = { conversations: MOCK_CONVERSATIONS };

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
      conversation.messages.push(message);
      conversation.lastMessage = message.content;
      conversation.lastMessageAt = now;
      conversation.updatedAt = now;
    },
    messageReceived(
      state,
      action: PayloadAction<{
        conversationId: string;
        senderName: string;
        content: string;
      }>
    ) {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (!conversation) return;
      const now = new Date().toISOString();
      const message: ChatMessage = {
        id: nanoid(8),
        senderId: nanoid(6),
        senderName: action.payload.senderName,
        content: action.payload.content,
        sentAt: now,
        isMine: false,
      };
      conversation.messages.push(message);
      conversation.lastMessage = message.content;
      conversation.lastMessageAt = now;
      conversation.updatedAt = now;
    },
  },
});

export const { conversationOpened, messageSent, messageReceived } =
  messagesSlice.actions;
export default messagesSlice.reducer;
