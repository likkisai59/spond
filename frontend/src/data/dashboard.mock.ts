export interface AttendanceTrendPoint {
  label: string;
  going: number;
  maybe: number;
}

export interface PaymentTrendPoint {
  label: string;
  collected: number;
  pending: number;
}

export const MOCK_ATTENDANCE_TREND: AttendanceTrendPoint[] = [
  { label: "Wk 1", going: 12, maybe: 5 },
  { label: "Wk 2", going: 15, maybe: 4 },
  { label: "Wk 3", going: 13, maybe: 6 },
  { label: "Wk 4", going: 18, maybe: 3 },
  { label: "Wk 5", going: 16, maybe: 5 },
  { label: "Wk 6", going: 21, maybe: 4 },
  { label: "Wk 7", going: 19, maybe: 6 },
  { label: "Wk 8", going: 24, maybe: 3 },
];

export const MOCK_PAYMENT_TREND: PaymentTrendPoint[] = [
  { label: "Mar", collected: 8200, pending: 3400 },
  { label: "Apr", collected: 9600, pending: 2800 },
  { label: "May", collected: 11400, pending: 3100 },
  { label: "Jun", collected: 10800, pending: 2200 },
  { label: "Jul", collected: 13500, pending: 2600 },
  { label: "Aug", collected: 15200, pending: 1800 },
];
