import type { SportsFile } from "@/types";

export const MOCK_FILES: SportsFile[] = [
  { id: "file-01", createdAt: "2026-08-19T09:00:00.000Z", updatedAt: "2026-08-19T09:00:00.000Z", name: "semi-final-tactics.png", type: "Image", sizeKb: 820, folder: "Training", uploadedBy: "Rohan Verma", groupId: "grp-strikers" },
  { id: "file-02", createdAt: "2026-08-18T15:30:00.000Z", updatedAt: "2026-08-18T15:30:00.000Z", name: "august-budget.xlsx", type: "Spreadsheet", sizeKb: 145, folder: "Finance", uploadedBy: "Vihaan Rao", groupId: "grp-strikers" },
  { id: "file-03", createdAt: "2026-08-17T11:00:00.000Z", updatedAt: "2026-08-17T11:00:00.000Z", name: "tournament-rules.pdf", type: "PDF", sizeKb: 512, folder: "Documents", uploadedBy: "Neha Kapoor", groupId: "grp-apex" },
  { id: "file-04", createdAt: "2026-08-16T18:20:00.000Z", updatedAt: "2026-08-16T18:20:00.000Z", name: "quarter-final-highlights.mp4", type: "Video", sizeKb: 48200, folder: "Media", uploadedBy: "Arjun Mehta", groupId: "grp-strikers" },
  { id: "file-05", createdAt: "2026-08-15T08:45:00.000Z", updatedAt: "2026-08-15T08:45:00.000Z", name: "tour-itinerary.docx", type: "Document", sizeKb: 96, folder: "Documents", uploadedBy: "Vikram Reddy", groupId: "grp-deccan" },
  { id: "file-06", createdAt: "2026-08-14T13:10:00.000Z", updatedAt: "2026-08-14T13:10:00.000Z", name: "net-schedule-september.xlsx", type: "Spreadsheet", sizeKb: 88, folder: "Training", uploadedBy: "Ananya Iyer", groupId: "grp-deccan" },
  { id: "file-07", createdAt: "2026-08-13T10:00:00.000Z", updatedAt: "2026-08-13T10:00:00.000Z", name: "team-photo-2026.jpg", type: "Image", sizeKb: 2400, folder: "Media", uploadedBy: "Kabir Singh", groupId: "grp-strikers" },
  { id: "file-08", createdAt: "2026-08-11T16:40:00.000Z", updatedAt: "2026-08-11T16:40:00.000Z", name: "insurance-certificate.pdf", type: "PDF", sizeKb: 320, folder: "Documents", uploadedBy: "Sameer Joshi", groupId: "grp-apex" },
  { id: "file-09", createdAt: "2026-08-09T07:15:00.000Z", updatedAt: "2026-08-09T07:15:00.000Z", name: "brunch-fund-receipt.pdf", type: "PDF", sizeKb: 64, folder: "Finance", uploadedBy: "Karan Malhotra", groupId: "grp-warriors" },
];

export const FILE_FOLDERS = [
  "All",
  "Training",
  "Documents",
  "Media",
  "Finance",
] as const;
