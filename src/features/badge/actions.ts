import type { BadgeSyncResult, MyBadge } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`badge API 오류: ${res.status}`);
  }

  const json = (await res.json()) as { data: T };

  return json.data;
}

export async function getMyBadges(): Promise<MyBadge[]> {
  return apiFetch<MyBadge[]>("/api/v1/badges/me");
}

export async function equipBadge(badgeId: number): Promise<MyBadge> {
  return apiFetch<MyBadge>(`/api/v1/badges/me/${badgeId}/equip`, {
    method: "PATCH",
  });
}

export async function syncMyBadges(): Promise<BadgeSyncResult> {
  return apiFetch<BadgeSyncResult>("/api/v1/badges/me/sync", {
    method: "POST",
  });
}
