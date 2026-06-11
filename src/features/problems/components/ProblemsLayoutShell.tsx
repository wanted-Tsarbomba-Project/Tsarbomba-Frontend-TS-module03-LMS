"use client";

// CSR - 문제 카테고리 사이드바: 현재 URL의 categoryId를 읽고 사용자의 카테고리 선택에 맞춰 라우팅함
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProblemCategory } from "../types";

interface ProblemsLayoutShellProps {
  categories: ProblemCategory[];
  children: ReactNode;
}

const itemBaseClass =
  "block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a237e] transition-all cursor-pointer";
const itemActiveClass =
  "block w-full text-left px-4 py-2.5 rounded-lg text-base font-bold bg-[#1a237e] text-white transition-all cursor-pointer";

export default function ProblemsLayoutShell({
  categories,
  children,
}: ProblemsLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");

  if (pathname !== "/problems") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 w-full max-w-300 mx-auto relative box-border gap-5 max-[1024px]:px-5">
      <aside className="w-60 shrink-0 bg-white border border-[#e8e8e8] rounded-xl p-5 h-fit mt-10 sticky top-24 max-lg:hidden transition-all duration-300">
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col items-start px-2 py-1">
            <span className="text-lg font-bold text-[#1f2937]">카테고리</span>
          </div>
          <hr className="border-[#f3f4f6] -mt-2" />

          <ul className="flex flex-col gap-1">
            <li>
              <button
                className={
                  !selectedCategoryId ? itemActiveClass : itemBaseClass
                }
                onClick={() => router.push("/problems")}
                type="button"
              >
                전체
              </button>
            </li>

            {categories.map((category) => (
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
      </aside>

      <main className="flex-1 min-w-0 py-10">{children}</main>
    </div>
  );
}
