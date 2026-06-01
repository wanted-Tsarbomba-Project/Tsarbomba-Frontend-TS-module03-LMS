// SSR(30초 데이터 재검증)+CSR - 회원 문제 전체조회: 세션 기반 목록을 서버에서 갱신하고 행 클릭은 클라이언트에서 처리함
import { cookies } from "next/headers";

import { getProblemSets } from "@/features/problems/actions";
import UserProblemListClient from "@/features/problems/components/UserProblemListClient";

interface ProblemsPageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const { categoryId } = await searchParams;
  const cookieHeader = (await cookies()).toString();
  const problemSets = await getProblemSets(categoryId, 30, {
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  });

  return <UserProblemListClient initialProblemSets={problemSets} />;
}
