import { Skeleton } from "primereact/skeleton";

import { chatClasses } from "../styles";

export function ChatMessagesSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4"
    >
      <div className={chatClasses.messageWrapper}>
        <Skeleton borderRadius="8px" height="58px" width="58%" />
      </div>
      <div className={`${chatClasses.messageWrapper} ${chatClasses.userWrapper}`}>
        <Skeleton borderRadius="8px" height="50px" width="42%" />
      </div>
      <div className={chatClasses.messageWrapper}>
        <Skeleton borderRadius="8px" height="86px" width="68%" />
      </div>
      <div className={`${chatClasses.messageWrapper} ${chatClasses.userWrapper}`}>
        <Skeleton borderRadius="8px" height="50px" width="48%" />
      </div>
      <div className={chatClasses.messageWrapper}>
        <Skeleton borderRadius="8px" height="72px" width="62%" />
      </div>
    </div>
  );
}

export function ChatRoomListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <li aria-hidden="true" key={index}>
          <Skeleton
            borderRadius="8px"
            height="42px"
            width={index % 3 === 0 ? "88%" : "100%"}
          />
        </li>
      ))}
    </>
  );
}

export default function ChatPageSkeleton() {
  return (
    <main aria-busy="true" className={chatClasses.page}>
      <p aria-live="polite" className="sr-only" role="status">
        채팅 내용을 불러오는 중입니다.
      </p>

      <div aria-hidden="true" className={chatClasses.header}>
        <Skeleton borderRadius="8px" height="26px" width="180px" />
      </div>

      <div className={chatClasses.messageContainer}>
        <ChatMessagesSkeleton />
      </div>

      <div aria-hidden="true" className={chatClasses.inputAreaBase}>
        <div className={chatClasses.inputRow}>
          <Skeleton borderRadius="8px" height="52px" width="100%" />
          <Skeleton borderRadius="8px" height="52px" width="88px" />
        </div>
      </div>
    </main>
  );
}
