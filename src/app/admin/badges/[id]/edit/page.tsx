import AdminBadgeEditClient from "@/features/admin/badges/components/AdminBadgeEditClient";

interface BadgeEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BadgeEditPage({ params }: BadgeEditPageProps) {
  const { id } = await params;

  return <AdminBadgeEditClient badgeId={id} />;
}
