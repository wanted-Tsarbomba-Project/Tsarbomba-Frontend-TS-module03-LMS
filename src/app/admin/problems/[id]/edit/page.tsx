// CSR - 문제 수정: 기존 데이터를 불러온 뒤 파일 교체, 소문제 편집, 삭제 확인까지 한 화면에서 처리함
import ProblemEditClient from "@/features/problems/components/ProblemEditClient";

interface EditProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;

  return <ProblemEditClient problemSetId={id} />;
}
