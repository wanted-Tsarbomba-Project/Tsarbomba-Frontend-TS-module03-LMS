"use client";

import Image from "next/image";
import { ChangeEvent, KeyboardEvent, useState } from "react";

interface SearchbarProps {
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (keyword: string) => void;
  className?: string;
}

const searchClasses = {
  searchBar:
    "relative box-border flex h-[clamp(40px,3.7vh,56px)] w-[clamp(320px,35vw,672px)] items-center rounded-[clamp(6px,0.4vw,8px)] border border-border-light bg-bg-box py-[clamp(6px,0.7vh,8px)] pr-[clamp(32px,2vw,40px)] pl-[clamp(12px,0.8vw,16px)]",
  searchButton:
    "absolute right-[clamp(12px,0.8vw,16px)] flex cursor-pointer items-center justify-center border-0 bg-transparent p-0",
  searchInput:
    "w-full border-0 bg-transparent text-[clamp(14px,0.85vw,16px)] font-normal text-text-primary outline-none placeholder:text-text-placeholder",
};

export default function Searchbar({
  defaultValue = "",
  value,
  placeholder = "검색어를 입력하세요.",
  onChange,
  onSearch,
  className,
}: SearchbarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const keyword = value ?? internalValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleSearch = () => {
    const trimmed = keyword.trim();

    if (!trimmed) return;

    onSearch?.(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={[searchClasses.searchBar, className].filter(Boolean).join(" ")}
    >
      <button
        aria-label="검색"
        className={searchClasses.searchButton}
        onClick={handleSearch}
        type="button"
      >
        <Image alt="" height={16} src="/assets/img/searchIcon.svg" width={16} />
      </button>

      <input
        className={searchClasses.searchInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={keyword}
      />
    </div>
  );
}
