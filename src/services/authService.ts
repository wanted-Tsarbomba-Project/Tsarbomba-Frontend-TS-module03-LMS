const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const HEADERS = { "Content-Type": "application/json" };

export interface AuthResponse {
  status?: string;
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    nickname?: string;
    role?: string;
    email?: string;
    username?: string;
  };
}

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
      if (textData.includes("default message")) {
        const match = textData.match(/default message \[(.*?)\]\]/);
        if (match && match[1]) return match[1];
      }
      return textData || defaultMessage;
    }
  } catch {
    return defaultMessage;
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: HEADERS,
    credentials: "include",
    body: JSON.stringify({ email, password }),
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

export const signup = async (signupData: any): Promise<AuthResponse> => {
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

export const checkEmail = async (
  email: string,
): Promise<boolean | AuthResponse> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/auth/check/email?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: HEADERS,
    },
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

export const checkNickname = async (
  nickname: string,
): Promise<boolean | AuthResponse> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/auth/check/nickname?nickname=${encodeURIComponent(nickname)}`,
    {
      method: "GET",
      headers: HEADERS,
    },
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

export const verifyCode = async (
  email: string,
  code: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/email/verify`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ email, code }),
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

export const findId = async (name: string, phone: string): Promise<any> => {
  return {
    status: "OK",
    success: true,
    statusCode: 200,
    message: "이메일 찾기 성공",
    email: "test@example.com",
  };
};

export const resetPassword = async (
  email: string,
  newPassword: string,
): Promise<any> => {
  return {
    status: "OK",
    success: true,
    statusCode: 200,
    message: "비밀번호 변경 성공",
    data: true,
  };
};

export const logoutService = async (): Promise<any> => {
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
