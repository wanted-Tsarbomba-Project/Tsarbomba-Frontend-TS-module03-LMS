let _seq = 0;
export const uid = (prefix = "lec"): string =>
  `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 6)}`;
