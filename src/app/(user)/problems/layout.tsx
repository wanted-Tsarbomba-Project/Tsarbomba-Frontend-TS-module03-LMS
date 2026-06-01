// SSR(1시간 데이터 재검증)+CSR - 문제 카테고리 사이드바: 세션 쿠키로 카테고리를 서버 조회하고 선택 이동은 클라이언트에서 처리함
import { cookies } from "next/headers";

import { getProblemCategories } from "@/features/problems/actions";
import ProblemsLayoutShell from "@/features/problems/components/ProblemsLayoutShell";

export default async function ProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await cookies()).toString();
  const categories = await getProblemCategories(3600, {
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  });

  return (
    <ProblemsLayoutShell categories={categories}>{children}</ProblemsLayoutShell>
  );
}
