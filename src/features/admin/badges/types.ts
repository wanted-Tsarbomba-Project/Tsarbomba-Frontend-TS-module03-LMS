export type BadgeStatus = "ACTIVE" | "INACTIVE" | "DELETED" | string;

export interface AdminBadge {
  badgeId: number;
  badgeName: string;
  description?: string | null;
  requiredPoint: number;
  imageUrl?: string | null;
  status: BadgeStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateBadgePayload {
  badgeName: string;
  description: string;
  requiredPoint: number;
}

export interface UpdateBadgePayload extends CreateBadgePayload {
  status: BadgeStatus;
}
