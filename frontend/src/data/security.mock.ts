export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const MOCK_SESSIONS: DeviceSession[] = [
  {
    id: "ses-01",
    device: "MacBook Pro",
    browser: "Chrome 128",
    location: "Mumbai, IN",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "ses-02",
    device: "iPhone 15",
    browser: "Safari",
    location: "Mumbai, IN",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "ses-03",
    device: "Windows PC",
    browser: "Edge 127",
    location: "Pune, IN",
    lastActive: "Yesterday, 8:14 PM",
    current: false,
  },
];

export interface LoginActivityItem {
  id: string;
  datetime: string;
  device: string;
  browser: string;
  location: string;
  status: "Success" | "Failed";
}

export const MOCK_LOGIN_ACTIVITY: LoginActivityItem[] = [
  {
    id: "log-01",
    datetime: "2026-08-21T08:02:00.000Z",
    device: "MacBook Pro",
    browser: "Chrome 128",
    location: "Mumbai, IN",
    status: "Success",
  },
  {
    id: "log-02",
    datetime: "2026-08-20T19:41:00.000Z",
    device: "iPhone 15",
    browser: "Safari",
    location: "Mumbai, IN",
    status: "Success",
  },
  {
    id: "log-03",
    datetime: "2026-08-20T07:12:00.000Z",
    device: "Windows PC",
    browser: "Edge 127",
    location: "Pune, IN",
    status: "Failed",
  },
  {
    id: "log-04",
    datetime: "2026-08-19T17:55:00.000Z",
    device: "MacBook Pro",
    browser: "Chrome 128",
    location: "Mumbai, IN",
    status: "Success",
  },
  {
    id: "log-05",
    datetime: "2026-08-18T09:30:00.000Z",
    device: "iPad Air",
    browser: "Safari",
    location: "Thane, IN",
    status: "Success",
  },
];
