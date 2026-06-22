import { rankingClasses } from "../styles";
import type { RankingMode } from "../types";

interface RankingModeToggleProps {
  disabled: boolean;
  mode: RankingMode;
  onChange: (mode: RankingMode) => void;
}

export default function RankingModeToggle({
  disabled,
  mode,
  onChange,
}: RankingModeToggleProps) {
  return (
    <div aria-label="랭킹 종류" className={rankingClasses.toggleGroup}>
      <button
        className={`${rankingClasses.toggleButton} ${
          mode === "weekly" ? rankingClasses.toggleButtonActive : ""
        }`}
        disabled={disabled}
        onClick={() => onChange("weekly")}
        type="button"
      >
        주간 랭킹
      </button>
      <button
        className={`${rankingClasses.toggleButton} ${
          mode === "total" ? rankingClasses.toggleButtonActive : ""
        }`}
        disabled={disabled}
        onClick={() => onChange("total")}
        type="button"
      >
        전체 랭킹
      </button>
    </div>
  );
}
