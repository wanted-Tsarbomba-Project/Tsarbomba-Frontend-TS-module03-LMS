"use client";

// CSR - 랭킹 전환: 최초 SSR 데이터 이후 주간/전체 버튼 전환에 따라 목록과 내 랭킹을 함께 다시 조회함
import { useState } from "react";
import { useRouter } from "next/navigation";

import { LoadingIndicator, OneButtonModal } from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getMyPointRankingByMode, getPointRankingsByMode } from "../actions";
import { rankingClasses } from "../styles";
import type { RankingMode, RankingUser } from "../types";
import MyRankingCard from "./MyRankingCard";
import RankingList from "./RankingList";
import RankingModeToggle from "./RankingModeToggle";

interface RankingClientProps {
  initialMyRanking: RankingUser | null;
  initialRankings: RankingUser[];
}

export default function RankingClient({
  initialMyRanking,
  initialRankings,
}: RankingClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<RankingMode>("total");
  const [rankings, setRankings] = useState(initialRankings);
  const [myRanking, setMyRanking] = useState<RankingUser | null>(
    initialMyRanking,
  );
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });

  const handleModeChange = async (nextMode: RankingMode) => {
    if (nextMode === mode || loading) {
      return;
    }

    setLoading(true);

    try {
      const [nextRankings, nextMyRanking] = await Promise.all([
        getPointRankingsByMode(nextMode),
        getMyPointRankingByMode(nextMode),
      ]);

      setRankings(nextRankings);
      setMyRanking(nextMyRanking);
      setMode(nextMode);
    } catch (error) {
      handleClientError(error, {
        router,
        fallbackTitle: "랭킹 조회 실패",
        fallbackMessage:
          "랭킹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        showModal: (title, content) => setModal({ open: true, title, content }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={rankingClasses.page}>
      <div className={rankingClasses.header}>
        <div className={rankingClasses.titleGroup}>
          <h1 className={rankingClasses.title}>랭킹</h1>
          <p className={rankingClasses.description}>
            포인트 기준으로 주간 랭킹과 전체 랭킹을 확인할 수 있습니다.
          </p>
        </div>

        <RankingModeToggle
          disabled={loading}
          mode={mode}
          onChange={handleModeChange}
        />
      </div>

      <div className={rankingClasses.listShell}>
        {loading ? (
          <LoadingIndicator message="랭킹을 불러오는 중입니다." />
        ) : (
          <RankingList myRanking={myRanking} rankings={rankings} />
        )}
      </div>

      <MyRankingCard myRanking={myRanking} />

      <OneButtonModal
        isOpen={modal.open}
        modalContent={modal.content}
        modalTitle={modal.title}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </section>
  );
}
