// ════════════════════════════════════════════════════════════════════════════════
// 마이페이지 입력 검증
// ════════════════════════════════════════════════════════════════════════════════

/** 전화번호 양식 (예: 010-1234-5678) */
export const PHONE_REGEX = /^01[0-9]-\d{3,4}-\d{4}$/;

/** 비밀번호 양식 (8자+영문+숫자+특수문자) */
export const PW_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`\\|-]).{8,}$/;

export const PW_PLACEHOLDER = "영문+숫자+특수문자 포함 8자 이상";

/** 백엔드 기술 원문 노출 차단 */
export const toUserMessage = (err: unknown, fallback: string): string => {
  const msg = err instanceof Error ? err.message : "";
  const technical = /JDBC|Hikari|Connection|Exception|SQL|timeout|timed out/i;
  if (msg && !msg.includes("\n") && msg.length <= 60 && !technical.test(msg)) {
    return msg;
  }
  return fallback;
};
