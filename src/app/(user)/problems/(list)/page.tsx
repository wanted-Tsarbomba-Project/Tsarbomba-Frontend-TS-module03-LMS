// SSR(30초 데이터 재검증)+CSR - 회원 문제 전체조회: 세션 기반 목록을 서버에서 갱신하고 행 클릭은 클라이언트에서 처리함
import { cookies } from "next/headers";

import { getProblemSetPage } from "@/features/problems/actions";
import UserProblemListClient from "@/features/problems/components/UserProblemListClient";
import { PROBLEM_SET_PAGE_SIZE } from "@/features/problems/constants";

interface ProblemsPageProps {
  searchParams: Promise<{
    categoryId?: string;
    page?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const { categoryId, page } = await searchParams;
  const currentPage = getPageParam(page);
  const cookieHeader = (await cookies()).toString();
  const problemSetPage = await getProblemSetPage({
    categoryId,
    page: currentPage,
    size: PROBLEM_SET_PAGE_SIZE,
    revalidateSeconds: 30,
    init: {
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    },
  });

  return (
    <UserProblemListClient
      categoryId={categoryId}
      currentPage={currentPage}
      initialProblemSets={problemSetPage.problemSets}
      pageSize={PROBLEM_SET_PAGE_SIZE}
      totalPages={problemSetPage.totalPages}
    />
  );
}

function getPageParam(value?: string) {
  const page = Number(value ?? 0);

  if (!Number.isInteger(page) || page < 0) {
    return 0;
  }

  return page;
}
