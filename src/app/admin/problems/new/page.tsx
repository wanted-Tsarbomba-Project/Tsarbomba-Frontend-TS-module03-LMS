// ISR(1시간)+CSR - 문제 등록: 카테고리는 자주 변하지 않아 서버에서 재검증하고, 폼 입력과 파일 업로드는 클라이언트에서 처리함
import { getProblemCategories } from "@/features/problems/actions";
import ProblemRegisterClient from "@/features/problems/components/ProblemRegisterClient";

export const dynamic = "force-dynamic";

export default async function NewProblemPage() {
  const categories = await getProblemCategories(3600);

  return <ProblemRegisterClient initialCategories={categories} />;
}
