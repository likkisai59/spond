import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { messageReceived } from "@/store/sports/messages-slice";
import type { ChatMessage } from "@/types";

export function useChatWebSocket(conversationId: string | null) {
  const dispatch = useAppDispatch();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Use ws:// for localhost, wss:// for production
    const wsUrl = `ws://localhost:8000/api/v1/messages/ws/${conversationId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected for conversation:", conversationId);
    };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ChatMessage;
        // The sender receives it back too but isMine handling in component handles it.
        // Also the slice checks for duplicates by ID
        dispatch(
          messageReceived({
            conversationId,
            message: payload,
          })
        );
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [conversationId, dispatch]);

  const sendMessage = (content: string, senderId = "me", senderName = "You") => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          content,
          senderId,
          senderName,
        })
      );
    }
  };

  return { sendMessage };
}
