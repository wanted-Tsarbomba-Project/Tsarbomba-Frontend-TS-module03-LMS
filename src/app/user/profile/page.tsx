import { redirect } from "next/navigation";
import ErrorPageView from "@/components/common/ErrorPageView";
import ProfileClient from "@/features/user/components/ProfileClient";
import { getMyProfileServer, UnauthorizedError } from "@/features/user/server";

export default async function Page() {
  let profile;
  try {
    profile = await getMyProfileServer();
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/auth/login");
    return (
      <ErrorPageView status={500} message="회원 정보를 불러오지 못했습니다." />
    );
  }

  return <ProfileClient initialProfile={profile} />;
}
