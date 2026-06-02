const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Course {
  courseId: number;
  instructorId: number;
  courseCategoryId: number;
  courseCategoryName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: "ACTIVE" | "DRAFT" | "DELETED";
}

export const getUserCourses = async (): Promise<Course[]> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    const userRole =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    const requestUrl = `${BASE_URL}/api/v1/courses`;

    const response = await fetch(requestUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "강좌 목록을 불러오지 못했습니다.");
    }

    const result = await response.json();
    return result?.data || [];
  } catch (error) {
    console.error("getUserCourses API 에러:", error);
    throw error;
  }
};

export const updateCourseStatus = async (
  courseId: number | string,
  status: "ACTIVE" | "DRAFT" | "DELETED",
): Promise<any> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    const userRole =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    if (userRole !== "OPERATOR") {
      throw new Error(
        "권한이 없습니다. 오퍼레이터 계정만 상태 변경이 가능합니다.",
      );
    }

    const response = await fetch(`${BASE_URL}/api/v1/courses/${courseId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status }),
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
