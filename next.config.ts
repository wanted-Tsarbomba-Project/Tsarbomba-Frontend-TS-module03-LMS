import type { NextConfig } from "next";

// 프록시 대상 BE 주소 — 서버 전용 API_PROXY_TARGET 우선, 없으면 NEXT_PUBLIC_API_URL.
// 프로덕션(ALB)에서는 둘 다 비우고 브라우저가 상대경로 /api 를 ALB로 직접 보낸다 → Next rewrite 불필요.
// 값이 있을 때(로컬 개발 등)만 Next 프록시 rewrite 를 건다.
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
