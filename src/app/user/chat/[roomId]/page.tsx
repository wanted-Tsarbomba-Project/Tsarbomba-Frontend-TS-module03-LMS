import { redirect } from "next/navigation";

interface LegacyUserChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function LegacyUserChatRoomPage({
  params,
}: LegacyUserChatRoomPageProps) {
  const { roomId } = await params;

  redirect(`/chat/${roomId}`);
}
