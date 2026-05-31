"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BluebombLogo from "../../../public/assets/img/bluebomb-Icon.svg";
import { getProblemCategories } from "@/features/problems/actions";
import type { ProblemCategory } from "@/features/problems/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type ProblemState = "LOCKED" | "UNSOLVED" | "CORRECT" | "WRONG";

interface ChatRoom {
  roomId: number;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen?: boolean;
  userNickname?: string;
  variant?: "default" | "problem-detail";
  problemSet?: {
    problems?: Array<{ problemId?: number; title: string }>;
  };
  currentIndex?: number;
  problemStates?: ProblemState[];
  canMoveProblem?: (index: number) => boolean;
  moveProblem?: (index: number) => void;
  getProblemButtonClass?: (
    state: ProblemState | undefined,
    isCurrent: boolean,
  ) => string;
}

function getStoredValue(key: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(key) || "";
}

export default function Sidebar({
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
  const selectedCategoryId = searchParams.get("categoryId");

  const [nickname, setNickname] = useState(
    propsNickname || getStoredValue("userNickname") || "닉네임",
  );
  const [userRole, setUserRole] = useState(getStoredValue("userRole"));
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>([]);

  const isAdminPath = pathname.startsWith("/admin");
  const isCategory =
    !isAdminPath &&
    (pathname.startsWith("/problems") || pathname.startsWith("/user/problems"));
  const isMypage =
    (pathname.startsWith("/user/introduce") ||
      pathname.startsWith("/user/profile")) &&
    !isCategory;
  const isChatPage =
    pathname.startsWith("/chat") || pathname.startsWith("/user/chat");

  useEffect(() => {
    const updateUserInfo = () => {
      setNickname(propsNickname || getStoredValue("userNickname") || "닉네임");
      setUserRole(getStoredValue("userRole"));
    };

    window.addEventListener("loginSuccess", updateUserInfo);
    window.addEventListener("storage", updateUserInfo);

    return () => {
      window.removeEventListener("loginSuccess", updateUserInfo);
      window.removeEventListener("storage", updateUserInfo);
    };
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

        if (!response.ok) {
          throw new Error("채팅방 목록 조회 실패");
        }

        const result = (await response.json()) as { data?: ChatRoom[] };
        const sortedRooms = [...(result.data ?? [])].sort(
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
    if (!isCategory) return;

    let isMounted = true;

    const fetchProblemCategories = async () => {
      try {
        const categories = await getProblemCategories();

        if (isMounted) {
          setProblemCategories(categories);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProblemCategories();

    return () => {
      isMounted = false;
    };
  }, [isCategory]);

  const itemBaseClass =
    "block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a237e] transition-all cursor-pointer";
  const itemActiveClass =
    "block w-full text-left px-4 py-2.5 rounded-lg text-base font-bold bg-[#1a237e] text-white transition-all cursor-pointer";

  const adminMenu = (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col items-start px-2 py-1">
        <span className="text-lg font-bold text-[#1f2937]">관리자 메뉴</span>
      </div>
      <hr className="border-[#f3f4f6] -mt-2" />

      <ul className="flex flex-col gap-1">
        {userRole === "OPERATOR" && (
          <>
            <li>
              <Link
                className={
                  pathname === "/admin/lectures"
                    ? itemActiveClass
                    : itemBaseClass
                }
                href="/admin/lectures"
              >
                강의 관리
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === "/admin/problems"
                    ? itemActiveClass
                    : itemBaseClass
                }
                href="/admin/problems"
              >
                문제 관리
              </Link>
            </li>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <li>
              <Link
                className={
                  pathname === "/admin/users" ? itemActiveClass : itemBaseClass
                }
                href="/admin/users"
              >
                회원 관리
              </Link>
            </li>
            {/* <li>
              <Link
                className={pathname === "/admin/badges" ? itemActiveClass : itemBaseClass}
                href="/admin/badges"
              >
                뱃지 관리
              </Link>
            </li> */}
            <li>
              <Link
                className={
                  pathname === "/admin/rules" ? itemActiveClass : itemBaseClass
                }
                href="/admin/rules"
              >
                규칙 관리
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === "/admin/alrams" ? itemActiveClass : itemBaseClass
                }
                href="/admin/alrams"
              >
                알람 관리
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );

  const mypageMenu = (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="w-12 h-12 rounded-full bg-white border border-[#e8e8e8] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          <Image
            alt="프로필"
            className="w-8 h-8 object-contain text-[#1a237e]"
            src={BluebombLogo}
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
            className={
              pathname === "/user/introduce" ? itemActiveClass : itemBaseClass
            }
            href="/user/introduce"
          >
            자기소개
          </Link>
        </li>
        <li>
          <Link
            className={
              pathname === "/user/profile" ? itemActiveClass : itemBaseClass
            }
            href="/user/profile"
          >
            프로필 정보
          </Link>
        </li>
      </ul>
    </div>
  );

  const problemDetailMenu = (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-base font-bold text-[#1f2937] px-2">
        전체 문제 {currentIndex + 1}/{problemSet?.problems?.length ?? 0}
      </h3>
      <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {problemSet?.problems?.map((problem, index) => {
          const state = problemStates[index];
          const locked = canMoveProblem ? !canMoveProblem(index) : false;
          const buttonClass =
            getProblemButtonClass?.(state, currentIndex === index) ?? "";

          return (
            <li key={problem.problemId ?? index}>
              <button
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors font-medium flex items-center justify-between cursor-pointer ${buttonClass} ${
                  locked
                    ? "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed opacity-60"
                    : ""
                }`}
                disabled={locked}
                onClick={() => moveProblem?.(index)}
                type="button"
              >
                <span className="truncate">{problem.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const problemCategoryMenu = (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col items-start px-2 py-1">
        <span className="text-lg font-bold text-[#1f2937]">카테고리</span>
      </div>
      <hr className="border-[#f3f4f6] -mt-2" />

      <ul className="flex flex-col gap-1">
        <li>
          <button
            className={!selectedCategoryId ? itemActiveClass : itemBaseClass}
            onClick={() => router.push("/problems")}
            type="button"
          >
            전체
          </button>
        </li>

        {problemCategories.map((category) => (
          <li key={category.categoryId}>
            <button
              className={
                selectedCategoryId === category.categoryId
                  ? itemActiveClass
                  : itemBaseClass
              }
              onClick={() =>
                router.push(`/problems?categoryId=${category.categoryId}`)
              }
              type="button"
            >
              {category.categoryName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const chatMenu = (
    <div className="w-full flex flex-col gap-4">
      <button
        className="w-full h-11 bg-[#1a237e] text-white rounded-lg flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-[#111751] transition-colors shadow-sm"
        onClick={() => router.push("/user/chat")}
        type="button"
      >
        + 새 대화 시작
      </button>
      <h3 className="text-sm font-bold text-[#6b7280] px-2 mt-2">기존 대화</h3>
      <ul className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
        {chatRooms.map((room) => (
          <li key={room.roomId}>
            <Link
              className={
                pathname === `/user/chat/${room.roomId}`
                  ? itemActiveClass
                  : itemBaseClass
              }
              href={`/user/chat/${room.roomId}`}
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
        className={`w-[260px] shrink-0 bg-white border border-[#e8e8e8] rounded-xl p-5 sticky top-20 transition-all duration-300 max-lg:w-full max-lg:static ${
          isOpen
            ? "max-lg:block max-lg:fixed max-lg:left-0 max-lg:z-[999] max-lg:h-[calc(100vh-80px)]"
            : ""
        }`}
      >
        {problemDetailMenu}
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
      {isAdminPath && adminMenu}
      {isMypage && mypageMenu}
      {isCategory && problemCategoryMenu}
      {isChatPage && chatMenu}
    </aside>
  );
}
