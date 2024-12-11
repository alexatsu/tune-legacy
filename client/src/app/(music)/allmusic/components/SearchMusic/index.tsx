"use client";

import { memo, useEffect, useState } from "react";

import { useMusicSearchStore } from "@/app/_/store/useMusicSearchStore";

import styles from "./styles.module.scss";

export const SearchMusic = memo(function SearchMusic() {
  const { setSearch } = useMusicSearchStore();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, setSearch]);

  return (
    <input
      type="text"
      placeholder="Search"
      className={styles.input}
      value={inputValue}
      onChange={(e) => {
        e.preventDefault();
        setInputValue(e.target.value);
      }}
    />
  );
});
