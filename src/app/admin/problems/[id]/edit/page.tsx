// SSR+CSR - 문제 수정: 초기 데이터는 서버에서 최신 조회하고, 폼 편집과 저장은 클라이언트에서 처리함
import {
  getProblem,
  getProblemCategories,
} from "@/features/problems/actions";
import { cookies } from "next/headers";

import ProblemEditClient from "@/features/problems/components/ProblemEditClient";

interface EditProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();
  const authInit = {
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  };
  const categories = await getProblemCategories(3600, authInit);
  const detail = await getProblem(id, categories, {
    ...authInit,
    cache: "no-store",
  });

  return (
    <ProblemEditClient
      initialCategories={categories}
      initialDetail={detail}
      problemSetId={id}
    />
  );
}
