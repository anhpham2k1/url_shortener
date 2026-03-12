export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  plan: string;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Link {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title: string;
  status: 'ACTIVE' | 'DISABLED';
  clicks: number;
  expiresAt?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  clicks: number;
}

export interface LinkAnalytics {
  shortCode: string;
  totalClicks: number;
  dailyStats: DailyStats[];
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  recentLinks: Link[];
}
