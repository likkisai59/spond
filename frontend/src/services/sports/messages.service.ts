import { apiClient } from "@/services/api-client";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import type { ChatMessage, Conversation } from "@/types";

export interface MessagesService {
  listConversations(): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(conversationId: string, content: string): Promise<ChatMessage>;
  createDirectConversation(targetUserId: string): Promise<Conversation>;
  createGroupConversation(groupId: string, groupName: string): Promise<Conversation>;
}

export const messagesService: MessagesService = {
  listConversations: async () => {
    try {
      const { data } = await apiClient.get("/api/v1/conversations");
      return data?.data || data || [];
    } catch {
      return [];
    }
  },
  getMessages: async (conversationId: string) => {
    try {
      const { data } = await apiClient.get(`/api/v1/conversations/${conversationId}/messages`);
      const rawMessages = data?.data || data || [];
      const currentUser = storage.get<any>(STORAGE_KEYS.USER);
      const currentUserId = currentUser?.id;
      return rawMessages.map((m: any) => {
        const senderId = m.senderId || m.sender_id;
        const isMine = Boolean(m.isMine || (currentUserId && senderId === currentUserId) || senderId === "me");
        return {
          id: m.id || m._id,
          conversationId,
          senderId,
          senderName: m.senderName || m.sender_name || "Member",
          content: m.content || "",
          sentAt: m.sentAt || m.created_at || m.createdAt || new Date().toISOString(),
          isMine,
        };
      });
    } catch {
      return [];
    }
  },
  sendMessage: async (conversationId: string, content: string) => {
    const { data } = await apiClient.post(`/api/v1/conversations/${conversationId}/messages`, { content });
    return data?.data || data;
  },
  createDirectConversation: async (targetUserId: string) => {
    const { data } = await apiClient.post("/api/v1/conversations/direct", { target_user_id: targetUserId });
    return data?.data || data;
  },
  createGroupConversation: async (groupId: string, groupName: string) => {
    const { data } = await apiClient.post("/api/v1/conversations/group", { group_id: groupId, group_name: groupName });
    return data?.data || data;
  },
};
