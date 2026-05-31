"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import Logo from "../../../public/assets/img/logo-Icon.png";
import BluebombLogo from "../../../public/assets/img/bluebomb-Icon.svg";
import WhitebombLogo from "../../../public/assets/img/whitebomb-Icon.svg";

interface HeaderProps {
  isSimple?: boolean;
}

function Header({ isSimple }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("닉네임");
  const [userRole, setUserRole] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const syncHeaderStatus = () => {
    if (typeof window !== "undefined") {
      const savedNickname = localStorage.getItem("userNickname");
      const savedRole = localStorage.getItem("userRole");

      if (savedNickname) {
        setIsLoggedIn(true);
        setNickname(savedNickname);
        setUserRole(savedRole || "");
      } else {
        setIsLoggedIn(false);
        setNickname("닉네임");
        setUserRole("");
      }
    }
  };

  useEffect(() => {
    syncHeaderStatus();

    window.addEventListener("loginSuccess", syncHeaderStatus);
    return () => {
      window.removeEventListener("loginSuccess", syncHeaderStatus);
    };
  }, [pathname]);

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

  const isManagementRole = userRole === "ADMIN" || userRole === "OPERATOR";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  const handleLogoClick = () => {
    if (isManagementRole) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  if (isSimple) {
    return (
      <header className="header-simple">
        <div className="header-container">
          <div className="logo-section" onClick={handleLogoClick}>
            <Image src={Logo} className="logo-img" alt="로고" />
            <span className="logo-text">codebomba</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header-main">
      <div className="header-container">
        <div className="logo-section" onClick={handleLogoClick}>
          <Image src={Logo} className="logo-img" alt="로고" />
          <span className="logo-text">
            {isAdminPath ? "관리자 페이지" : "codebomba"}
          </span>
        </div>

        {!isAdminPath && (
          <div className="search-bar-wrapper">
            <SearchBar />
          </div>
        )}

        <div className="header-right-section">
          {!isAdminPath && isLoggedIn && !isManagementRole && (
            <nav className="header-nav-links">
              <span onClick={() => router.push("/user/my-classroom")}>
                내 강의실
              </span>
              <span onClick={() => router.push("/user/problems")}>
                문제풀이
              </span>
            </nav>
          )}

          {!isLoggedIn ? (
            <button
              className="login-btn group"
              onClick={() => router.push("/login")}
            >
              <div className="icon-wrapper">
                <Image
                  src={BluebombLogo}
                  className="icon-blue group-hover:opacity-0"
                  alt="블루폭탄로고"
                />
                <Image
                  src={WhitebombLogo}
                  className="icon-white opacity-0 group-hover:opacity-100"
                  alt="화이트폭탄로고"
                />
              </div>
              <span>로그인</span>
            </button>
          ) : (
            <div
              className="profile-dropdown-wrapper"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`profile-btn group ${isDropdownOpen ? "active" : ""}`}
              >
                <div className="icon-wrapper">
                  <Image
                    src={BluebombLogo}
                    className={`icon-blue ${isDropdownOpen ? "opacity-0" : "group-hover:opacity-0"}`}
                    alt="블루폭탄로고"
                  />
                  <Image
                    src={WhitebombLogo}
                    className={`icon-white ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    alt="화이트폭탄로고"
                  />
                </div>
                <span>{nickname}</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {!isManagementRole && (
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        router.push("/user/introduce");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>마이페이지</span>
                    </div>
                  )}
                  {isManagementRole && (
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        router.push("/admin");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>관리자 메뉴</span>
                    </div>
                  )}
                  <div
                    className="dropdown-item logout-item"
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
