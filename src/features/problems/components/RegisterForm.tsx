"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";

import {
  DIFFICULTY_MAP,
  PROBLEM_CATEGORY,
} from "../actions";
import type { ProblemInfo, SubProblem } from "../types";

import styles from "./RegisterForm.module.css";

interface RegisterFormProps {
  file: File | null;
  problemInfo: ProblemInfo;
  problems: SubProblem[];
  onAddProblem: () => void;
  onFileChange: (file: File | null) => void;
  onProblemChange: (
    index: number,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onProblemInfoChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onRemoveFile: () => void;
  onRemoveProblem: (index: number) => void;
}

export default function RegisterForm({
  file,
  problemInfo,
  problems,
  onAddProblem,
  onFileChange,
  onProblemChange,
  onProblemInfoChange,
  onRemoveFile,
  onRemoveProblem,
}: RegisterFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onRemoveFile();
  };

  return (
    <>
      <section className={styles.sectionBox}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">문제명 *</label>
            <input
              id="title"
              name="title"
              onChange={onProblemInfoChange}
              value={problemInfo.title}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="difficulty">난이도 *</label>
            <select
              id="difficulty"
              name="difficulty"
              onChange={onProblemInfoChange}
              value={problemInfo.difficulty}
            >
              {Object.entries(DIFFICULTY_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="categoryId">카테고리 *</label>
            <select
              id="categoryId"
              name="categoryId"
              onChange={onProblemInfoChange}
              value={problemInfo.categoryId}
            >
              {Object.entries(PROBLEM_CATEGORY).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description">문제 설명 *</label>
          <input
            id="description"
            name="description"
            onChange={onProblemInfoChange}
            value={problemInfo.description}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="datasetFile">데이터 파일 *</label>
          <div className={styles.fileRow}>
            <label className={styles.fileUploadButton} htmlFor="datasetFile">
              {file?.name || "파일 선택"}
            </label>
            <input
              ref={fileInputRef}
              accept=".csv,text/csv"
              hidden
              id="datasetFile"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              type="file"
            />
            <button
              className={styles.removeButton}
              disabled={!file}
              onClick={handleRemoveFile}
              type="button"
            >
              삭제
            </button>
          </div>
        </div>
      </section>

      {problems.map((problem, index) => (
        <section className={styles.sectionBox} key={index}>
          <div className={styles.problemHeader}>
            <h3 className={styles.subTitle}>소문제 {index + 1}</h3>
            <button
              className={styles.removeButton}
              disabled={problems.length === 1}
              onClick={() => onRemoveProblem(index)}
              type="button"
            >
              삭제
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor={`questionTitle-${index}`}>문제 제목 *</label>
              <input
                id={`questionTitle-${index}`}
                name="questionTitle"
                onChange={(event) => onProblemChange(index, event)}
                type="text"
                value={problem.questionTitle}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor={`point-${index}`}>포인트 *</label>
              <input
                id={`point-${index}`}
                min={1}
                name="point"
                onChange={(event) => onProblemChange(index, event)}
                type="number"
                value={problem.point}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor={`context-${index}`}>문제 내용 *</label>
            <textarea
              id={`context-${index}`}
              name="context"
              onChange={(event) => onProblemChange(index, event)}
              value={problem.context}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor={`answer-${index}`}>문제 정답 *</label>
            <input
              id={`answer-${index}`}
              name="answer"
              onChange={(event) => onProblemChange(index, event)}
              type="text"
              value={problem.answer}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor={`hint-${index}`}>문제 힌트 *</label>
            <input
              id={`hint-${index}`}
              name="hint"
              onChange={(event) => onProblemChange(index, event)}
              type="text"
              value={problem.hint}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor={`solution-${index}`}>문제 해설 *</label>
            <textarea
              id={`solution-${index}`}
              name="solution"
              onChange={(event) => onProblemChange(index, event)}
              value={problem.solution}
            />
          </div>
        </section>
      ))}

      <div className={styles.centerButtonWrap}>
        <button className={styles.addButton} onClick={onAddProblem} type="button">
          + 추가
        </button>
      </div>
    </>
  );
}
