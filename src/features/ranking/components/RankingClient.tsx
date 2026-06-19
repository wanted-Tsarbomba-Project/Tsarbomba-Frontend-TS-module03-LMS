"use client";

// CSR - 랭킹 전환: 최초 SSR 데이터 이후 주간/전체 버튼 전환에 따라 랭킹 목록을 즉시 다시 조회함
import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { List, LoadingIndicator, OneButtonModal } from "@/components/common";
import type { ListColumn } from "@/components/common";
import { handleClientError } from "@/lib/errorHandling";

import { getTotalPointRankings, getWeeklyPointRankings } from "../api";
import type { RankingMode, RankingUser } from "../types";

const BADGE_FALLBACK_SRC = "/assets/img/bluebomb-Icon.svg";
const MY_RANKING_ROW_CLASS = "[&_td]:!bg-[#eaf2ff]";

const rankingClasses = {
  page: "mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-[1080px] flex-col px-5 py-14",
  header:
    "mb-6 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch",
  titleGroup: "space-y-2",
  title: "text-title-lg font-bold text-text-primary",
  description: "text-description text-text-secondary",
  toggleGroup:
    "inline-flex rounded-base border border-border-light bg-bg-box p-1 max-md:w-full",
  toggleButton:
    "h-10 cursor-pointer rounded-base px-4 text-body font-semibold text-text-secondary transition-colors hover:bg-bg-box-hover disabled:cursor-not-allowed disabled:opacity-60 max-md:flex-1",
  toggleButtonActive:
    "bg-button-blue-bg text-text-white hover:bg-button-blue-bg",
  listShell:
    "overflow-hidden rounded-base border border-border-light bg-bg-box [&_tbody_td]:h-[86px] [&_thead_th]:h-[52px]",
  rank: "text-body text-text-primary",
  badgeWrap: "flex items-center justify-center",
  badgeImage: "h-11 w-11 object-contain",
  userName: "text-text-primary",
  point: "text-text-primary",
  myRanking:
    "sticky bottom-16 z-20 mt-5 grid min-h-[76px] grid-cols-5 items-center rounded-base border border-[#cfd9ea] bg-[#eaf2ff] text-center shadow-[0_10px_24px_rgba(26,35,126,0.12)] max-md:grid-cols-2 max-md:gap-3 max-md:px-4 max-md:py-4",
  myCell: "box-border flex items-center justify-center p-2",
  myLabel: "text-body font-bold text-text-primary",
  myEmpty:
    "sticky bottom-16 z-20 mt-5 rounded-base border border-border-light bg-bg-navbar px-5 py-5 text-center text-body text-text-secondary",
} as const;

interface RankingClientProps {
  initialRankings: RankingUser[];
  myRanking: RankingUser | null;
}

function formatRank(rank: number) {
  return String(rank).padStart(2, "0");
}

function formatPoint(point: number) {
  return point.toLocaleString("ko-KR");
}

function getDisplayName(user: RankingUser) {
  return user.nickname;
}

function isMyRankingItem(item: RankingUser, myRanking: RankingUser | null) {
  return myRanking ? item.userId === myRanking.userId : false;
}

function BadgeImage({ user }: { user: RankingUser }) {
  return (
    <span className={rankingClasses.badgeWrap}>
      <Image
        alt={`${user.nickname} 뱃지`}
        className={rankingClasses.badgeImage}
        height={44}
        loader={({ src }) => src}
        src={user.badgeImageUrl || BADGE_FALLBACK_SRC}
        unoptimized
        width={44}
      />
    </span>
  );
}

export default function RankingClient({
  initialRankings,
  myRanking,
}: RankingClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<RankingMode>("total");
  const [rankings, setRankings] = useState(initialRankings);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });
  const currentMyRanking = useMemo(() => {
    if (!myRanking) {
      return null;
    }

    if (mode === "total") {
      return myRanking;
    }

    return rankings.find((item) => item.userId === myRanking.userId) ?? null;
  }, [mode, rankings, myRanking]);

  const columns = useMemo<ListColumn<RankingUser>[]>(
    () => [
      {
        key: "rank",
        label: "No.",
        render: (item) => (
          <span className={rankingClasses.rank}>{formatRank(item.rank)}</span>
        ),
      },
      {
        key: "badgeImageUrl",
        label: "뱃지",
        render: (item) => <BadgeImage user={item} />,
      },
      {
        key: "nickname",
        label: "이름",
        render: (item) => (
          <span className={rankingClasses.userName}>
            {getDisplayName(item)}
          </span>
        ),
      },
      {
        key: "weeklyPoint",
        label: "주간 포인트",
        render: (item) => (
          <span className={rankingClasses.point}>
            {formatPoint(item.weeklyPoint)}
          </span>
        ),
      },
      {
        key: "totalPoint",
        label: "누적 포인트",
        render: (item) => (
          <span className={rankingClasses.point}>
            {formatPoint(item.totalPoint)}
          </span>
        ),
      },
    ],
    [],
  );

  const handleModeChange = async (nextMode: RankingMode) => {
    if (nextMode === mode || loading) {
      return;
    }

    setLoading(true);

    try {
      const nextRankings =
        nextMode === "total"
          ? await getTotalPointRankings()
          : await getWeeklyPointRankings();

      setRankings(nextRankings);
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

        <div aria-label="랭킹 종류" className={rankingClasses.toggleGroup}>
          <button
            className={`${rankingClasses.toggleButton} ${
              mode === "weekly" ? rankingClasses.toggleButtonActive : ""
            }`}
            disabled={loading}
            onClick={() => handleModeChange("weekly")}
            type="button"
          >
            주간 랭킹
          </button>
          <button
            className={`${rankingClasses.toggleButton} ${
              mode === "total" ? rankingClasses.toggleButtonActive : ""
            }`}
            disabled={loading}
            onClick={() => handleModeChange("total")}
            type="button"
          >
            전체 랭킹
          </button>
        </div>
      </div>

      <div className={rankingClasses.listShell}>
        {loading ? (
          <LoadingIndicator message="랭킹을 불러오는 중입니다." />
        ) : (
          <List
            columns={columns}
            data={rankings}
            emptyMessage="표시할 랭킹이 없습니다."
            rowClassName={(item) =>
              isMyRankingItem(item, currentMyRanking)
                ? MY_RANKING_ROW_CLASS
                : ""
            }
            rowKey={(item) => item.rank}
            scrollable={false}
          />
        )}
      </div>

      {currentMyRanking ? (
        <div className={rankingClasses.myRanking}>
          <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
            {formatRank(currentMyRanking.rank)}
          </span>
          <span className={rankingClasses.myCell}>
            <BadgeImage user={currentMyRanking} />
          </span>
          <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
            {getDisplayName(currentMyRanking)}
          </span>
          <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
            {formatPoint(currentMyRanking.weeklyPoint)}
          </span>
          <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
            {formatPoint(currentMyRanking.totalPoint)}
          </span>
        </div>
      ) : (
        <div className={rankingClasses.myEmpty}>
          내 랭킹 정보를 불러오지 못했습니다.
        </div>
      )}

      <OneButtonModal
        isOpen={modal.open}
        modalContent={modal.content}
        modalTitle={modal.title}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </section>
  );
}
