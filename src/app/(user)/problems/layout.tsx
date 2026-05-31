// ISR(1시간)+CSR - 문제 카테고리 사이드바: 카테고리는 서버에서 주기 갱신하고 선택 이동은 클라이언트에서 처리함
import { getProblemCategories } from "@/features/problems/actions";
import ProblemsLayoutShell from "@/features/problems/components/ProblemsLayoutShell";

export default async function ProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getProblemCategories(3600);

  return (
    <ProblemsLayoutShell categories={categories}>{children}</ProblemsLayoutShell>
  );
}
