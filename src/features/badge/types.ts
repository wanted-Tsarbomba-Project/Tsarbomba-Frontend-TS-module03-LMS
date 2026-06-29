export interface MyBadge {
  badgeId: number;
  badgeName: string;
  description: string;
  requiredPoint: number;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE";
  earnedAt: string;
  isEquipped: boolean;
}

export interface BadgeSyncResult {
  totalPoint: number;
  newlyEarnedBadgeCount: number;
  newlyEarnedBadges: MyBadge[];
}
