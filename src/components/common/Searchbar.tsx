"use client";

import Image from "next/image";
import { ChangeEvent, KeyboardEvent, useState } from "react";

import styles from "./Searchbar.module.css";

interface SearchbarProps {
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (keyword: string) => void;
  className?: string;
}

export default function Searchbar({
  defaultValue = "",
  value,
  placeholder = "검색어를 입력해주세요.",
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
    <div className={[styles.searchBar, className].filter(Boolean).join(" ")}>
      <button
        aria-label="검색"
        className={styles.searchButton}
        onClick={handleSearch}
        type="button"
      >
        <Image
          alt=""
          height={16}
          src="/assets/img/searchIcon.svg"
          width={16}
        />
      </button>

      <input
        className={styles.searchInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={keyword}
      />
    </div>
  );
}
