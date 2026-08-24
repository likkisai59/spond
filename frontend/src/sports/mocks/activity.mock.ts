import type { ActivityItem } from "@/types";

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "act-01", kind: "event", title: "Attendance recorded", description: "16 players marked 'Going' for the Semi Final.", actor: "Arjun Mehta", timestamp: "2026-08-20T09:45:00.000Z" },
  { id: "act-02", kind: "payment", title: "Payment received", description: "Riya Sen paid Tournament Registration (₹750).", actor: "Vihaan Rao", timestamp: "2026-08-20T08:30:00.000Z" },
  { id: "act-03", kind: "poll", title: "New poll created", description: "“Winter tour destination” is open for votes.", actor: "Vikram Reddy", timestamp: "2026-08-19T17:05:00.000Z" },
  { id: "act-04", kind: "member", title: "Member invited", description: "Ishaan Nair was invited to Strikers FC.", actor: "Kabir Singh", timestamp: "2026-08-19T14:20:00.000Z" },
  { id: "act-05", kind: "file", title: "File uploaded", description: "semi-final-tactics.png added to Training.", actor: "Rohan Verma", timestamp: "2026-08-19T09:02:00.000Z" },
  { id: "act-06", kind: "message", title: "New messages", description: "6 new messages in Deccan CC — Tour Planning.", actor: "Ananya Iyer", timestamp: "2026-08-19T08:15:00.000Z" },
  { id: "act-07", kind: "event", title: "Event created", description: "3x3 Street Tournament scheduled for Aug 30.", actor: "Neha Kapoor", timestamp: "2026-08-18T16:00:00.000Z" },
  { id: "act-08", kind: "payment", title: "Payment overdue", description: "Away Kit — Second Instalment is past due.", actor: "System", timestamp: "2026-08-16T00:05:00.000Z" },
];

export const MOCK_POSTS = [
  { id: "post-01", groupId: "grp-strikers", author: "Rohan Verma", content: "Set-piece video review is up — watch the near-post routine before Wednesday.", createdAt: "2026-08-19T15:00:00.000Z", updatedAt: "2026-08-19T15:00:00.000Z" },
  { id: "post-02", groupId: "grp-strikers", author: "Vihaan Rao", content: "August budget is finalised. Slight surplus thanks to the friendly gate fees.", createdAt: "2026-08-18T11:30:00.000Z", updatedAt: "2026-08-18T11:30:00.000Z" },
  { id: "post-03", groupId: "grp-strikers", author: "Arjun Mehta", content: "Congratulations on the quarter-final win. Semi-final tickets for family are in Files.", createdAt: "2026-08-17T20:10:00.000Z", updatedAt: "2026-08-17T20:10:00.000Z" },
  { id: "post-04", groupId: "grp-deccan", author: "Ananya Iyer", content: "September net slots are locked — see the schedule spreadsheet.", createdAt: "2026-08-18T09:00:00.000Z", updatedAt: "2026-08-18T09:00:00.000Z" },
] as const;
