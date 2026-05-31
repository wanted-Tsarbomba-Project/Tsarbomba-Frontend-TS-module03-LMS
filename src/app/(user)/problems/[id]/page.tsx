// CSR - 회원 문제풀이: 코드 입력, 실행/제출, 힌트/해설/챗봇 상태가 즉시 바뀌는 상호작용 화면
import UserProblemDetailClient from "@/features/problems/components/UserProblemDetailClient";

interface ProblemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const { id } = await params;

  return <UserProblemDetailClient problemSetId={id} />;
}
