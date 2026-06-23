// SSR + CSR - 랭킹 페이지: 최초 전체 랭킹과 내 전체 랭킹은 서버에서 가져오고, 주간/전체 전환은 클라이언트에서 즉시 조회함
import { cookies } from "next/headers";

import {
  getMyPointRanking,
  getTotalPointRankings,
} from "@/features/ranking/actions";
import RankingClient from "@/features/ranking/components/RankingClient";

export default async function RankingPage() {
  const cookieHeader = (await cookies()).toString();
  const requestInit = {
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  };

  const [initialRankings, initialMyRanking] = await Promise.all([
    getTotalPointRankings(requestInit).catch(() => []),
    getMyPointRanking(requestInit).catch(() => null),
  ]);

  return (
    <RankingClient
      initialMyRanking={initialMyRanking}
      initialRankings={initialRankings}
    />
  );
}
