// Server Redirect - 관리자 문제 상세 진입: 상세 페이지가 분리되기 전까지 수정 화면으로 즉시 연결함
import { redirect } from "next/navigation";

interface AdminProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminProblemPage({ params }: AdminProblemPageProps) {
  const { id } = await params;

  redirect(`/admin/problems/${id}/edit`);
}
