export interface MyProfile {
  email: string;
  name: string;
  nickname: string;
  phone: string;
  role: string;
  provider: string;
  emailVerified: boolean;
}

export type Mode = "view" | "verify" | "edit";

/* 로그인 이력 — GET /me/login-history */
export interface LoginHistoryItem {
  loginHistoryId: number;
  ipAddress: string;
  country: string | null;
  city: string | null;
  isSuspicious: boolean;
  createdAt: string;
}

/* 신뢰 기기 — GET /me/trusted-devices */
export interface TrustedDeviceItem {
  id: number;
  deviceName: string;
  lastCountry: string | null;
  lastCity: string | null;
  lastUsedAt: string;
  current: boolean;
}
