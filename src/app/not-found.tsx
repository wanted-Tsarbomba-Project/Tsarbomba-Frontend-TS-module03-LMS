// Static/Server - 404 페이지: 존재하지 않는 경로에 대해 공통 404 화면을 서버에서 제공함
import ErrorPageView from "@/components/common/ErrorPageView";

export default function NotFound() {
  return (
    <ErrorPageView
      message="요청한 페이지를 찾을 수 없습니다."
      status={404}
    />
  );
}
