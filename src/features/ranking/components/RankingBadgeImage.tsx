import Image from "next/image";

import { BADGE_FALLBACK_SRC, rankingClasses } from "../styles";
import type { RankingUser } from "../types";

interface RankingBadgeImageProps {
  user: RankingUser;
}

export default function RankingBadgeImage({ user }: RankingBadgeImageProps) {
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
