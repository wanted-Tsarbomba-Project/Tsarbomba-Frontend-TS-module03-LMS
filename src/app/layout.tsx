"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import CategoryNav from "../components/layout/CategoryNav";
import OneButtonModal from "../components/common/OneButtonModal";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    setIsMount(true);
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole") || "");
    }
  }, [pathname]);

  const canAccessAdmin = userRole === "ADMIN" || userRole === "OPERATOR";

  /* 1. 현재 페이지 경로 체크 패턴 정의 */
  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isMypagePath =
    pathname.startsWith("/user/introduce") ||
    pathname.startsWith("/user/profile");
  const isProblemPath =
    pathname.startsWith("/problems") ||
    pathname.startsWith("/user/problems") ||
    pathname.startsWith("/user/problem");
  const isProblemListPath = pathname === "/problems" || pathname === "/user/problems";

  const showAdminAuthModal = isMount && isAdminPath && !canAccessAdmin;

  const handleAccessDeniedClose = () => {
    router.replace("/");
  };

  /* 2. 로그인 / 회원가입 등 정중앙 배치 구역 */
  if (isAuthPath) {
    return (
      <html lang="ko">
        <body className="bg-white min-h-screen m-0 p-0 antialiased flex flex-col">
          <div className="flex flex-col min-h-screen w-full bg-white">
            <Header isSimple={true} />
            <div className="flex flex-1 justify-center items-center w-full max-w-[1200px] mx-auto px-5 py-10 box-border">
              {children}
            </div>
          </div>
        </body>
      </html>
    );
  }

  /* 3. 통합 레이아웃 바디 및 분기 처리 구역 */
  const isFlexBodySection = isMypagePath || isAdminPath || isProblemListPath;

  return (
    <html lang="ko">
      <body className="bg-white min-h-screen m-0 p-0 antialiased flex flex-col">
        <div className="flex flex-col min-h-screen w-full bg-white">
          <Header />

          {!isAdminPath && !isMypagePath && !isProblemPath && <CategoryNav />}

          {isFlexBodySection ? (
            <div className="flex flex-1 w-full max-w-[1200px] mx-auto relative box-border gap-5 max-[1024px]:px-5">
              {(isMypagePath || isProblemListPath || (isAdminPath && canAccessAdmin)) && (
                <Sidebar isOpen={isOpen} />
              )}

              {isOpen && (isMypagePath || isProblemListPath || (isAdminPath && canAccessAdmin)) && (
                <div
                  className="fixed inset-0 bg-[#000000]/40 z-[998] lg:hidden"
                  onClick={() => setIsOpen(false)}
                />
              )}

              <main className="flex-1 min-w-0 py-10">
                {isAdminPath ? (canAccessAdmin ? children : null) : children}
              </main>
            </div>
          ) : (
            <main
              className={`flex-1 w-full max-w-[1200px] mx-auto box-border ${
                isProblemPath ? "py-0" : "px-5 py-10"
              }`}
            >
              {children}
            </main>
          )}

          <Footer />
        </div>

        <OneButtonModal
          isOpen={showAdminAuthModal}
          onClose={handleAccessDeniedClose}
          modalTitle="입력 확인"
          modalContent="접근 권한이 없습니다."
        />
      </body>
    </html>
  );
}
