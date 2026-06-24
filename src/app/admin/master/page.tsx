// Server - 최고관리자 전용: MASTER 권한만 접근 가능한 관리자 관리 진입 화면임
export default function AdminMasterPage() {
  return (
    <section className="box-border p-6 text-text-primary">
      <h1 className="m-0 text-2xl font-bold">관리자 관리</h1>
      <p className="mt-4 text-body text-text-secondary">
        최고관리자 전용 페이지입니다. 해당 페이지에서 관리자 조회 및 권한 관리를
        할 수 있습니다.
      </p>
    </section>
  );
}
