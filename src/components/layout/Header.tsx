"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Logo from "../../../public/assets/img/logo-Icon.png";
import BluebombLogo from "../../../public/assets/img/bluebomb-Icon.svg";
import WhitebombLogo from "../../../public/assets/img/whitebomb-Icon.svg";
import { Searchbar, TwoButtonModal } from "../common";

interface HeaderProps {
  isSimple?: boolean;
}

function getHeaderStatus() {
  if (typeof window === "undefined") {
    return {
      isLoggedIn: false,
      nickname: "닉네임",
      userRole: "",
    };
  }

  const savedNickname = localStorage.getItem("userNickname");
  const savedRole = localStorage.getItem("userRole");

  return {
    isLoggedIn: Boolean(savedNickname),
    nickname: savedNickname || "닉네임",
    userRole: savedRole || "",
  };
}

function Header({ isSimple }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(() => getHeaderStatus().isLoggedIn);
  const [nickname, setNickname] = useState(() => getHeaderStatus().nickname);
  const [userRole, setUserRole] = useState(() => getHeaderStatus().userRole);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const syncHeaderStatus = () => {
    const status = getHeaderStatus();

    setIsLoggedIn(status.isLoggedIn);
    setNickname(status.nickname);
    setUserRole(status.userRole);
  };

  useEffect(() => {
    window.addEventListener("loginSuccess", syncHeaderStatus);
    return () => {
      window.removeEventListener("loginSuccess", syncHeaderStatus);
    };
  }, []);

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    localStorage.clear();
    sessionStorage.clear();

    const deleteCookie = (name: string) => {
      document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    };
    deleteCookie("accessToken");
    deleteCookie("refreshToken");

    setIsLoggedIn(false);
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const isManagementRole =
    isLoggedIn && (userRole === "ADMIN" || userRole === "OPERATOR");

  const logoTargetHref = isManagementRole ? "/admin" : "/";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isSimple) {
    return (
      <header className="w-full border-b border-[#e8e8e8] bg-white">
        <div className="flex h-16 items-center justify-between px-6 max-w-[1200px] mx-auto">
          <Link
            href={logoTargetHref}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Image
              src={Logo}
              className="h-10 w-auto object-contain"
              alt="로고"
              priority
            />
            <span className="text-xl font-bold text-[#1a237e] tracking-tight">
              codebomba
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-[#e8e8e8] bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6 max-w-[1200px] mx-auto">
        {/* 좌측 로고 영역 */}
        <Link
          href={logoTargetHref}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <Image
            src={Logo}
            className="h-10 w-auto object-contain"
            alt="로고"
            priority
          />
          <span className="text-xl font-bold text-[#1a237e] tracking-tight">
            {isManagementRole && isAdminPath ? "관리자 페이지" : "codebomba"}
          </span>
        </Link>

        {/* 중앙 검색바 영역 */}
        {(!isManagementRole || !isAdminPath) && (
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <Searchbar />
          </div>
        )}

        {/* 우측 네비게이션 및 프로필 영역 */}
        <div className="flex items-center gap-6">
          {/* 일반 학생 유저 로그인 시 메뉴 */}
          {!isAdminPath && isLoggedIn && !isManagementRole && (
            <nav className="flex items-center gap-5 text-sm font-semibold text-[#1f2937]">
              <span
                className="cursor-pointer hover:text-[#1a237e] transition-colors"
                onClick={() => router.push("/user/my-classroom")}
              >
                내 강의실
              </span>
              <span
                className="cursor-pointer hover:text-[#1a237e] transition-colors"
                onClick={() => router.push("/problems")}
              >
                문제풀이
              </span>
            </nav>
          )}

          {/* 비로그인 상태 */}
          {!isLoggedIn ? (
            <button
              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium h-9 px-4 py-2 border border-[#1a237e] bg-white text-[#1a237e] hover:bg-[#1a237e] hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/auth/login")}
            >
              <div className="w-4 h-4 relative">
                <Image
                  src={BluebombLogo}
                  className="w-4 h-4 object-contain absolute inset-0 transition-opacity group-hover:opacity-0"
                  alt="블루폭탄로고"
                />
                <Image
                  src={WhitebombLogo}
                  className="w-4 h-4 object-contain absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  alt="화이트폭탄로고"
                />
              </div>
              <span>로그인</span>
            </button>
          ) : (
            /* 로그인 완료 후 프로필 영역 */
            <div
              className="relative w-fit"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`group inline-flex items-center gap-1.5 rounded-md text-sm font-medium h-9 px-4 py-2 border transition-all cursor-pointer whitespace-nowrap ${
                  isDropdownOpen
                    ? "bg-[#1a237e] text-white border-[#1a237e]"
                    : "border-[#1a237e] bg-white text-[#1a237e] hover:bg-[#1a237e] hover:text-white"
                }`}
              >
                <div className="w-4 h-4 relative">
                  <Image
                    src={BluebombLogo}
                    className={`w-4 h-4 object-contain absolute inset-0 transition-opacity ${isDropdownOpen ? "opacity-0" : "group-hover:opacity-0"}`}
                    alt="블루폭탄로고"
                  />
                  <Image
                    src={WhitebombLogo}
                    className={`w-4 h-4 object-contain absolute inset-0 transition-opacity ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    alt="화이트폭탄로고"
                  />
                </div>
                <span>{nickname}</span>
              </button>

              {/* 프로필 드롭다운 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-0 w-full min-w-[100px] bg-white border border-[#e8e8e8] rounded-md shadow-lg py-1 z-50 flex flex-col">
                  {!isManagementRole && (
                    <div
                      className="flex items-center justify-center w-full px-2 py-2.5 text-sm text-[#1f2937] text-center hover:bg-[#f3f4f6] hover:text-[#1a237e] cursor-pointer whitespace-nowrap"
                      onClick={() => {
                        router.push("/user/introduce");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>마이페이지</span>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-center w-full px-2 py-2.5 text-sm text-[#fb2c36] text-center hover:bg-[#f3f4f6] cursor-pointer whitespace-nowrap ${!isManagementRole ? "border-t border-[#e8e8e8]" : ""}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                  >
                    <span>로그아웃</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TwoButtonModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        modalTitle="로그아웃"
        modalContent="로그아웃 하시겠습니까?"
      />
    </header>
  );
}

export default Header;
