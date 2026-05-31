"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CategoryNavProps {
  variant?: "category" | "problem-detail";
  onBack?: () => void;
  onRun?: () => void;
  onToggleProblemChat?: () => void;
  isProblemChatOpen?: boolean;
  isRunning?: boolean;
}

const CATEGORIES = [
  "전체",
  "데이터 분석",
  "머신러닝",
  "Python",
  "SQL",
  "통계",
  "시각화",
  "빅데이터",
];

export default function CategoryNav({
  variant = "category",
  onBack,
  onRun,
  onToggleProblemChat,
  isProblemChatOpen = false,
  isRunning = false,
}: CategoryNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "전체";

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "전체") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const btnBase =
    "px-4 h-[42px] text-base font-normal rounded-lg border border-[#e8e8e8] bg-white text-[#1f2937] hover:bg-[#f3f4f6] transition-colors cursor-pointer whitespace-nowrap box-border flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60";
  const btnActive =
    "px-4 h-[42px] text-base font-normal rounded-lg border border-[#1a237e] bg-[#1a237e] text-white transition-colors cursor-pointer whitespace-nowrap box-border flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60";

  if (variant === "problem-detail") {
    return (
      <nav className="w-full border-b bg-white border-[#e8e8e8] py-3 mb-4">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6">
          <button className={btnBase} onClick={onBack} type="button">
            뒤로가기
          </button>

          <div className="flex items-center gap-2">
            <button
              className={btnActive}
              disabled={isRunning}
              onClick={onRun}
              type="button"
            >
              {isRunning ? "실행 중" : "실행하기"}
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

  if (pathname.startsWith("/problems/") || pathname.startsWith("/user/problems/")) {
    return null;
  }

  return (
    <nav className="w-full border-b bg-white border-[#e8e8e8] py-3 mb-4">
      <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6 gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={category === currentCategory ? btnActive : btnBase}
              onClick={() => handleCategoryClick(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

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
