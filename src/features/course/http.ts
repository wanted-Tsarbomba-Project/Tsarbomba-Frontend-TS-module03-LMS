const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 상대 경로면 BASE_URL을 붙이고, blob:/data:/절대 URL은 그대로 통과.
export const resolveThumbnailUrl = (url?: string | null): string => {
  if (!url) return "";
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

/**
 * 공통 fetch — 쿠키 인증 고정, FormData면 Content-Type 자동, 성공 시 { data } 언래핑.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
  fallbackMessage = "요청을 처리하지 못했습니다.",
): Promise<T> {
  const isFormData = init.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(parsed?.message || fallbackMessage);
  }

  return (parsed?.data ?? parsed) as T;
}
