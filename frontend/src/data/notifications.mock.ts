import type { AppNotification } from "@/types";

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-seed-event",
    title: "New event",
    message: "Semi Final fixture was added to the Strikers FC calendar.",
    variant: "info",
    read: false,
    createdAt: "2026-08-21T07:30:00.000Z",
  },
  {
    id: "notif-seed-poll",
    title: "New poll",
    message: "“Winter tour destination” is open for votes in Deccan CC.",
    variant: "info",
    read: false,
    createdAt: "2026-08-20T18:10:00.000Z",
  },
  {
    id: "notif-seed-payment",
    title: "Payment request",
    message: "August — Pitch & Referee Fees (₹1,200) is due Aug 25.",
    variant: "warning",
    read: true,
    createdAt: "2026-08-20T09:45:00.000Z",
  },
  {
    id: "notif-seed-message",
    title: "New message",
    message: "Ananya Iyer in Tour Planning: “September net slots are locked.”",
    variant: "info",
    read: true,
    createdAt: "2026-08-19T14:05:00.000Z",
  },
];
