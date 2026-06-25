import type { NextConfig } from "next";

// 프록시 대상 BE 주소 — 서버 전용 API_PROXY_TARGET 우선, 없으면 NEXT_PUBLIC_API_URL.
// 둘 다 없으면 destination 이 "undefined/api/..." 가 되어 조용히 깨지므로 빌드 시 명시적으로 차단.
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL;

if (!apiProxyTarget) {
  throw new Error(
    "API_PROXY_TARGET (또는 NEXT_PUBLIC_API_URL) 환경변수가 필요합니다. .env.local 을 확인하세요.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
