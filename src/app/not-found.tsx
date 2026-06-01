import ErrorPageView from "@/components/common/ErrorPageView";

export default function NotFound() {
  return (
    <ErrorPageView
      message="요청한 페이지를 찾을 수 없습니다."
      status={404}
    />
  );
}
