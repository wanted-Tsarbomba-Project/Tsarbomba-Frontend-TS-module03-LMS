import type {
  AuthResponse,
  EmailVerifyRequest,
  LoginRequest,
  SignupRequest,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const HEADERS = { "Content-Type": "application/json" };

/** 실패 응답에서 사용자 메시지 추출 */
const handleBadResponse = async (
  response: Response,
  defaultMessage: string,
): Promise<string> => {
  try {
    const textData = await response.text();
    try {
      const jsonData = JSON.parse(textData);
      return jsonData?.message || jsonData?.data?.message || defaultMessage;
    } catch {
      return defaultMessage;
    }
  } catch {
    return defaultMessage;
  }
};

/* 로그인 */
export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const body: LoginRequest = { email, password };
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: HEADERS,
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "로그인 정보가 일치하지 않습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 회원가입 */
export const signup = async (
  signupData: SignupRequest,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(signupData),
  });

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "회원가입 처리 중 오류가 발생했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 이메일 중복 체크 */
export const checkEmail = async (email: string): Promise<AuthResponse> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/auth/check/email?email=${encodeURIComponent(email)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "이메일 중복 확인 중 오류가 발생했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 닉네임 중복 체크 */
export const checkNickname = async (
  nickname: string,
): Promise<AuthResponse> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/auth/check/nickname?nickname=${encodeURIComponent(nickname)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "닉네임 중복 확인 중 오류가 발생했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 이메일 인증번호 전송 */
export const sendVerificationCode = async (
  email: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/email/send`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "인증번호 발송에 실패했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 이메일 인증 - 코드 확인 */
export const verifyCode = async (
  email: string,
  code: string,
): Promise<AuthResponse> => {
  const body: EmailVerifyRequest = { email, code };
  const response = await fetch(`${BASE_URL}/api/v1/auth/email/verify`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "인증번호 확인에 실패했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json();
};

/* 이메일(아이디) 찾기 — POST /api/v1/users/find-email (이름+전화번호 → 마스킹 이메일) */
export const findEmail = async (
  name: string,
  phone: string,
): Promise<string> => {
  const response = await fetch(`${BASE_URL}/api/v1/users/find-email`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ name, phone }),
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(response, "일치하는 회원 정보를 찾을 수 없습니다."),
    );
  }

  const json = (await response.json()) as AuthResponse<
    { email?: string; maskedEmail?: string } | string
  >;
  const data = json?.data;
  const email =
    typeof data === "string" ? data : (data?.email ?? data?.maskedEmail);
  if (!email) throw new Error("이메일 정보를 받지 못했습니다.");
  return email;
};

/* 비밀번호 재설정 - 코드 이메일 발송 — POST /api/v1/auth/password/forgot */
export const requestPasswordReset = async (
  email: string,
): Promise<AuthResponse | null> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/password/forgot`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(response, "재설정 코드 발송에 실패했습니다."),
    );
  }

  return response.json().catch(() => null);
};

/* 비밀번호 재설정 - 코드 검증 — POST /api/v1/auth/password/verify-code */
export const verifyPasswordResetCode = async (
  email: string,
  code: string,
): Promise<AuthResponse | null> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/password/verify-code`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(response, "인증번호 확인에 실패했습니다."),
    );
  }

  return response.json().catch(() => null);
};

/* 비밀번호 재설정 — PUT /api/v1/auth/password/reset */
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
): Promise<AuthResponse | null> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/password/reset`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({ email, code, newPassword }),
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(response, "비밀번호 변경에 실패했습니다."),
    );
  }

  return response.json().catch(() => null);
};

/* 추가 인증(step-up) 코드 검증 — POST /api/v1/auth/step-up/verify*/
export const verifyStepUp = async (
  code: string,
  trustDevice: boolean = false,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/step-up/verify`, {
    method: "POST",
    headers: HEADERS,
    credentials: "include",
    body: JSON.stringify({ code, trustDevice }),
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(
        response,
        "인증번호가 일치하지 않거나 만료되었습니다.",
      ),
    );
  }

  return response.json();
};

/* 추가 인증(step-up) 코드 재발송 — POST /api/v1/auth/step-up/resend */
export const resendStepUp = async (): Promise<AuthResponse | null> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/step-up/resend`, {
    method: "POST",
    headers: HEADERS,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await handleBadResponse(response, "인증번호 재발송에 실패했습니다."),
    );
  }

  return response.json().catch(() => null);
};

/* 로그아웃 */
export const logoutService = async (): Promise<AuthResponse | null> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: HEADERS,
    credentials: "include",
  });

  if (!response.ok) {
    const errMsg = await handleBadResponse(
      response,
      "로그아웃 처리 중 오류가 발생했습니다.",
    );
    throw new Error(errMsg);
  }

  return response.json().catch(() => null);
};
