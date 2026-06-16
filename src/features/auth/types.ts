/** 공통 응답 래퍼 */
export interface AuthResponse {
  status?: string;
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 응답 data */
export interface LoginResponseData {
  nickname?: string;
  role?: string;
}

/** 회원가입 요청 */
export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  nickname: string;
  phone: string;
}

/** 이메일 인증 코드 검증 요청 */
export interface EmailVerifyRequest {
  email: string;
  code: string;
}
