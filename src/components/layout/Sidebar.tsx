"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import BluebombLogo from "../../../public/assets/img/bluebomb-Icon.svg";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface SidebarProps {
  isOpen?: boolean;
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
  isOpen = false,
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

  const [nickname, setNickname] = useState(propsNickname || "닉네임");
  const [userRole, setUserRole] = useState("");
  const [chatRooms, setChatRooms] = useState<any[]>([]);

  const isAdminPath = currentPath.startsWith("/admin");

  const isCategory =
    !isAdminPath &&
    (currentPath.startsWith("/problems") ||
      currentPath.includes("/problem/") ||
      currentPath === "/user/problems");

  const isMypage =
    (currentPath.startsWith("/user/introduce") ||
      currentPath.startsWith("/user/profile")) &&
    !isCategory;

  const isChatPage =
    currentPath.startsWith("/chat") || currentPath.startsWith("/user/chat");

  useEffect(() => {
    const savedNickname = localStorage.getItem("userNickname");
    const savedRole = localStorage.getItem("userRole");

    if (savedNickname) setNickname(savedNickname);
    if (savedRole) setUserRole(savedRole);
  }, [propsNickname]);

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

        if (!response.ok) throw new Error("채팅방 목록 조회 실패");

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

  useEffect(() => {
    const updateUserInfo = () => {
      const savedNickname = localStorage.getItem("userNickname");
      const savedRole = localStorage.getItem("userRole");

      if (savedNickname) setNickname(savedNickname);
      if (savedRole) setUserRole(savedRole);
    };

    window.addEventListener("loginSuccess", updateUserInfo);
    window.addEventListener("storage", updateUserInfo);

    return () => {
      window.removeEventListener("loginSuccess", updateUserInfo);
      window.removeEventListener("storage", updateUserInfo);
    };
  }, []);

  const itemBaseClass =
    "block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a237e] transition-all cursor-pointer";
  const itemActiveClass =
    "block w-full text-left px-4 py-2.5 rounded-lg text-base font-bold bg-[#1a237e] text-white transition-all cursor-pointer";

  /* 1. 관리자 전용 서브 메뉴 */
  const AdminMenu = () => {
    const isOperator = userRole === "OPERATOR";
    const isAdminUser = userRole === "ADMIN";

    return (
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col items-start px-2 py-1">
          <span className="text-lg font-bold text-[#1f2937]">관리자 메뉴</span>
        </div>
        <hr className="border-[#f3f4f6] -mt-2" />

        <ul className="flex flex-col gap-1">
          {isOperator && (
            <>
              <li>
                <Link
                  href="/admin/lectures"
                  className={
                    currentPath === "/admin/lectures"
                      ? itemActiveClass
                      : itemBaseClass
                  }
                >
                  강의 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/problems"
                  className={
                    currentPath === "/admin/problems"
                      ? itemActiveClass
                      : itemBaseClass
                  }
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
                  className={
                    currentPath === "/admin/users"
                      ? itemActiveClass
                      : itemBaseClass
                  }
                >
                  회원 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/badges"
                  className={
                    currentPath === "/admin/badges"
                      ? itemActiveClass
                      : itemBaseClass
                  }
                >
                  뱃지 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/rules"
                  className={
                    currentPath === "/admin/rules"
                      ? itemActiveClass
                      : itemBaseClass
                  }
                >
                  규칙 관리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/alrams"
                  className={
                    currentPath === "/admin/alrams"
                      ? itemActiveClass
                      : itemBaseClass
                  }
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
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="w-12 h-12 rounded-full bg-white border border-[#e8e8e8] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          <Image
            src={BluebombLogo}
            alt="프로필"
            className="w-8 h-8 object-contain text-[#1a237e]"
          />
        </div>
        <span className="text-lg font-bold text-[#1f2937] tracking-tight">
          {nickname}
        </span>
      </div>
      <hr className="border-[#f3f4f6] -mt-2" />

      <ul className="flex flex-col gap-1">
        <li>
          <Link
            href="/user/introduce"
            className={
              currentPath === "/user/introduce"
                ? itemActiveClass
                : itemBaseClass
            }
          >
            내 소개
          </Link>
        </li>
        <li>
          <Link
            href="/user/profile"
            className={
              currentPath === "/user/profile" ? itemActiveClass : itemBaseClass
            }
          >
            프로필 정보
          </Link>
        </li>
      </ul>
    </div>
  );

  /* 3. 문제 상세 에디터 풀이 사이드 메뉴 */
  const ProblemDetailMenu = () => (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-base font-bold text-[#1f2937] px-2">
        전체 문제 {currentIndex + 1}/{problemSet?.problems?.length ?? 0}
      </h3>
      <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
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
                onClick={() => moveProblem?.(index)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors font-medium flex items-center justify-between cursor-pointer ${buttonClass} ${
                  locked
                    ? "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                <span className="truncate">{problem.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  /* 4. AI 실시간 챗봇 메뉴 */
  const ChatMenu = () => (
    <div className="w-full flex flex-col gap-4">
      <div
        className="w-full h-11 bg-[#1a237e] text-white rounded-lg flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-[#111751] transition-colors shadow-sm"
        onClick={() => router.push("/user/chat")}
      >
        + 새대화 시작
      </div>
      <h3 className="text-sm font-bold text-[#6b7280] px-2 mt-2">기존대화</h3>
      <ul className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
        {chatRooms.map((room) => (
          <li key={room.roomId}>
            <Link
              href={`/user/chat/${room.roomId}`}
              className={
                currentPath === `/user/chat/${room.roomId}`
                  ? itemActiveClass
                  : itemBaseClass
              }
            >
              <span className="block truncate">{room.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  if (variant === "problem-detail") {
    return (
      <aside
        className={`w-[260px] shrink-0 bg-white border border-[#e8e8e8] rounded-xl p-5 sticky top-20 max-lg:hidden transition-all duration-300 ${isOpen ? "max-lg:block max-lg:fixed max-lg:left-0 max-lg:z-[999] max-lg:h-[calc(100vh-80px)]" : ""}`}
      >
        {ProblemDetailMenu()}
      </aside>
    );
  }

  if (!isAdminPath && !isCategory && !isMypage && !isChatPage) {
    return null;
  }

  return (
    <aside
      className={`w-[240px] shrink-0 bg-white border border-[#e8e8e8] rounded-xl p-5 h-fit mt-10 sticky top-24 max-lg:hidden transition-all duration-300 ${
        isOpen
          ? "max-lg:block max-lg:fixed max-lg:left-5 max-lg:top-24 max-lg:z-[999] max-lg:shadow-xl"
          : ""
      }`}
    >
      {isAdminPath && AdminMenu()}
      {isMypage && MypageMenu()}
      {isChatPage && ChatMenu()}
    </aside>
  );
}

export default Sidebar;
