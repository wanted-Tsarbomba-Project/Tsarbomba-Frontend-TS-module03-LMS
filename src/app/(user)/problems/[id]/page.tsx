// SSR+CSR - 회원 문제풀이: 문제 기본 정보는 서버에서 먼저 조회하고, 코드 입력/실행/제출/채팅은 클라이언트에서 처리함
import { cookies } from "next/headers";

import { getProblemSetDetail } from "@/features/problems/actions";
import UserProblemDetailClient from "@/features/problems/components/UserProblemDetailClient";

interface ProblemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function ProblemDetailPage({
  params,
  searchParams,
}: ProblemDetailPageProps) {
  const { id } = await params;
  const { userId } = await searchParams;
  const cookieHeader = (await cookies()).toString();
  const problemSet = await getProblemSetDetail(id, userId ?? "", {
    cache: "no-store",
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  });

  return (
    <UserProblemDetailClient
      initialProblemSet={problemSet}
      initialUserId={userId ?? ""}
      problemSetId={id}
    />
  );
}
