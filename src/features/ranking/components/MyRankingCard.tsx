import { rankingClasses } from "../styles";
import type { RankingUser } from "../types";
import { formatPoint, formatRank, getDisplayName } from "../utils";
import RankingBadgeImage from "./RankingBadgeImage";

interface MyRankingCardProps {
  myRanking: RankingUser | null;
}

export default function MyRankingCard({ myRanking }: MyRankingCardProps) {
  if (!myRanking) {
    return (
      <div className={rankingClasses.myEmpty}>
        내 랭킹 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className={rankingClasses.myRanking}>
      <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
        {formatRank(myRanking.rank)}
      </span>
      <span className={rankingClasses.myCell}>
        <RankingBadgeImage user={myRanking} />
      </span>
      <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
        {getDisplayName(myRanking)}
      </span>
      <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
        {formatPoint(myRanking.weeklyPoint)}
      </span>
      <span className={`${rankingClasses.myCell} ${rankingClasses.myLabel}`}>
        {formatPoint(myRanking.totalPoint)}
      </span>
    </div>
  );
}
