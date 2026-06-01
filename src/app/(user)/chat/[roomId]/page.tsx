// CSR - 범용 챗봇 상세: 기존 채팅방 메시지를 불러오고 이어서 대화해야 하는 개인화 화면
import GeneralChatClient from "@/features/chat/components/GeneralChatClient";

interface GeneralChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function GeneralChatRoomPage({
  params,
}: GeneralChatRoomPageProps) {
  const { roomId } = await params;

  return <GeneralChatClient roomId={roomId} />;
}
