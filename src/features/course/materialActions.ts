import { request, resolveThumbnailUrl } from "./http";

export interface LectureMaterial {
  lectureMaterialId: number;
  lectureId: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

/** 강의자료 목록 — GET /api/v1/lectures/{lectureId}/materials */
export const getLectureMaterials = async (
  lectureId: number | string,
): Promise<LectureMaterial[]> => {
  return request<LectureMaterial[]>(
    `/api/v1/lectures/${lectureId}/materials`,
    { method: "GET" },
    "강의자료를 불러오지 못했습니다.",
  ).then((data) => data ?? []);
};

/** 강의자료 업로드 — POST /api/v1/lectures/{lectureId}/materials (multipart, field: material) */
export const uploadLectureMaterial = async (
  lectureId: number | string,
  file: File,
): Promise<LectureMaterial> => {
  const form = new FormData();
  form.append("material", file);
  return request<LectureMaterial>(
    `/api/v1/lectures/${lectureId}/materials`,
    { method: "POST", body: form },
    "강의자료 업로드에 실패했습니다.",
  );
};

/** 강의자료 삭제 — DELETE /api/v1/lecture-materials/{materialId} */
export const deleteLectureMaterial = async (
  materialId: number | string,
): Promise<void> => {
  await request(
    `/api/v1/lecture-materials/${materialId}`,
    { method: "DELETE" },
    "강의자료 삭제에 실패했습니다.",
  );
};

/** 강의자료 다운로드 URL 발급 — POST /api/v1/lecture-materials/{materialId}/download-url */
export const issueMaterialDownloadUrl = async (
  materialId: number | string,
): Promise<string> => {
  const data = await request<{ downloadUrl: string }>(
    `/api/v1/lecture-materials/${materialId}/download-url`,
    { method: "POST" },
    "다운로드 링크를 발급하지 못했습니다.",
  );
  if (!data?.downloadUrl) throw new Error("다운로드 링크를 받지 못했습니다.");
  // 상대경로면 BASE_URL 붙이고, 절대/서명 URL 은 그대로
  return resolveThumbnailUrl(data.downloadUrl);
};
