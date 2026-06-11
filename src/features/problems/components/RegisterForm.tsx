"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";

import { DIFFICULTY_MAP } from "../actions";
const registerFormClasses = {
  sectionBox:
    "mb-[25px] rounded-base border border-border-light bg-bg-box p-[25px]",
  row: "flex gap-5 max-md:flex-col max-md:gap-0",
  inputGroup:
    "mb-5 flex flex-1 flex-col [&_label]:mb-2.5 [&_label]:text-body [&_label]:font-semibold [&_label]:text-text-primary [&_input]:rounded-base [&_input]:border [&_input]:border-border-light [&_input]:p-3 [&_input]:text-body [&_input]:text-text-primary [&_input]:placeholder:text-text-placeholder [&_textarea]:rounded-base [&_textarea]:border [&_textarea]:border-border-light [&_textarea]:p-3 [&_textarea]:text-body [&_textarea]:text-text-primary [&_textarea]:placeholder:text-text-placeholder [&_textarea]:min-h-[120px] [&_textarea]:resize-y [&_select]:h-[46px] [&_select]:appearance-none [&_select]:rounded-base [&_select]:border [&_select]:border-border-light [&_select]:bg-bg-box [&_select]:p-3 [&_select]:text-body [&_select]:text-text-primary",
  fileRow: "flex items-center gap-2.5 max-md:flex-col max-md:items-stretch",
  fileUploadButton:
    "flex h-[42px] min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-base bg-bg-gray-box px-3 text-text-primary hover:bg-bg-gray-box-hover",
  problemHeader: "mb-[25px] flex items-center justify-between",
  subTitle: "m-0 text-title-md font-bold text-text-primary",
  testCaseGroup: "mt-2.5 flex flex-col gap-3.5",
  testCaseHeader:
    "flex items-center justify-between gap-3 max-md:flex-col max-md:items-stretch",
  testCaseTitle: "m-0 text-title-md font-bold text-text-primary",
  testCaseSubTitle: "m-0 text-body font-bold text-text-primary",
  testCaseBox: "rounded-base border border-border-light bg-bg-box p-4",
  checkboxGroup:
    "mt-[30px] flex min-h-[46px] items-center gap-2 text-body font-semibold text-text-primary [&_input]:h-[18px] [&_input]:w-[18px] max-md:mt-0",
  removeButton:
    "h-[42px] min-w-14 cursor-pointer rounded-base border border-button-red-bg bg-bg-box text-description font-semibold text-text-red hover:not-disabled:bg-button-red-bg hover:not-disabled:text-text-white disabled:cursor-not-allowed disabled:opacity-50 max-md:w-full",
  centerButtonWrap: "mb-[30px] flex justify-center",
  addButton:
    "cursor-pointer rounded-base border border-border-light bg-bg-gray-box px-[18px] py-2.5 text-[15px] font-semibold text-text-primary hover:bg-bg-gray-box-hover",
  addSmallButton:
    "cursor-pointer rounded-base border border-button-blue-bg bg-bg-box px-3 py-2 text-description font-semibold text-text-blue hover:bg-button-blue-bg hover:text-text-white",
} as const;

import type {
  ProblemCategory,
  ProblemDatasetFile,
  ProblemInfo,
  SubProblem,
} from "../types";

interface RegisterFormProps {
  file: ProblemDatasetFile | null;
  categories: ProblemCategory[];
  problemInfo: ProblemInfo;
  problems: SubProblem[];
  onAddProblem: () => void;
  onAddTestCase: (problemIndex: number) => void;
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
  onRemoveTestCase: (problemIndex: number, testCaseIndex: number) => void;
  onTestCaseChange: (
    problemIndex: number,
    testCaseIndex: number,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export default function RegisterForm({
  file,
  categories,
  problemInfo,
  problems,
  onAddProblem,
  onAddTestCase,
  onFileChange,
  onProblemChange,
  onProblemInfoChange,
  onRemoveFile,
  onRemoveProblem,
  onRemoveTestCase,
  onTestCaseChange,
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
      <section className={registerFormClasses.sectionBox}>
        <div className={registerFormClasses.row}>
          <div className={registerFormClasses.inputGroup}>
            <label htmlFor="title">문제명 *</label>
            <input
              id="title"
              name="title"
              onChange={onProblemInfoChange}
              value={problemInfo.title}
            />
          </div>

          <div className={registerFormClasses.inputGroup}>
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

          <div className={registerFormClasses.inputGroup}>
            <label htmlFor="categoryId">카테고리 *</label>
            <select
              id="categoryId"
              name="categoryId"
              onChange={onProblemInfoChange}
              value={problemInfo.categoryId}
            >
              <option disabled value="">
                카테고리 선택
              </option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={registerFormClasses.inputGroup}>
          <label htmlFor="description">문제 설명 *</label>
          <input
            id="description"
            name="description"
            onChange={onProblemInfoChange}
            value={problemInfo.description}
          />
        </div>

        <div className={registerFormClasses.inputGroup}>
          <label htmlFor="datasetFile">데이터 파일 *</label>
          <div className={registerFormClasses.fileRow}>
            <label
              className={registerFormClasses.fileUploadButton}
              htmlFor="datasetFile"
            >
              {file?.name || "파일 선택"}
            </label>
            <input
              ref={fileInputRef}
              accept=".csv,text/csv"
              hidden
              id="datasetFile"
              onChange={(event) =>
                onFileChange(event.target.files?.[0] ?? null)
              }
              type="file"
            />
            <button
              className={registerFormClasses.removeButton}
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
        <section className={registerFormClasses.sectionBox} key={index}>
          <div className={registerFormClasses.problemHeader}>
            <h3 className={registerFormClasses.subTitle}>소문제 {index + 1}</h3>
            <button
              className={registerFormClasses.removeButton}
              disabled={problems.length === 1}
              onClick={() => onRemoveProblem(index)}
              type="button"
            >
              삭제
            </button>
          </div>

          <div className={registerFormClasses.row}>
            <div className={registerFormClasses.inputGroup}>
              <label htmlFor={`questionTitle-${index}`}>문제 제목 *</label>
              <input
                id={`questionTitle-${index}`}
                name="questionTitle"
                onChange={(event) => onProblemChange(index, event)}
                type="text"
                value={problem.questionTitle}
              />
            </div>

            <div className={registerFormClasses.inputGroup}>
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

          <div className={registerFormClasses.inputGroup}>
            <label htmlFor={`context-${index}`}>문제 내용 *</label>
            <textarea
              id={`context-${index}`}
              name="context"
              onChange={(event) => onProblemChange(index, event)}
              value={problem.context}
            />
          </div>

          <div className={registerFormClasses.inputGroup}>
            <label htmlFor={`hint-${index}`}>문제 힌트 *</label>
            <input
              id={`hint-${index}`}
              name="hint"
              onChange={(event) => onProblemChange(index, event)}
              type="text"
              value={problem.hint}
            />
          </div>

          <div className={registerFormClasses.inputGroup}>
            <label htmlFor={`solution-${index}`}>문제 해설 *</label>
            <textarea
              id={`solution-${index}`}
              name="solution"
              onChange={(event) => onProblemChange(index, event)}
              value={problem.solution}
            />
          </div>

          <div className={registerFormClasses.testCaseGroup}>
            <div className={registerFormClasses.testCaseHeader}>
              <h4 className={registerFormClasses.testCaseTitle}>
                테스트 케이스
              </h4>
              <button
                className={registerFormClasses.addSmallButton}
                onClick={() => onAddTestCase(index)}
                type="button"
              >
                + 케이스 추가
              </button>
            </div>

            {problem.testCases.map((testCase, testCaseIndex) => (
              <div
                className={registerFormClasses.testCaseBox}
                key={testCaseIndex}
              >
                <div className={registerFormClasses.problemHeader}>
                  <h5 className={registerFormClasses.testCaseSubTitle}>
                    케이스 {testCaseIndex + 1}
                  </h5>
                  <button
                    className={registerFormClasses.removeButton}
                    disabled={problem.testCases.length === 1}
                    onClick={() => onRemoveTestCase(index, testCaseIndex)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>

                <div className={registerFormClasses.inputGroup}>
                  <label htmlFor={`testCode-${index}-${testCaseIndex}`}>
                    테스트 코드 *
                  </label>
                  <textarea
                    id={`testCode-${index}-${testCaseIndex}`}
                    name="testCode"
                    onChange={(event) =>
                      onTestCaseChange(index, testCaseIndex, event)
                    }
                    value={testCase.testCode}
                  />
                </div>

                <div className={registerFormClasses.row}>
                  <div className={registerFormClasses.inputGroup}>
                    <label htmlFor={`timeoutMs-${index}-${testCaseIndex}`}>
                      제한 시간(초) *
                    </label>
                    <input
                      id={`timeoutMs-${index}-${testCaseIndex}`}
                      min={1}
                      name="timeoutMs"
                      onChange={(event) =>
                        onTestCaseChange(index, testCaseIndex, event)
                      }
                      type="number"
                      value={testCase.timeoutMs}
                    />
                  </div>

                  <label className={registerFormClasses.checkboxGroup}>
                    <input
                      checked={testCase.isHidden}
                      name="isHidden"
                      onChange={(event) =>
                        onTestCaseChange(index, testCaseIndex, event)
                      }
                      type="checkbox"
                    />
                    케이스 숨김
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className={registerFormClasses.centerButtonWrap}>
        <button
          className={registerFormClasses.addButton}
          onClick={onAddProblem}
          type="button"
        >
          + 소문제 추가
        </button>
      </div>
    </>
  );
}
