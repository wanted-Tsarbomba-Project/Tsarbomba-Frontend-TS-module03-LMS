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
