import { ListSkeleton } from "@/components/common";
import { USER_DETAIL_COURSE_COLUMN_LABELS } from "../constants";
import { userDetailClasses } from "../userDetailStyles";

export default function UserDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className={userDetailClasses.container}
    >
      <p aria-live="polite" className="sr-only" role="status">
        회원 상세 정보를 불러오는 중입니다.
      </p>

      <div className={userDetailClasses.pageHeader}>
        <h1 className={userDetailClasses.pageTitle}>회원 상세조회</h1>
        <div
          aria-hidden="true"
          className={userDetailClasses.headerButtonGroup}
        >
          <div className="h-11 w-[92px] rounded-[10px] bg-bg-gray" />
          <div className="h-11 w-[92px] rounded-[10px] bg-bg-gray" />
        </div>
      </div>

      <section aria-hidden="true" className={userDetailClasses.infoSection}>
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <div className={userDetailClasses.row} key={rowIndex}>
            {Array.from({ length: rowIndex === 2 ? 1 : 2 }, (_, index) => (
              <div className={userDetailClasses.inputGroup} key={index}>
                <div className="mb-2.5 h-5 w-20 rounded-base bg-bg-gray" />
                <div className={userDetailClasses.readonlyBox} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <div aria-hidden="true" className={userDetailClasses.tabGroup}>
        <div className="h-9 w-[100px] rounded-base bg-button-blue-bg" />
        <div className="h-9 w-[100px] rounded-base border border-button-blue-bg bg-bg-box" />
      </div>

      <div className={userDetailClasses.listSection}>
        <ListSkeleton
          columns={[...USER_DETAIL_COURSE_COLUMN_LABELS]}
          statusMessage="회원 상세 목록을 불러오는 중입니다."
          withPagination={false}
        />
      </div>
    </div>
  );
}
