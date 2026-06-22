"use client";

import { useEffect, useState } from "react";
import { getCourseCategories } from "@/features/course/actions";
import type { CourseCategory } from "../types";

interface Options {
  selectFirstAsDefault?: boolean;
}

export function useCourseCategories({ selectFirstAsDefault }: Options = {}) {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [defaultId, setDefaultId] = useState<string>("");

  useEffect(() => {
    getCourseCategories()
      .then((arr) => {
        setCategories(arr);
        if (selectFirstAsDefault && arr.length) {
          setDefaultId(String(arr[0].courseCategoryId));
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, [selectFirstAsDefault]);

  return { categories, defaultId };
}
