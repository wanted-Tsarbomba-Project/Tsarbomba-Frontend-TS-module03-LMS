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

  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isMypagePath = pathname.startsWith("/user/introduce");
  const isProblemPath =
    pathname.startsWith("/user/problems") ||
    pathname.startsWith("/user/problem");

  const showAdminAuthModal = isMount && isAdminPath && !canAccessAdmin;

  const handleAccessDeniedClose = () => {
    router.replace("/");
  };

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

  return (
    <html lang="ko">
      <body className="bg-white min-h-screen m-0 p-0 antialiased flex flex-col">
        <div className="flex flex-col min-h-screen w-full bg-white">
          <Header />

          {!isAdminPath && !isMypagePath && !isProblemPath && <CategoryNav />}

          <div className="flex flex-1 w-full max-w-[1200px] mx-auto relative box-border gap-5 px-5">
            {(isMypagePath || (isAdminPath && canAccessAdmin)) && (
              <Sidebar isOpen={isOpen} />
            )}

            {isOpen && (isMypagePath || (isAdminPath && canAccessAdmin)) && (
              <div
                className="fixed inset-0 bg-black/40 z-[998] md:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}

            <main
              className={`flex-1 min-w-0 ${isMypagePath || isAdminPath ? "py-10" : "py-10"}`}
            >
              {isAdminPath ? (canAccessAdmin ? children : null) : children}
            </main>
          </div>

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
