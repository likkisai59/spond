import type { EventAttendanceRecord } from "@/types";

export const MOCK_ATTENDANCE_RECORDS: EventAttendanceRecord[] = [
  {
    eventId: "evt-101",
    responses: [
      { memberId: "mem-s1", memberName: "Arjun Mehta", response: "Going" },
      { memberId: "mem-s2", memberName: "Rohan Verma", response: "Going" },
      { memberId: "mem-s3", memberName: "Kabir Singh", response: "Going" },
      { memberId: "mem-s4", memberName: "Vihaan Rao", response: "Maybe" },
      { memberId: "mem-s5", memberName: "Aditya Kaul", response: "Going" },
      { memberId: "mem-s6", memberName: "Ishaan Nair", response: "No response" },
    ],
  },
  {
    eventId: "evt-102",
    responses: [
      { memberId: "mem-s1", memberName: "Arjun Mehta", response: "Going" },
      { memberId: "mem-s2", memberName: "Rohan Verma", response: "Going" },
      { memberId: "mem-s3", memberName: "Kabir Singh", response: "Maybe" },
      { memberId: "mem-s4", memberName: "Vihaan Rao", response: "Going" },
      { memberId: "mem-s5", memberName: "Aditya Kaul", response: "No response" },
      { memberId: "mem-s6", memberName: "Ishaan Nair", response: "No response" },
    ],
  },
  {
    eventId: "evt-103",
    responses: [
      { memberId: "mem-d1", memberName: "Vikram Reddy", response: "Going" },
      { memberId: "mem-d2", memberName: "Ananya Iyer", response: "Going" },
      { memberId: "mem-d3", memberName: "Farhan Ali", response: "Maybe" },
      { memberId: "mem-d4", memberName: "Tanvi Desai", response: "No response" },
    ],
  },
  {
    eventId: "evt-105",
    responses: [
      { memberId: "mem-w1", memberName: "Karan Malhotra", response: "Going" },
      { memberId: "mem-w2", memberName: "Pooja Shetty", response: "Maybe" },
      { memberId: "mem-w3", memberName: "Nikhil Bhat", response: "No response" },
    ],
  },
  {
    eventId: "evt-201",
    responses: [
      { memberId: "mem-s1", memberName: "Arjun Mehta", response: "Going" },
      { memberId: "mem-s2", memberName: "Rohan Verma", response: "Going" },
      { memberId: "mem-s3", memberName: "Kabir Singh", response: "Going" },
      { memberId: "mem-s4", memberName: "Vihaan Rao", response: "Maybe" },
      { memberId: "mem-s5", memberName: "Aditya Kaul", response: "Going" },
      { memberId: "mem-s6", memberName: "Ishaan Nair", response: "Going" },
    ],
  },
];
