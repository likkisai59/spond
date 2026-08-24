import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Conversation } from "@/types";

export interface MessagesService {
  listConversations(): Promise<ApiResponse<Conversation[]>>;
  getMessages(conversationId: string): Promise<ApiResponse<unknown>>;
  sendMessage(conversationId: string, content: string): Promise<ApiResponse<unknown>>;
}

export const messagesService: MessagesService = {
  listConversations: () => notImplemented("messagesService.listConversations"),
  getMessages: () => notImplemented("messagesService.getMessages"),
  sendMessage: () => notImplemented("messagesService.sendMessage"),
};
