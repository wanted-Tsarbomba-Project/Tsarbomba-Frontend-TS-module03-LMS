import { ListSkeleton } from "@/components/common";
import { USER_DETAIL_COURSE_COLUMN_LABELS } from "../constants";

export default function UserDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="box-border min-h-screen p-6 text-text-primary"
    >
      <p aria-live="polite" className="sr-only" role="status">
        회원 상세 정보를 불러오는 중입니다.
      </p>

      <div className="mb-7 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
        <h1 className="m-0 text-[30px] font-bold">회원 상세조회</h1>
        <div aria-hidden="true" className="flex gap-2.5 max-md:flex-wrap">
          <div className="h-11 w-[92px] rounded-[10px] bg-bg-gray" />
          <div className="h-11 w-[92px] rounded-[10px] bg-bg-gray" />
        </div>
      </div>

      <section aria-hidden="true" className="mb-10">
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <div className="flex gap-5 max-md:flex-col max-md:items-stretch" key={rowIndex}>
            {Array.from({ length: rowIndex === 2 ? 1 : 2 }, (_, index) => (
              <div className="mb-6 flex flex-1 flex-col" key={index}>
                <div className="mb-2.5 h-5 w-20 rounded-base bg-bg-gray" />
                <div className="min-h-[52px] rounded-[10px] border border-[#dedede] bg-bg-box px-4" />
              </div>
            ))}
          </div>
        ))}
      </section>

      <div aria-hidden="true" className="mt-5 mb-2.5 flex gap-2.5">
        <div className="h-9 w-[100px] rounded-base bg-button-blue-bg" />
        <div className="h-9 w-[100px] rounded-base border border-button-blue-bg bg-bg-box" />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-bg-box">
        <ListSkeleton
          columns={[...USER_DETAIL_COURSE_COLUMN_LABELS]}
          statusMessage="회원 상세 목록을 불러오는 중입니다."
          withPagination={false}
        />
      </div>
    </div>
  );
}
