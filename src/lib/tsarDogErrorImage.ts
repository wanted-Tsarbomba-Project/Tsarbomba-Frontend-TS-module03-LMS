const TSAR_DOG_ERROR_STATUSES = new Set([
  400, 401, 402, 403, 404, 409, 429, 500, 502,
]);

const DEFAULT_ERROR_TSAR_DOG = "/assets/img/tsar-dog/error_tsardog.svg";

export function getTsarDogErrorImage(status?: number | null) {
  if (status && TSAR_DOG_ERROR_STATUSES.has(status)) {
    return `/assets/img/tsar-dog/tsardog_${status}.svg`;
  }

  return DEFAULT_ERROR_TSAR_DOG;
}
