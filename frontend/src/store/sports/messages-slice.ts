import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ChatMessage, Conversation, SportsGroup } from "@/types";
import { MOCK_CONVERSATIONS } from "@/sports/mocks/messages.mock";
import { fetchGroupsThunk } from "./groups-slice";

export interface MessagesState {
  conversations: Conversation[];
}

const initialState: MessagesState = {
  conversations: MOCK_CONVERSATIONS.filter((c) => c.type !== "Group"),
};

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
  extraReducers: (builder) => {
    builder.addCase(fetchGroupsThunk.fulfilled, (state, action) => {
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
  },
});

export const { conversationOpened, messageSent, messageReceived } =
  messagesSlice.actions;
export default messagesSlice.reducer;
