// 서버 컴포넌트 전용 — fetch 는 프록시(rewrites)를 안 거치므로 BE 절대주소가 필요.
// 서버 전용 API_PROXY_TARGET 우선, 없으면 NEXT_PUBLIC_API_URL.
export const SERVER_API_BASE_URL =
  process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "";
