import { redirect } from "next/navigation";

interface LegacyUserProblemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LegacyUserProblemDetailPage({
  params,
}: LegacyUserProblemDetailPageProps) {
  const { id } = await params;

  redirect(`/problems/${id}`);
}
