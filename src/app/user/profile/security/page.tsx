import { redirect } from "next/navigation";
import ErrorPageView from "@/components/common/ErrorPageView";
import SecurityClient from "@/features/user/components/SecurityClient";
import { getMyProfileServer, UnauthorizedError } from "@/features/user/server";

export default async function Page() {
  // 인증 가드만 서버에서 — 이력/기기 데이터는 클라이언트에서 조회.
  try {
    await getMyProfileServer();
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/auth/login");
    return (
      <ErrorPageView status={500} message="회원 정보를 불러오지 못했습니다." />
    );
  }

  return <SecurityClient />;
}
