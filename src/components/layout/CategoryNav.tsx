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

  const btnBase =
    "px-4 h-[42px] text-base font-normal rounded-lg border border-[#e8e8e8] bg-white text-[#1f2937] hover:bg-[#f3f4f6] transition-colors cursor-pointer whitespace-nowrap box-border flex items-center justify-center";
  const btnActive =
    "px-4 h-[42px] text-base font-normal rounded-lg bg-[#1a237e] text-white transition-colors cursor-pointer whitespace-nowrap box-border flex items-center justify-center";

  // 1. 문제 풀이 상세 화면 전용 상단 네비게이션
  if (variant === "problem-detail") {
    return (
      <nav className="w-full border-b bg-white border-[#e8e8e8] py-3 mb-4">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6">
          <button className={btnBase} onClick={onBack}>
            뒤로가기
          </button>

          <div className="flex items-center gap-2">
            <button className={btnActive} onClick={onRun}>
              실행하기
            </button>
            <button
              className={isProblemChatOpen ? btnActive : btnBase}
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

  // 2. 일반 강좌 / 문제 풀이 목록 화면 전용 카테고리 네비게이션
  return (
    <nav className="w-full border-b bg-white border-[#e8e8e8] py-3 mb-4">
      <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6 gap-4">
        {/* 좌측 카테고리 버튼 모음 */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((item, index) => (
            <button
              key={index}
              className={item === currentCategory ? btnActive : btnBase}
              onClick={() => handleCategoryClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {/* 우측 정렬 드롭다운 */}
        <div className="shrink-0">
          <select className="h-[42px] px-4 rounded-lg border border-[#e8e8e8] bg-white text-base font-normal text-[#1f2937] focus:outline-none focus:border-[#1a237e] transition-colors cursor-pointer box-border">
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
