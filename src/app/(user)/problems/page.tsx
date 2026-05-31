// ISR(30초)+CSR - 회원 문제 전체조회: 목록은 30초마다 갱신하고 행 클릭은 클라이언트에서 처리함
import { getProblemSets } from "@/features/problems/actions";
import UserProblemListClient from "@/features/problems/components/UserProblemListClient";

interface ProblemsPageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const { categoryId } = await searchParams;
  const problemSets = await getProblemSets(categoryId, 30);

  return <UserProblemListClient initialProblemSets={problemSets} />;
}
