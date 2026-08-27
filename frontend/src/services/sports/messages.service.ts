import { apiClient } from "@/services/api-client";
import type { ChatMessage, Conversation } from "@/types";

export interface MessagesService {
  listConversations(): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
}

export const messagesService: MessagesService = {
  listConversations: async () => {
    const { data } = await apiClient.get("/api/v1/messages/conversations");
    return data;
  },
  getMessages: async (conversationId: string) => {
    const { data } = await apiClient.get(`/api/v1/messages/${conversationId}/history`);
    return data;
  },
};
