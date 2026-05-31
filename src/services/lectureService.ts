const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 💡 강좌(Course) 데이터 타입 인터페이스 정의 및 수출
export interface CourseData {
  id?: number | string;
  courseId?: number | string;
  title?: string;
  courseName?: string;
  description?: string;
  thumbnailUrl?: string;
  courseThumbnailUrl?: string;
  status?: "ACTIVE" | "DRAFT" | "DELETED";
  isEnrolled?: boolean;
  enrolled?: boolean;
  enrollStatus?: string;
  enrollmentStatus?: string;
}

// 💡 강의(Lecture) 데이터 타입 인터페이스 정의 및 수출
export interface LectureData {
  id?: number | string;
  lectureId?: number | string;
  title?: string;
}

export const getStudentCourses = async (): Promise<CourseData[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/courses`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "강좌 목록을 불러오지 못했습니다.");
    }

    const result = await response.json();
    const courses = result?.data?.courses || result?.data || result;

    const localSavedEnrollments = JSON.parse(
      typeof window !== "undefined"
        ? localStorage.getItem("enrolled_courses") || "[]"
        : "[]",
    );

    if (Array.isArray(courses)) {
      return courses.map((course: CourseData) => {
        const cId = course.id || course.courseId;
        if (
          localSavedEnrollments.includes(String(cId)) ||
          localSavedEnrollments.includes(Number(cId))
        ) {
          return { ...course, isEnrolled: true, enrolled: true };
        }
        return course;
      });
    }

    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.error("getStudentCourses API 에러:", error);
    throw error;
  }
};

export const updateCourseStatus = async (
  courseId: number | string,
  payload: any,
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/courses/${courseId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "상태 변경 도중 에러가 발생했습니다.",
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`updateCourseStatus API 에러 (ID: ${courseId}):`, error);
    throw error;
  }
};

export const getLectureCategories = async (): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/courses/categories`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "강의 카테고리를 가져오지 못했습니다.",
      );
    }

    const result = await response.json();
    return result?.data || result;
  } catch (error) {
    console.error("getLectureCategories API 에러:", error);
    throw error;
  }
};

export const getProblemCategories = async (): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/problems/categories`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "문제 카테고리를 가져오지 못했습니다.",
      );
    }

    const result = await response.json();
    return result?.data || result;
  } catch (error) {
    console.error("getProblemCategories API 에러:", error);
    throw error;
  }
};

export const getProblemSetsByCategory = async (
  categoryId: number | string,
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/problems/categories/${categoryId}/sets`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "해당 카테고리의 문제 세트를 가져오지 못했습니다.",
      );
    }

    const result = await response.json();
    return result?.data || result;
  } catch (error) {
    console.error(
      `getProblemSetsByCategory API 에러 (ID: ${categoryId}):`,
      error,
    );
    throw error;
  }
};

export const getCourseDetail = async (
  courseId: number | string,
): Promise<CourseData> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/courses/${courseId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "강좌 상세 정보를 불러오지 못했습니다.",
      );
    }

    const result = await response.json();
    const courseData = result?.data || result;

    const localSavedEnrollments = JSON.parse(
      typeof window !== "undefined"
        ? localStorage.getItem("enrolled_courses") || "[]"
        : "[]",
    );
    const cId = courseData.id || courseData.courseId || courseId;
    if (
      localSavedEnrollments.includes(String(cId)) ||
      localSavedEnrollments.includes(Number(cId))
    ) {
      courseData.isEnrolled = true;
      courseData.enrolled = true;
    }

    return courseData;
  } catch (error) {
    console.error(`getCourseDetail API 에러 (ID: ${courseId}):`, error);
    throw error;
  }
};

export const getCourseLectures = async (
  courseId: number | string,
): Promise<LectureData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/courses/${courseId}/lectures`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "강의 목록을 불러오지 못했습니다.");
    }

    const result = await response.json();
    const lectureData = result?.data || result;
    return Array.isArray(lectureData) ? lectureData : [];
  } catch (error) {
    console.error(`getCourseLectures API 에러 (ID: ${courseId}):`, error);
    throw error;
  }
};

export const enrollCourse = async (courseId: number | string): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/courses/${courseId}/enrollments`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "수강 신청에 실패했습니다.");
    }

    if (typeof window !== "undefined") {
      const localSavedEnrollments = JSON.parse(
        localStorage.getItem("enrolled_courses") || "[]",
      );
      if (!localSavedEnrollments.includes(String(courseId))) {
        localSavedEnrollments.push(String(courseId));
        localStorage.setItem(
          "enrolled_courses",
          JSON.stringify(localSavedEnrollments),
        );
      }
    }

    return await response.json();
  } catch (error: any) {
    if (error.message && error.message.includes("Duplicate entry")) {
      if (typeof window !== "undefined") {
        const localSavedEnrollments = JSON.parse(
          localStorage.getItem("enrolled_courses") || "[]",
        );
        if (!localSavedEnrollments.includes(String(courseId))) {
          localSavedEnrollments.push(String(courseId));
          localStorage.setItem(
            "enrolled_courses",
            JSON.stringify(localSavedEnrollments),
          );
        }
      }
      return { success: true, message: "이미 신청된 강좌 기록 보존" };
    }
    console.error(`enrollCourse API 에러 (ID: ${courseId}):`, error);
    throw error;
  }
};

export const deleteCourse = async (courseId: number | string): Promise<any> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    const response = await fetch(`${BASE_URL}/api/v1/courses/${courseId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "강좌 삭제에 실패했습니다.");
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return { success: true };
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : { success: true };
  } catch (error) {
    console.error(`deleteCourse API 에러 (ID: ${courseId}):`, error);
    throw error;
  }
};
