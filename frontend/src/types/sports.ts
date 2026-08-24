import type { BaseEntity } from "./common";

export const GROUP_CATEGORIES = [
  "Football",
  "Basketball",
  "Cricket",
  "Tennis",
  "Training",
  "Social",
] as const;
export type GroupCategory = (typeof GROUP_CATEGORIES)[number];

export const SPORT_TYPES = [
  "Football",
  "Cricket",
  "Basketball",
  "Tennis",
  "Badminton",
  "Athletics",
  "Hockey",
  "Other",
] as const;
export type SportType = (typeof SPORT_TYPES)[number];

export const GROUP_VISIBILITIES = ["Public", "Private"] as const;
export type GroupVisibility = (typeof GROUP_VISIBILITIES)[number];

export const MEMBER_ROLES = [
  "Owner",
  "Admin",
  "Coach",
  "Treasurer",
  "Member",
] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const MEMBER_STATUSES = ["Active", "Invited", "Inactive"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

export interface SportsGroup extends BaseEntity {
  name: string;
  description: string;
  category: GroupCategory;
  location: string;
  memberCount: number;
  members: GroupMember[];
  sportType?: SportType;
  visibility?: GroupVisibility;
}

export const EVENT_TYPES = [
  "Training",
  "Match",
  "Meeting",
  "Social",
  "Tournament",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface EventAttendance {
  going: number;
  maybe: number;
  notResponded: number;
}

export interface SportsEvent extends BaseEntity {
  groupId: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: EventStatus;
  attendance: EventAttendance;
  notifyMembers: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export const POLL_STATUSES = ["Active", "Closed"] as const;
export type PollStatus = (typeof POLL_STATUSES)[number];

export interface SportsPoll extends BaseEntity {
  groupId: string;
  question: string;
  options: PollOption[];
  multipleChoice: boolean;
  expiresAt: string;
  status: PollStatus;
  createdBy: string;
  votedOptionIds: string[];
}

export const PAYMENT_STATUSES = ["Paid", "Pending", "Overdue"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface PaymentRequest extends BaseEntity {
  groupId: string;
  title: string;
  amount: number;
  dueDate: string;
  description?: string;
  status: PaymentStatus;
  paidCount: number;
  totalMembers: number;
}

export const PAYMENT_METHODS = ["UPI", "Card", "Net Banking", "Cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const TRANSACTION_STATUSES = [
  "Success",
  "Pending",
  "Failed",
  "Refunded",
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export interface PaymentTransaction extends BaseEntity {
  paymentId: string;
  memberName: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  paidOn: string;
  reference: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isMine: boolean;
}

export const CONVERSATION_TYPES = ["Group", "Direct"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export interface Conversation extends BaseEntity {
  type: ConversationType;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const FILE_TYPES = [
  "Image",
  "Document",
  "Spreadsheet",
  "PDF",
  "Video",
] as const;
export type FileType = (typeof FILE_TYPES)[number];

export interface SportsFile extends BaseEntity {
  name: string;
  type: FileType;
  sizeKb: number;
  folder: string;
  uploadedBy: string;
  groupId?: string;
}

export type ActivityKind =
  | "event"
  | "payment"
  | "poll"
  | "member"
  | "message"
  | "file";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface GroupPost extends BaseEntity {
  groupId: string;
  author: string;
  content: string;
}

export type AttendanceResponse = "Going" | "Maybe" | "No response";

export interface EventAttendanceRecord {
  eventId: string;
  responses: {
    memberId: string;
    memberName: string;
    response: AttendanceResponse;
  }[];
}

export const VENUE_SURFACES = [
  "Turf",
  "Grass",
  "Indoor",
  "Clay",
  "Synthetic",
] as const;
export type VenueSurface = (typeof VENUE_SURFACES)[number];

export interface VenueSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface SportsVenue extends BaseEntity {
  name: string;
  description: string;
  city: string;
  address: string;
  surface: VenueSurface;
  sports: SportType[];
  capacity: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
}

export const VENUE_BOOKING_STATUSES = [
  "Confirmed",
  "Pending",
  "Cancelled",
  "Completed",
] as const;
export type VenueBookingStatus = (typeof VENUE_BOOKING_STATUSES)[number];

export interface VenueBooking extends BaseEntity {
  venueId: string;
  venueName: string;
  eventDate: string;
  slotId: string;
  slotLabel: string;
  groupName: string;
  price: number;
  status: VenueBookingStatus;
}

export const MATCH_TIMELINE_KINDS = [
  "Goal",
  "Assist",
  "Yellow card",
  "Red card",
  "Substitution",
  "Half time",
  "Full time",
] as const;
export type MatchTimelineKind = (typeof MATCH_TIMELINE_KINDS)[number];

export interface MatchTimelineItem {
  id: string;
  minute: number;
  kind: MatchTimelineKind;
  side: "home" | "away";
  player: string;
  detail?: string;
}

export interface MatchTeamStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
}

export type MatchResult = "Win" | "Draw" | "Loss" | "Scheduled";

export interface MatchSummary extends BaseEntity {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  result: MatchResult;
  venue: string;
  kickoff: string;
  timeline: MatchTimelineItem[];
  teamStats: { home: MatchTeamStats; away: MatchTeamStats };
  topPerformers: { id: string; name: string; stat: string }[];
  manOfTheMatch: string | null;
}

export interface PlayerStats {
  id: string;
  name: string;
  groupName: string;
  role: MemberRole;
  matches: number;
  goals: number;
  assists: number;
  attendanceRate: number;
  mvpAwards: number;
}
