import type { GroupMember, SportsGroup } from "@/types";

export const MOCK_MEMBERS: Record<string, GroupMember[]> = {
  "grp-strikers": [
    { id: "mem-s1", name: "Arjun Mehta", email: "arjun@strikersfc.in", role: "Owner", status: "Active", joinedAt: "2026-01-12" },
    { id: "mem-s2", name: "Rohan Verma", email: "rohan@strikersfc.in", role: "Coach", status: "Active", joinedAt: "2026-01-15" },
    { id: "mem-s3", name: "Kabir Singh", email: "kabir@strikersfc.in", role: "Admin", status: "Active", joinedAt: "2026-02-02" },
    { id: "mem-s4", name: "Vihaan Rao", email: "vihaan@strikersfc.in", role: "Treasurer", status: "Active", joinedAt: "2026-02-10" },
    { id: "mem-s5", name: "Aditya Kaul", email: "aditya@strikersfc.in", role: "Member", status: "Active", joinedAt: "2026-03-01" },
    { id: "mem-s6", name: "Ishaan Nair", email: "ishaan@strikersfc.in", role: "Member", status: "Invited", joinedAt: "2026-08-18" },
  ],
  "grp-apex": [
    { id: "mem-a1", name: "Neha Kapoor", email: "neha@apexbb.in", role: "Owner", status: "Active", joinedAt: "2026-02-20" },
    { id: "mem-a2", name: "Sameer Joshi", email: "sameer@apexbb.in", role: "Coach", status: "Active", joinedAt: "2026-02-22" },
    { id: "mem-a3", name: "Riya Sen", email: "riya@apexbb.in", role: "Member", status: "Active", joinedAt: "2026-03-05" },
    { id: "mem-a4", name: "Dev Patel", email: "dev@apexbb.in", role: "Member", status: "Inactive", joinedAt: "2026-03-14" },
  ],
  "grp-deccan": [
    { id: "mem-d1", name: "Vikram Reddy", email: "vikram@deccancc.in", role: "Owner", status: "Active", joinedAt: "2026-01-30" },
    { id: "mem-d2", name: "Ananya Iyer", email: "ananya@deccancc.in", role: "Admin", status: "Active", joinedAt: "2026-02-08" },
    { id: "mem-d3", name: "Farhan Ali", email: "farhan@deccancc.in", role: "Member", status: "Active", joinedAt: "2026-04-19" },
    { id: "mem-d4", name: "Tanvi Desai", email: "tanvi@deccancc.in", role: "Treasurer", status: "Active", joinedAt: "2026-05-02" },
  ],
  "grp-warriors": [
    { id: "mem-w1", name: "Karan Malhotra", email: "karan@weekendwarriors.in", role: "Owner", status: "Active", joinedAt: "2026-03-22" },
    { id: "mem-w2", name: "Pooja Shetty", email: "pooja@weekendwarriors.in", role: "Member", status: "Active", joinedAt: "2026-04-01" },
    { id: "mem-w3", name: "Nikhil Bhat", email: "nikhil@weekendwarriors.in", role: "Member", status: "Invited", joinedAt: "2026-08-15" },
  ],
};

export const MOCK_GROUPS: SportsGroup[] = [
  {
    id: "grp-strikers",
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-08-19T18:30:00.000Z",
    name: "Strikers FC",
    description:
      "Competitive football club running weekend leagues, midweek training and youth academies across Mumbai.",
    category: "Football",
    location: "Mumbai, MH",
    memberCount: 6,
    members: MOCK_MEMBERS["grp-strikers"],
  },
  {
    id: "grp-apex",
    createdAt: "2026-02-20T09:00:00.000Z",
    updatedAt: "2026-08-18T12:00:00.000Z",
    name: "Apex Basketball",
    description:
      "Street-ball collective organising 3x3 tournaments and nightly pickup games in Pune.",
    category: "Basketball",
    location: "Pune, MH",
    memberCount: 4,
    members: MOCK_MEMBERS["grp-apex"],
  },
  {
    id: "grp-deccan",
    createdAt: "2026-01-30T09:00:00.000Z",
    updatedAt: "2026-08-17T16:45:00.000Z",
    name: "Deccan Cricket Club",
    description:
      "Legacy cricket club with Sunday fixtures, net sessions and a thriving junior section.",
    category: "Cricket",
    location: "Hyderabad, TS",
    memberCount: 4,
    members: MOCK_MEMBERS["grp-deccan"],
  },
  {
    id: "grp-warriors",
    createdAt: "2026-03-22T09:00:00.000Z",
    updatedAt: "2026-08-10T10:20:00.000Z",
    name: "Weekend Warriors",
    description:
      "Recreational fitness group for weekend runs, circuits and post-training brunches.",
    category: "Training",
    location: "Bengaluru, KA",
    memberCount: 3,
    members: MOCK_MEMBERS["grp-warriors"],
  },
];
