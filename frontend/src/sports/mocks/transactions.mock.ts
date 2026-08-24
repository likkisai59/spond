import type { PaymentTransaction } from "@/types";

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  { id: "txn-01", paymentId: "pay-01", createdAt: "2026-08-19T09:10:00.000Z", updatedAt: "2026-08-19T09:10:00.000Z", memberName: "Rohan Verma", amount: 1200, method: "UPI", status: "Success", paidOn: "2026-08-19T09:10:00.000Z", reference: "UPI/52119047" },
  { id: "txn-02", paymentId: "pay-01", createdAt: "2026-08-18T17:45:00.000Z", updatedAt: "2026-08-18T17:45:00.000Z", memberName: "Vihaan Rao", amount: 1200, method: "Card", status: "Success", paidOn: "2026-08-18T17:45:00.000Z", reference: "CARD/8842" },
  { id: "txn-03", paymentId: "pay-01", createdAt: "2026-08-17T11:05:00.000Z", updatedAt: "2026-08-17T11:05:00.000Z", memberName: "Kabir Singh", amount: 1200, method: "UPI", status: "Pending", paidOn: "2026-08-17T11:05:00.000Z", reference: "UPI/7710" },
  { id: "txn-04", paymentId: "pay-01", createdAt: "2026-08-16T08:30:00.000Z", updatedAt: "2026-08-16T08:30:00.000Z", memberName: "Ananya Iyer", amount: 1200, method: "Net Banking", status: "Success", paidOn: "2026-08-16T08:30:00.000Z", reference: "NB/30281" },
  { id: "txn-05", paymentId: "pay-02", createdAt: "2026-08-14T19:20:00.000Z", updatedAt: "2026-08-14T19:20:00.000Z", memberName: "Sameer Joshi", amount: 850, method: "UPI", status: "Success", paidOn: "2026-08-14T19:20:00.000Z", reference: "UPI/40913" },
  { id: "txn-06", paymentId: "pay-02", createdAt: "2026-08-13T10:15:00.000Z", updatedAt: "2026-08-13T10:15:00.000Z", memberName: "Karan Malhotra", amount: 850, method: "Card", status: "Failed", paidOn: "2026-08-13T10:15:00.000Z", reference: "CARD/9917" },
  { id: "txn-07", paymentId: "pay-03", createdAt: "2026-08-12T14:00:00.000Z", updatedAt: "2026-08-12T14:00:00.000Z", memberName: "Neha Kapoor", amount: 500, method: "UPI", status: "Success", paidOn: "2026-08-12T14:00:00.000Z", reference: "UPI/66350" },
  { id: "txn-08", paymentId: "pay-04", createdAt: "2026-08-11T09:55:00.000Z", updatedAt: "2026-08-11T09:55:00.000Z", memberName: "Arjun Mehta", amount: 750, method: "UPI", status: "Success", paidOn: "2026-08-11T09:55:00.000Z", reference: "UPI/11278" },
  { id: "txn-09", paymentId: "pay-04", createdAt: "2026-08-10T16:40:00.000Z", updatedAt: "2026-08-10T16:40:00.000Z", memberName: "Vikram Reddy", amount: 750, method: "Cash", status: "Success", paidOn: "2026-08-10T16:40:00.000Z", reference: "CASH/0142" },
  { id: "txn-10", paymentId: "pay-06", createdAt: "2026-07-27T12:25:00.000Z", updatedAt: "2026-07-27T12:25:00.000Z", memberName: "Riya Sen", amount: 200, method: "UPI", status: "Refunded", paidOn: "2026-07-27T12:25:00.000Z", reference: "UPI/55802" },
];
