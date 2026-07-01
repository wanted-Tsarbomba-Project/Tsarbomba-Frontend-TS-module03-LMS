import type { ReactNode } from "react";

import { List } from "@/components/common";
import type { ListColumn } from "@/components/common";

import { MY_RANKING_ROW_CLASS, rankingClasses } from "../styles";
import { RANKING_LIST_COLUMN_LABELS } from "../constants";
import type { RankingUser } from "../types";
import {
  formatPoint,
  formatRank,
  getDisplayName,
  isMyRankingItem,
} from "../utils";
import RankingBadgeImage from "./RankingBadgeImage";

interface RankingListProps {
  myRanking: RankingUser | null;
  pagination?: ReactNode;
  rankings: RankingUser[];
}

const rankingColumns: ListColumn<RankingUser>[] = [
  {
    key: "rank",
    label: RANKING_LIST_COLUMN_LABELS.rank,
    render: (item) => (
      <span className={rankingClasses.rank}>{formatRank(item.rank)}</span>
    ),
  },
  {
    key: "badgeImageUrl",
    label: RANKING_LIST_COLUMN_LABELS.badge,
    render: (item) => <RankingBadgeImage user={item} />,
  },
  {
    key: "nickname",
    label: RANKING_LIST_COLUMN_LABELS.nickname,
    render: (item) => (
      <span className={rankingClasses.userName}>{getDisplayName(item)}</span>
    ),
  },
  {
    key: "weeklyPoint",
    label: RANKING_LIST_COLUMN_LABELS.weeklyPoint,
    render: (item) => (
      <span className={rankingClasses.point}>
        {formatPoint(item.weeklyPoint)}
      </span>
    ),
  },
  {
    key: "totalPoint",
    label: RANKING_LIST_COLUMN_LABELS.totalPoint,
    render: (item) => (
      <span className={rankingClasses.point}>
        {formatPoint(item.totalPoint)}
      </span>
    ),
  },
];

export default function RankingList({
  myRanking,
  pagination = null,
  rankings,
}: RankingListProps) {
  return (
    <List
      columns={rankingColumns}
      data={rankings}
      emptyMessage="표시할 랭킹이 없습니다."
      pagination={pagination}
      rowClassName={(item) =>
        isMyRankingItem(item, myRanking) ? MY_RANKING_ROW_CLASS : ""
      }
      rowKey={(item) => item.userId}
    />
  );
}
