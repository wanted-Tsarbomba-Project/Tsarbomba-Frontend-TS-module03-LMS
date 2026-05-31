export interface BackendErrorPayload {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  path?: string;
}

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  path?: string;
  timestamp?: string;

  constructor(payload: BackendErrorPayload, fallbackMessage: string) {
    super(payload.message || fallbackMessage);
    this.name = "ApiClientError";
    this.status = payload.status;
    this.code = payload.code;
    this.path = payload.path;
    this.timestamp = payload.timestamp;
  }
}

const PAGE_ERROR_STATUSES = new Set([401, 403, 404, 500]);

interface RouterLike {
  push: (href: string) => void;
}

interface HandleClientErrorOptions {
  router: RouterLike;
  fallbackTitle: string;
  fallbackMessage: string;
  showModal: (title: string, content: string) => void;
}

export function isPageError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    PAGE_ERROR_STATUSES.has(error.status ?? 0)
  );
}

export function getErrorTitle(
  error: unknown,
  fallbackTitle = "요청을 처리하지 못했습니다",
) {
  if (error instanceof ApiClientError && error.status) {
    return getStatusTitle(error.status);
  }

  return fallbackTitle;
}

export function getErrorContent(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiClientError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

export function handleClientError(
  error: unknown,
  options: HandleClientErrorOptions,
) {
  if (isPageError(error)) {
    options.router.push(buildErrorPageUrl(error as ApiClientError));
    return;
  }

  options.showModal(
    getErrorTitle(error, options.fallbackTitle),
    getErrorContent(error, options.fallbackMessage),
  );
}

export function buildErrorPageUrl(error: ApiClientError) {
  const params = new URLSearchParams();

  if (error.status) params.set("status", String(error.status));
  if (error.code) params.set("code", error.code);
  if (error.message) params.set("message", error.message);
  if (error.path) params.set("path", error.path);
  if (error.timestamp) params.set("timestamp", error.timestamp);

  if (typeof window !== "undefined") {
    params.set("returnTo", window.location.pathname + window.location.search);
  }

  return `/error-page?${params.toString()}`;
}

export function getStatusTitle(status: number) {
  switch (status) {
    case 401:
      return "로그인이 필요합니다";
    case 403:
      return "접근할 수 없는 화면입니다";
    case 404:
      return "페이지를 찾을 수 없습니다";
    case 500:
      return "잠시 후 다시 시도해 주세요";
    default:
      return "요청을 처리하지 못했습니다";
  }
}

export function getStatusGuide(status?: number) {
  switch (status) {
    case 401:
      return "로그인이 만료되었을 수 있습니다. 다시 로그인해 주세요.";
    case 403:
      return "현재 계정으로는 이 화면을 이용할 수 없습니다.";
    case 404:
      return "주소가 올바른지 확인하거나 목록으로 돌아가 주세요.";
    case 500:
      return "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    default:
      return "잠시 후 다시 시도해 주세요.";
  }
}
