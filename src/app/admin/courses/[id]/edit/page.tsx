"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCourse,
  getCourseCategories,
  uploadCourseThumbnail,
  updateCourse,
} from "@/features/course/actions";
import {
  getCourseLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} from "@/features/course/lectureActions";
import {
  getCourseProblemSets,
  configureCourseProblemSets,
} from "@/features/course/problemSetActions";
import { resolveThumbnailUrl } from "@/features/course/http";
import { isValidYoutubeUrl } from "@/features/course/youtube";
import type { ProblemSetConnection } from "@/features/course/types";
import OneButtonModal from "@/components/common/OneButtonModal";
import TwoButtonModal from "@/components/common/TwoButtonModal";
import LoadingIndicator from "@/components/common/LoadingIndicator";
// 폼 공용 타입 / 카드 컴포넌트 (등록·수정 공유)
import type {
  CourseCategory,
  ProblemCategory,
  ProblemSetSummary,
  VideoLecture,
  ProblemLecture,
  LectureItem,
} from "@/features/course/form/types";
import {
  VideoLectureCard,
  ProblemLectureCard,
} from "@/features/course/form/components/LectureCards";

// ════════════════════════════════════════════════════════════════════════════════
// 강좌 수정 페이지
//  - 진입 시 기존 강좌/강의/문제연결을 불러와 등록폼과 동일한 UI에 pre-fill
//  - 저장 흐름: 썸네일(변경 시) → 강좌 수정 → 기존강의 수정/신규 추가 → 삭제 → 문제 연결
//  - 기존에 저장돼 있던 문제 연결은 재전송하지 않음(중복 INSERT 방지)
// ════════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 문제 도메인 인라인 fetch용 토큰 헤더 (쿠키 인증과 병행)
const authHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

let _idSeq = 100;
const uid = () => `edit-${++_idSeq}-${Math.random().toString(36).slice(2, 5)}`;

// ────────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────────

export default function CourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  // ── Course basic info ─────────────────────────────────────────────────────────
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const [courseCategoryId, setCourseCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // ── Remote data ───────────────────────────────────────────────────────────────
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>(
    [],
  );
  const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>(
    [],
  );
  const [selectedProblemCategoryId, setSelectedProblemCategoryId] =
    useState("");
  const [problemSets, setProblemSets] = useState<ProblemSetSummary[]>([]);

  // ── Selected problem sets ─────────────────────────────────────────────────────
  const [selectedProblemSetIds, setSelectedProblemSetIds] = useState<
    Set<number>
  >(new Set());

  // ── Lectures ──────────────────────────────────────────────────────────────────
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [deletedLectureIds, setDeletedLectureIds] = useState<number[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // 기존에 DB에 저장돼 있던 문제 연결 키("lectureId:problemSetId") — 중복 INSERT 방지용
  const originalLinkKeysRef = useRef<Set<string>>(new Set());

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const dragFromRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // ── Modal / submit ─────────────────────────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<{
    title: string;
    content: string;
    isSuccess: boolean;
  } | null>(null);

  // ────────────────────────────────────────────────────────────────────────────────
  // Initial load — 기존 강좌 데이터 pre-fill
  // ────────────────────────────────────────────────────────────────────────────────

  // 연결된 문제세트가 속한 카테고리를 찾아 자동 선택 (problem 도메인 — 인라인)
  const autoSelectCategory = useCallback(async (problemSetId: number) => {
    try {
      const catRes = await fetch(`${BASE_URL}/api/v1/problem-categories`, {
        credentials: "include",
        headers: { ...authHeader() },
      });
      if (!catRes.ok) return;
      const catJson = await catRes.json();
      const cats = Array.isArray(catJson?.data)
        ? catJson.data
        : Array.isArray(catJson)
          ? catJson
          : [];

      for (const cat of cats) {
        const cid = cat.categoryId;
        const setRes = await fetch(
          `${BASE_URL}/api/v1/problem-sets?categoryId=${encodeURIComponent(cid)}`,
          { credentials: "include", headers: { ...authHeader() } },
        );
        if (!setRes.ok) continue;
        const setJson = await setRes.json();
        const sets = Array.isArray(setJson?.data)
          ? setJson.data
          : Array.isArray(setJson)
            ? setJson
            : [];
        if (
          sets.some(
            (s: { problemSetId: number }) => s.problemSetId === problemSetId,
          )
        ) {
          setSelectedProblemCategoryId(String(cid));
          return;
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!courseId) return;

    const load = async () => {
      setInitialLoading(true);
      try {
        const [c, lectureData, problemLinks] = await Promise.all([
          getCourse(courseId),
          getCourseLectures(courseId),
          getCourseProblemSets(courseId),
        ]);

        setTitle(c.title ?? "");
        setDescription(c.description ?? "");
        setCourseCategoryId(String(c.courseCategoryId ?? ""));
        setExistingThumbnailUrl(c.thumbnailUrl ?? "");
        setThumbnailPreview(resolveThumbnailUrl(c.thumbnailUrl ?? ""));

        // 연결정보: lectureId → problemSetId (이 강의가 문제 강의라는 표시)
        const psByLecture = new Map<number, number>();
        problemLinks.forEach((link) =>
          psByLecture.set(link.lectureId, link.problemSetId),
        );

        // 기존 연결 키 저장 → 저장 시 동일 연결 재전송(중복 INSERT) 방지
        originalLinkKeysRef.current = new Set(
          problemLinks.map((link) => `${link.lectureId}:${link.problemSetId}`),
        );

        setLectures(
          lectureData.map((l) => {
            const linkedPsId = psByLecture.get(l.lectureId);
            // 연결된 문제가 있으면 문제 강의, 없으면 영상 강의
            if (linkedPsId != null) {
              return {
                id: uid(),
                lectureId: l.lectureId,
                type: "problem" as const,
                problemSetId: linkedPsId,
                problemTitle: l.title ?? "",
                dropdownOpen: false,
                lectureOrder: l.lectureOrder,
              } as ProblemLecture;
            }
            return {
              id: uid(),
              lectureId: l.lectureId,
              type: "video" as const,
              title: l.title ?? "",
              videoUrl: l.videoUrl ?? "",
              description: l.description ?? "",
              file: null,
              lectureOrder: l.lectureOrder,
            } as VideoLecture;
          }),
        );

        // 우측 패널: 연결된 문제들을 선택 상태로 + 첫 문제의 카테고리 자동 선택
        const linkedIds = problemLinks.map((link) => link.problemSetId);
        if (linkedIds.length > 0) {
          setSelectedProblemSetIds(new Set(linkedIds));
          void autoSelectCategory(linkedIds[0]);
        }
      } catch {
        /* ignore */
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [courseId]);

  // ── Fetch course categories ────────────────────────────────────────────────────
  useEffect(() => {
    getCourseCategories()
      .then((arr) => setCourseCategories(arr))
      .catch(() => {});
  }, []);

  // ── Fetch problem categories ───────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/problem-categories`, {
      credentials: "include",
      headers: { ...authHeader() },
    })
      .then((r) => r.json())
      .then((res) => {
        const arr: ProblemCategory[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setProblemCategories(
          arr.map((c) => ({ ...c, categoryId: String(c.categoryId) })),
        );
      })
      .catch(() => {});
  }, []);

  // ── Fetch problem sets ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProblemCategoryId) {
      setProblemSets([]);
      return;
    }
    fetch(
      `${BASE_URL}/api/v1/problem-sets?categoryId=${encodeURIComponent(
        selectedProblemCategoryId,
      )}`,
      { credentials: "include", headers: { ...authHeader() } },
    )
      .then((r) => r.json())
      .then((res) => {
        const arr: ProblemSetSummary[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setProblemSets(arr);
      })
      .catch(() => {});
  }, [selectedProblemCategoryId]);

  // ── Close add-menu on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────
  // Thumbnail
  // ────────────────────────────────────────────────────────────────────────────────

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Problem set selection
  // ────────────────────────────────────────────────────────────────────────────────

  const assignedProblemSetIds = new Set<number>(
    lectures
      .filter(
        (l): l is ProblemLecture =>
          l.type === "problem" && l.problemSetId !== null,
      )
      .map((l) => l.problemSetId as number),
  );

  const assignedProblemIds = assignedProblemSetIds;

  const toggleProblemSet = (id: number) => {
    if (assignedProblemIds.has(id)) return;
    setSelectedProblemSetIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Lectures CRUD
  // ────────────────────────────────────────────────────────────────────────────────

  const addVideo = () => {
    setShowAddMenu(false);
    setLectures((prev) => [
      ...prev,
      {
        id: uid(),
        type: "video",
        title: "",
        videoUrl: "",
        description: "",
        file: null,
        lectureOrder: prev.length + 1,
      } as VideoLecture,
    ]);
  };

  const addProblemLecture = () => {
    setShowAddMenu(false);
    setLectures((prev) => [
      ...prev,
      {
        id: uid(),
        type: "problem",
        problemSetId: null,
        dropdownOpen: false,
        lectureOrder: prev.length + 1,
      } as ProblemLecture,
    ]);
  };

  const removeLecture = (id: string) => {
    const target = lectures.find((l) => l.id === id);
    if (target?.lectureId) {
      setDeletedLectureIds((prev) => [...prev, target.lectureId!]);
    }
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

  const updateVideoField = useCallback(
    (id: string, field: keyof VideoLecture, value: unknown) => {
      setLectures((prev) =>
        prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
      );
    },
    [],
  );

  const assignProblemToLecture = (lectureId: string, psId: number) => {
    setLectures((prev) =>
      prev.map((l) =>
        l.id === lectureId
          ? ({
              ...l,
              problemSetId: psId,
              dropdownOpen: false,
            } as ProblemLecture)
          : l,
      ),
    );
  };

  const toggleProblemDropdown = (lectureId: string) => {
    setLectures((prev) =>
      prev.map((l) => {
        if (l.type !== "problem") return l;
        return {
          ...l,
          dropdownOpen:
            l.id === lectureId ? !(l as ProblemLecture).dropdownOpen : false,
        } as ProblemLecture;
      }),
    );
  };

  const getAvailableForLecture = (lectureId: string): ProblemSetSummary[] => {
    const thisItem = lectures.find((l) => l.id === lectureId) as
      | ProblemLecture
      | undefined;
    return problemSets.filter(
      (ps) =>
        selectedProblemSetIds.has(ps.problemSetId) &&
        (!assignedProblemIds.has(ps.problemSetId) ||
          thisItem?.problemSetId === ps.problemSetId),
    );
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Drag & Drop
  // ────────────────────────────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragFromRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragFromRef.current;
    if (from === null || from === dropIndex) {
      setDragOverIdx(null);
      return;
    }
    const arr = [...lectures];
    const [moved] = arr.splice(from, 1);
    arr.splice(dropIndex, 0, moved);
    setLectures(arr);
    dragFromRef.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragFromRef.current = null;
    setDragOverIdx(null);
  };

  const getLabel = (index: number) => {
    const type = lectures[index].type;
    let count = 0;
    for (let i = 0; i <= index; i++) {
      if (lectures[i].type === type) count++;
    }
    return type === "video" ? `강의 영상 ${count}` : `문제 ${count}`;
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Submit
  // ────────────────────────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!title.trim()) return "강좌 제목을 입력해주세요.";
    if (!courseCategoryId) return "카테고리를 선택해주세요.";
    if (!description.trim()) return "강좌 설명을 입력해주세요.";
    for (const lec of lectures) {
      if (lec.type !== "video") continue;
      if (!lec.videoUrl.trim()) return "영상 링크(유튜브)를 입력해주세요.";
      if (!isValidYoutubeUrl(lec.videoUrl.trim()))
        return "유효한 유튜브 링크를 입력해주세요. (예: https://youtu.be/xxxxxxxxxxx)";
    }
    return null;
  };

  const handleSaveClick = () => {
    const err = validate();
    if (err) {
      setResultModal({ title: "입력 오류", content: err, isSuccess: false });
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      // Step 1 — 썸네일 (새 파일 선택한 경우만)
      let thumbnailUrl = existingThumbnailUrl;
      if (thumbnailFile) {
        thumbnailUrl = await uploadCourseThumbnail(thumbnailFile);
      }

      // Step 2 — 강좌 기본 정보 수정
      await updateCourse(courseId, {
        title,
        courseCategoryId: Number(courseCategoryId),
        description,
        thumbnailUrl,
      });

      // Step 3 — 기존 강의 수정 + 새 강의 추가
      const lectureIdMap: Record<string, number> = {};

      for (let i = 0; i < lectures.length; i++) {
        const item = lectures[i];
        const isVideo = item.type === "video";
        const v = isVideo ? (item as VideoLecture) : null;
        const pl = !isVideo ? (item as ProblemLecture) : null;

        const body = {
          title: isVideo
            ? v!.title
            : pl!.problemSetId !== null
              ? (problemSets.find((ps) => ps.problemSetId === pl!.problemSetId)
                  ?.title ?? "문제 강의")
              : "문제 강의",
          description: isVideo ? v!.description : null,
          videoUrl: isVideo ? v!.videoUrl.trim() || null : null,
          lectureOrder: i + 1,
          lectureType: isVideo ? "VIDEO" : "PROBLEM",
        };

        if (item.lectureId) {
          // 기존 강의 수정
          await updateLecture(item.lectureId, body);
          lectureIdMap[item.id] = item.lectureId;
        } else {
          // 새 강의 추가
          lectureIdMap[item.id] = await createLecture(courseId, body);
        }
      }

      // Step 4 — 삭제한 강의 처리
      for (const lid of deletedLectureIds) {
        await deleteLecture(lid);
      }

      // Step 5 — 문제 세트 연결 (이미 DB에 있는 연결은 재전송하지 않음 → 중복 INSERT 방지)
      const connections: ProblemSetConnection[] = [];
      let displayOrderCounter = 1;
      for (let i = 0; i < lectures.length; i++) {
        const item = lectures[i];
        if (item.type !== "problem") continue;
        const pl = item as ProblemLecture;
        if (pl.problemSetId === null) continue;

        const lectureId = lectureIdMap[item.id] ?? null;

        // 기존에 동일 (lectureId:problemSetId) 연결이 이미 저장돼 있으면 건너뜀
        if (
          lectureId != null &&
          originalLinkKeysRef.current.has(`${lectureId}:${pl.problemSetId}`)
        ) {
          continue;
        }

        connections.push({
          problemSetId: pl.problemSetId,
          lectureId,
          role: "MAIN",
          displayOrder: displayOrderCounter++,
        });
      }

      if (connections.length > 0) {
        await configureCourseProblemSets(courseId, connections);
      }

      setResultModal({
        title: "수정 완료",
        content: "강좌가 성공적으로 수정되었습니다.",
        isSuccess: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setResultModal({ title: "수정 실패", content: msg, isSuccess: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Loading
  // ────────────────────────────────────────────────────────────────────────────────

  if (initialLoading) {
    return <LoadingIndicator message="강좌 정보를 불러오는 중입니다." />;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // Render (등록폼과 동일한 레이아웃)
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">강좌 수정</h1>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        {/* ── 기본 정보 ─────────────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            기본 정보
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              {/* Thumbnail */}
              <div>
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  강의 썸네일 이미지 *
                </label>
                <div
                  className="w-full h-56 border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-200 transition-colors relative"
                  onClick={() =>
                    document.getElementById("edit-thumbnail-input")?.click()
                  }
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="썸네일 미리보기"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <rect
                        x="4"
                        y="10"
                        width="48"
                        height="36"
                        rx="4"
                        stroke="#C8C8C8"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M4 38l13-14 10 10 8-8 17 18"
                        stroke="#C8C8C8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <circle cx="18" cy="24" r="4" fill="#C8C8C8" />
                    </svg>
                  )}
                  <input
                    id="edit-thumbnail-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>
                {thumbnailFile && (
                  <p className="mt-1 text-xs text-blue-900">
                    새 파일: {thumbnailFile.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  제목명 *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="강의 제목을 입력하세요."
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-base text-gray-800 placeholder-gray-400 outline-none focus:border-blue-900 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  카테고리 *
                </label>
                <select
                  value={courseCategoryId}
                  onChange={(e) => setCourseCategoryId(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-base text-gray-800 outline-none focus:border-blue-900 bg-white transition-colors cursor-pointer"
                >
                  <option value="">카테고리 선택</option>
                  {courseCategories.map((c) => (
                    <option key={c.courseCategoryId} value={c.courseCategoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  강의 상세내용 *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="강의 설명을 작성해주세요."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-800 placeholder-gray-400 outline-none focus:border-blue-900 resize-none transition-colors"
                />
              </div>
            </div>

            {/* Right column — Problem section */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  문제 카테고리
                </label>
                <select
                  value={selectedProblemCategoryId}
                  onChange={(e) => {
                    setSelectedProblemCategoryId(e.target.value);
                    setSelectedProblemSetIds(new Set());
                  }}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-base text-gray-800 outline-none focus:border-blue-900 bg-white transition-colors cursor-pointer"
                >
                  <option value="">카테고리 선택</option>
                  {problemCategories.map((c) => (
                    <option
                      key={String(c.categoryId)}
                      value={String(c.categoryId)}
                    >
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-base font-medium text-gray-800 mb-1.5">
                  문제 등록
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden min-h-52">
                  {problemSets.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-gray-400">
                      {selectedProblemCategoryId
                        ? "해당 카테고리에 문제가 없습니다."
                        : "카테고리를 선택하면 문제 목록이 나타납니다."}
                    </div>
                  ) : (
                    problemSets.map((ps) => {
                      const isSelected = selectedProblemSetIds.has(
                        ps.problemSetId,
                      );
                      const isAssigned = assignedProblemIds.has(
                        ps.problemSetId,
                      );
                      return (
                        <div
                          key={ps.problemSetId}
                          className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0"
                        >
                          <span className="text-sm text-gray-800 flex-1 truncate pr-3">
                            {ps.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleProblemSet(ps.problemSetId)}
                            disabled={isAssigned}
                            className={[
                              "text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors",
                              isSelected
                                ? "bg-blue-900 text-white"
                                : "bg-white text-blue-900 border border-blue-900 hover:bg-blue-900 hover:text-white",
                              isAssigned
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer",
                            ].join(" ")}
                          >
                            강의 문제
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                {selectedProblemSetIds.size > 0 && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    {selectedProblemSetIds.size}개 선택됨
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 강의 목록 ─────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="relative" ref={addMenuRef}>
              <button
                type="button"
                onClick={() => setShowAddMenu((prev) => !prev)}
                className="text-sm text-blue-900 font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
              >
                <span className="text-lg leading-none">+</span>
                추가
              </button>
              {showAddMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden w-24">
                  <button
                    type="button"
                    onClick={addVideo}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    영상
                  </button>
                  <button
                    type="button"
                    onClick={addProblemLecture}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    문제
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {lectures.length === 0 && (
              <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center text-sm text-gray-400">
                + 추가 버튼으로 강의를 추가해주세요
              </div>
            )}

            {lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={[
                  "border rounded-lg bg-white transition-all cursor-grab active:cursor-grabbing",
                  dragOverIdx === index
                    ? "border-blue-900 shadow-md"
                    : "border-gray-200",
                ].join(" ")}
              >
                {lecture.type === "video" ? (
                  <VideoLectureCard
                    label={getLabel(index)}
                    item={lecture as VideoLecture}
                    onUpdate={updateVideoField}
                    onRemove={() => removeLecture(lecture.id)}
                  />
                ) : (
                  <ProblemLectureCard
                    label={getLabel(index)}
                    item={lecture as ProblemLecture}
                    availableProblemSets={getAvailableForLecture(lecture.id)}
                    allProblemSets={problemSets}
                    onToggleDropdown={() => toggleProblemDropdown(lecture.id)}
                    onSelectProblem={(psId) =>
                      assignProblemToLecture(lecture.id, psId)
                    }
                    onRemove={() => removeLecture(lecture.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom actions ──────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-blue-900 text-white text-base font-medium rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "저장 중..." : "수정 완료"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-2.5 bg-white text-gray-500 text-base font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
        </div>
      </div>

      {/* 수정 확인 모달 */}
      <TwoButtonModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        confirmDisabled={isSubmitting}
        modalTitle="강좌 수정"
        modalContent="변경 사항이 즉시 반영됩니다. 저장하시겠습니까?"
      />

      {/* 결과(알림) 모달 */}
      <OneButtonModal
        isOpen={!!resultModal}
        onClose={() => {
          const success = resultModal?.isSuccess;
          setResultModal(null);
          if (success) router.push(`/courses/${courseId}`);
        }}
        modalTitle={resultModal?.title ?? ""}
        modalContent={resultModal?.content}
      />
    </div>
  );
}
