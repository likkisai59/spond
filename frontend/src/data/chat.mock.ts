export interface ChatParticipant {
  name: string;
  online: boolean;
}

export const MOCK_CHAT_PARTICIPANTS: Record<string, ChatParticipant[]> = {
  "cnv-01": [
    { name: "Arjun Mehta", online: true },
    { name: "Rohan Verma", online: true },
    { name: "Vihaan Rao", online: false },
    { name: "Kabir Singh", online: true },
    { name: "Ishaan Gupta", online: false },
    { name: "Riya Sen", online: false },
  ],
  "cnv-02": [
    { name: "Vikram Reddy", online: true },
    { name: "Ananya Iyer", online: false },
    { name: "Kiran Deshpande", online: true },
    { name: "Mihir Kulkarni", online: false },
  ],
  "cnv-03": [{ name: "Rohan Verma", online: true }],
  "cnv-04": [{ name: "Neha Kapoor", online: false }],
};

export const MOCK_REALTIME_MESSAGES = [
  "Anyone free for a kickabout later? ⚽",
  "Reminder: bring both jerseys for the semi-final 👕",
  "Pitch directions are in the group files 📍",
  "Great session today, everyone 💪",
  "Collector will be at the ground 30 mins early 🏏",
] as const;
