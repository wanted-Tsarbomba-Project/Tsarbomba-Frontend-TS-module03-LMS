"use client";

import { useRef, useState } from "react";
import type { LectureItem } from "../types";

export function useLectureDnd(
  lectures: LectureItem[],
  setLectures: (next: LectureItem[]) => void,
) {
  const dragFromRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const onDragStart = (index: number) => {
    dragFromRef.current = index;
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
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

  const onDragEnd = () => {
    dragFromRef.current = null;
    setDragOverIdx(null);
  };

  return { dragOverIdx, onDragStart, onDragOver, onDrop, onDragEnd };
}
