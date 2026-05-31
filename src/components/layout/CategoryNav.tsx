"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CategoryNavProps {
  variant?: "category" | "problem-detail";
  onBack?: () => void;
  onRun?: () => void;
  onToggleProblemChat?: () => void;
  isProblemChatOpen?: boolean;
}

function CategoryNav({
  variant = "category",
  onBack,
  onRun,
  onToggleProblemChat,
  isProblemChatOpen = false,
}: CategoryNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 0. 홈 - 강의 카테고리
  const currentCategory = searchParams.get("category") || "전체";

  const categories = [
    "전체",
    "데이터 분석",
    "머신러닝",
    "Python",
    "SQL",
    "통계",
    "시각화",
    "빅데이터",
  ];

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "전체") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  if (variant === "category" && pathname.startsWith("/user/problem/")) {
    return null;
  }

  // 1. 문제 풀이 상세 화면 전용 상단 네비게이션
  if (variant === "problem-detail") {
    return (
      <nav className="category-nav problem-detail-nav">
        <div className="category-nav-content problem-detail-nav-content">
          <button
            className="category-box problem-detail-nav-button"
            onClick={onBack}
          >
            뒤로가기
          </button>

          <div className="problem-detail-nav-actions">
            <button
              className="category-box active problem-detail-nav-button"
              onClick={onRun}
            >
              실행하기
            </button>

            <button
              className={`category-box problem-detail-nav-button ${isProblemChatOpen ? "active" : ""}`}
              onClick={onToggleProblemChat}
              type="button"
            >
              챗봇
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // 2. 문제 풀이 목록 화면 전용 카테고리 네비게이션
  return (
    <nav className="category-nav">
      <div className="category-nav-content">
        {/* 좌측 카테고리 */}
        <div className="category-nav-left">
          {categories.map((item, index) => (
            <button
              key={index}
              className={`category-box ${item === currentCategory ? "active" : ""}`}
              onClick={() => handleCategoryClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {/* 우측 드롭다운 */}
        <div className="category-nav-right">
          <select className="dropdown">
            <option>전체 정렬</option>
            <option>최신순</option>
            <option>인기순</option>
          </select>
        </div>
      </div>
    </nav>
  );
}

export default CategoryNav;
