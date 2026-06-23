import type { Course, CourseStatusFilter } from "./types";

export const ALL_COURSE_CATEGORY = "전체";
export const COURSE_SEARCH_PARAM = "keyword";

interface CourseFilterOptions {
  category?: string;
  keyword?: string;
  statusFilter?: CourseStatusFilter;
}

function normalizeKeyword(keyword?: string) {
  return keyword?.trim().toLowerCase() ?? "";
}

export function buildCourseSearchHref(
  searchParams: Pick<URLSearchParams, "toString">,
  keyword: string,
) {
  const params = new URLSearchParams(searchParams.toString());
  const nextKeyword = keyword.trim();

  if (nextKeyword) {
    params.set(COURSE_SEARCH_PARAM, nextKeyword);
  } else {
    params.delete(COURSE_SEARCH_PARAM);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function matchesCourseTitle(course: Course, keyword?: string) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return course.title.toLowerCase().includes(normalizedKeyword);
}

export function matchesCourseCategory(course: Course, category?: string) {
  return (
    !category ||
    category === ALL_COURSE_CATEGORY ||
    course.courseCategoryName === category
  );
}

export function matchesCourseStatus(
  course: Course,
  statusFilter: CourseStatusFilter = "all",
) {
  if (statusFilter === "open") {
    return course.status === "ACTIVE";
  }

  if (statusFilter === "hidden") {
    return course.status === "DRAFT" || course.status === "DELETED";
  }

  return true;
}

export function filterCourses(
  courses: Course[],
  { category, keyword, statusFilter = "all" }: CourseFilterOptions,
) {
  return courses.filter(
    (course) =>
      matchesCourseCategory(course, category) &&
      matchesCourseTitle(course, keyword) &&
      matchesCourseStatus(course, statusFilter),
  );
}
