import type { Conversation } from "@/types";

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "cnv-01",
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-08-20T09:40:00.000Z",
    type: "Group",
    name: "Strikers FC — Team Chat",
    lastMessage: "Remember, semi-final Saturday 5 PM sharp!",
    lastMessageAt: "2026-08-20T09:40:00.000Z",
    unreadCount: 2,
    messages: [
      { id: "msg-01", senderId: "mem-s1", senderName: "Arjun Mehta", content: "Great win on Saturday, everyone.", sentAt: "2026-08-20T08:50:00.000Z", isMine: false },
      { id: "msg-02", senderId: "me", senderName: "You", content: "That second half press was unreal.", sentAt: "2026-08-20T08:55:00.000Z", isMine: true },
      { id: "msg-03", senderId: "mem-s2", senderName: "Rohan Verma", content: "Tactical session Wednesday to keep it sharp.", sentAt: "2026-08-20T09:05:00.000Z", isMine: false },
      { id: "msg-04", senderId: "mem-s1", senderName: "Arjun Mehta", content: "Remember, semi-final Saturday 5 PM sharp!", sentAt: "2026-08-20T09:40:00.000Z", isMine: false },
    ],
  },
  {
    id: "cnv-02",
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-08-20T08:10:00.000Z",
    type: "Group",
    name: "Deccan CC — Tour Planning",
    lastMessage: "Goa is leading the poll by 3 votes.",
    lastMessageAt: "2026-08-20T08:10:00.000Z",
    unreadCount: 1,
    messages: [
      { id: "msg-05", senderId: "mem-d1", senderName: "Vikram Reddy", content: "Tour poll is live, cast your votes.", sentAt: "2026-08-19T17:00:00.000Z", isMine: false },
      { id: "msg-06", senderId: "me", senderName: "You", content: "Voted. Coorg could be fun in December.", sentAt: "2026-08-19T17:22:00.000Z", isMine: true },
      { id: "msg-07", senderId: "mem-d2", senderName: "Ananya Iyer", content: "Goa is leading the poll by 3 votes.", sentAt: "2026-08-20T08:10:00.000Z", isMine: false },
    ],
  },
  {
    id: "cnv-03",
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-08-19T19:30:00.000Z",
    type: "Direct",
    name: "Rohan Verma",
    lastMessage: "Can you cover the drill setup on Wednesday?",
    lastMessageAt: "2026-08-19T19:30:00.000Z",
    unreadCount: 0,
    messages: [
      { id: "msg-08", senderId: "mem-s2", senderName: "Rohan Verma", content: "Can you cover the drill setup on Wednesday?", sentAt: "2026-08-19T19:30:00.000Z", isMine: false },
    ],
  },
  {
    id: "cnv-04",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: "2026-08-18T14:05:00.000Z",
    type: "Direct",
    name: "Neha Kapoor",
    lastMessage: "Registration receipts are in the Files tab.",
    lastMessageAt: "2026-08-18T14:05:00.000Z",
    unreadCount: 0,
    messages: [
      { id: "msg-09", senderId: "me", senderName: "You", content: "Did the tournament entry go through?", sentAt: "2026-08-18T13:58:00.000Z", isMine: true },
      { id: "msg-10", senderId: "mem-a1", senderName: "Neha Kapoor", content: "Registration receipts are in the Files tab.", sentAt: "2026-08-18T14:05:00.000Z", isMine: false },
    ],
  },
];
