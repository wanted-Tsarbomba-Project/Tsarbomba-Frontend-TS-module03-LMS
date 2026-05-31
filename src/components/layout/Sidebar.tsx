"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import BluebombLogo from "../../../public/assets/img/bluebomb-Icon.svg";
// import { PROBLEM_CATEGORY } from "../../services/problemService";

// Next.js 글로벌 환경변수 매싱
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface SidebarProps {
  isOpen: boolean;
  userNickname?: string;
  variant?: string;
  problemSet?: {
    problems?: Array<{ problemId?: number; title: string }>;
  };
  currentIndex?: number;
  problemStates?: any[];
  canMoveProblem?: (index: number) => boolean;
  moveProblem?: (index: number) => void;
  getProblemButtonClass?: (state: any, isCurrent: boolean) => string;
}

function Sidebar({
  isOpen,
  userNickname: propsNickname,
  variant,
  problemSet,
  currentIndex = 0,
  problemStates = [],
  canMoveProblem,
  moveProblem,
  getProblemButtonClass,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = pathname;
  const selectedCategoryId = searchParams.get("categoryId");

  // 닉네임 상태 제어
  const [nickname, setNickname] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userNickname") || propsNickname || "";
    }
    return propsNickname || "";
  });

  // 유저 권한 상태 제어
  const [userRole, setUserRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userRole") || "";
    }
    return "";
  });

  // 채팅방 리스트
  const [chatRooms, setChatRooms] = useState<any[]>([]);

  // 현재 경로 판단 가이드
  const isAdminPath = currentPath.startsWith("/admin");

  const isCategory =
    !isAdminPath &&
    userRole === "STUDENT" &&
    (currentPath.startsWith("/problems") ||
      currentPath.includes("/problem/") ||
      currentPath === "/user/problems");

  const isMypage =
    (currentPath.startsWith("/user/introduce") ||
      currentPath.startsWith("/user/profile")) &&
    !isCategory;

  const isChatPage =
    currentPath.startsWith("/chat") || currentPath.startsWith("/user/chat");

  // 채팅방 목록 API 비동기 수신 함수
  useEffect(() => {
    if (!isChatPage) return;

    const fetchChatRooms = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/chat/list`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("채팅방 목록 조회 실패");
        }

        const result = await response.json();

        const sortedRooms = [...result.data].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        setChatRooms(sortedRooms);
      } catch (error) {
        console.error(error);
      }
    };

    fetchChatRooms();
    window.addEventListener("chatRoomUpdated", fetchChatRooms);

    return () => {
      window.removeEventListener("chatRoomUpdated", fetchChatRooms);
    };
  }, [isChatPage]);

  // 실시간 계정 로컬스토리지
  useEffect(() => {
    const updateUserInfo = () => {
      const savedNickname = localStorage.getItem("userNickname");
      const savedRole = localStorage.getItem("userRole");

      if (savedNickname) setNickname(savedNickname);
      if (savedRole) setUserRole(savedRole);
    };

    updateUserInfo();

    window.addEventListener("loginSuccess", updateUserInfo);
    window.addEventListener("storage", updateUserInfo);

    return () => {
      window.removeEventListener("loginSuccess", updateUserInfo);
      window.removeEventListener("storage", updateUserInfo);
    };
  }, []);

  useEffect(() => {
    if (propsNickname) setNickname(propsNickname);
  }, [propsNickname]);

  /* 1. 관리자 전용 서브 메뉴 */
  const AdminMenu = () => {
    const isOperator = userRole === "OPERATOR";
    const isAdminUser = userRole === "ADMIN";

    return (
      <div className="sidebar-content">
        <h3 className="sidebar-title">관리페이지</h3>
        <ul className="sidebar-list">
          {isOperator && (
            <>
              <li>
                <Link
                  href="/admin/lectures"
                  className={`sidebar-item ${currentPath === "/admin/lectures" ? "active" : ""}`}
                >
                  강의 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/problems"
                  className={`sidebar-item ${currentPath === "/admin/problems" ? "active" : ""}`}
                >
                  문제 관리
                </Link>
              </li>
            </>
          )}

          {isAdminUser && (
            <>
              <li>
                <Link
                  href="/admin/users"
                  className={`sidebar-item ${currentPath === "/admin/users" ? "active" : ""}`}
                >
                  회원 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/badges"
                  className={`sidebar-item ${currentPath === "/admin/badges" ? "active" : ""}`}
                >
                  뱃지 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/rules"
                  className={`sidebar-item ${currentPath === "/admin/rules" ? "active" : ""}`}
                >
                  규칙 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/alrams"
                  className={`sidebar-item ${currentPath === "/admin/alrams" ? "active" : ""}`}
                >
                  알람 관리
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    );
  };

  /* 2. 마이페이지 전용 서브 메뉴 */
  const MypageMenu = () => (
    <div className="sidebar-content">
      <div className="profile-section">
        <div className="profile-img-box">
          <Image src={BluebombLogo} alt="프로필" className="profile-img" />
        </div>
        <span className="profile-nickname">{nickname}</span>
      </div>

      <ul className="sidebar-list">
        <li>
          <Link
            href="/user/introduce"
            className={`sidebar-item ${currentPath === "/user/introduce" ? "active" : ""}`}
          >
            내 소개
          </Link>
        </li>
        <li>
          <Link
            href="/user/profile"
            className={`sidebar-item ${currentPath === "/user/profile" ? "active" : ""}`}
          >
            프로필 정보
          </Link>
        </li>
      </ul>
    </div>
  );

  /* 3. 문제 목록 대시보드 카테고리 메뉴 */
  //   const ProblemCategoryMenu = () => (
  //     <div className="sidebar-content">
  //       <h3 className="sidebar-title">카테고리</h3>
  //       <ul className="sidebar-list">
  //         <li>
  //           <button
  //             type="button"
  //             className={`sidebar-item sidebar-button ${selectedCategoryId ? "" : "active"}`}
  //             onClick={() => router.push("/user/problems")}
  //           >
  //             전체
  //           </button>
  //         </li>
  //         {Object.entries(PROBLEM_CATEGORY).map(([categoryId, categoryName]) => (
  //           <li key={categoryId}>
  //             <button
  //               type="button"
  //               className={`sidebar-item sidebar-button ${selectedCategoryId === categoryId ? "active" : ""}`}
  //               onClick={() =>
  //                 router.push(`/user/problems?categoryId=${categoryId}`)
  //               }
  //             >
  //               {categoryName}
  //             </button>
  //           </li>
  //         ))}
  //       </ul>
  //     </div>
  //   );

  /* 4. 문제 상세 에디터 풀이 사이드 메뉴 */
  const ProblemDetailMenu = () => (
    <div className="sidebar-content problem-detail-sidebar-content">
      <h3 className="sidebar-title">
        전체 문제 {currentIndex + 1}/{problemSet?.problems?.length ?? 0}
      </h3>
      <ul className="sidebar-list">
        {problemSet?.problems?.map((problem, index) => {
          const locked = canMoveProblem ? !canMoveProblem(index) : false;
          const buttonClass = getProblemButtonClass
            ? getProblemButtonClass(
                problemStates[index],
                currentIndex === index,
              )
            : "";

          return (
            <li key={problem.problemId ?? index}>
              <button
                type="button"
                disabled={locked}
                className={`sidebar-item problem-detail-sidebar-item ${buttonClass} ${locked ? "locked-problem" : ""}`}
                onClick={() => moveProblem?.(index)}
              >
                {problem.title}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  /* 5. AI 실시간 챗봇 메뉴 */
  const ChatMenu = () => (
    <div className="sidebar-content">
      <div
        className="sidebar-title chat-new-button"
        onClick={() => router.push("/user/chat")}
      >
        + 새대화 시작
      </div>
      <h3 className="sidebar-title">기존대화</h3>
      <ul className="sidebar-list">
        {chatRooms.map((room) => (
          <li key={room.roomId}>
            <Link
              href={`/user/chat/${room.roomId}`}
              className={`sidebar-item ${currentPath === `/user/chat/${room.roomId}` ? "active" : ""}`}
            >
              {room.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  // 문제풀이 에디터 variant 조건 검사
  if (variant === "problem-detail") {
    return (
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {ProblemDetailMenu()}
      </aside>
    );
  }

  // 어떤 영역에 속하지도 않을 때 숨김 필터
  if (!isAdminPath && !isCategory && !isMypage && !isChatPage) {
    return null;
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {isAdminPath && AdminMenu()}
      {isMypage && MypageMenu()}
      {/* {isCategory && ProblemCategoryMenu()} */}
      {isChatPage && ChatMenu()}
    </aside>
  );
}

export default Sidebar;
