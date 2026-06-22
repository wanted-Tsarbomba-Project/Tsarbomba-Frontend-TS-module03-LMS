// 백엔드(LectureCommandService)와 동일 규칙 — 변경 시 양쪽 동기화 필요.
export const isValidYoutubeUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.port || u.username || u.password) return false;
    const isId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be") {
      const seg = u.pathname.slice(1).split("/");
      return seg.length === 1 && isId(seg[0]);
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      if (u.pathname === "/watch") {
        const vs = u.searchParams.getAll("v");
        return vs.length === 1 && isId(vs[0]);
      }
      const embed = u.pathname.match(/^\/embed\/([^/]+)$/);
      if (embed) return isId(embed[1]);
      const shorts = u.pathname.match(/^\/shorts\/([^/]+)$/);
      if (shorts) return isId(shorts[1]);
    }
    return false;
  } catch {
    return false;
  }
};
