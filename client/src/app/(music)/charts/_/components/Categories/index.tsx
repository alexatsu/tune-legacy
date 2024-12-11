"use client";
import { Dispatch, memo, SetStateAction, useMemo, useState } from "react";

import { randomRGBPastelColor } from "@/app/_/utils/functions";
import { ChartsCategories } from "@/app/(music)/_/types";

import styles from "./styles.module.scss";

type CategoriesProps = {
  data: ChartsCategories;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
};

const Categories = memo(function Categories({ data, setSelectedCategory }: CategoriesProps) {
  const categoriesWithBorders = useMemo(() => {
    return Object.keys(data).map((chart) => {
      const [r, g, b] = randomRGBPastelColor();
      const categoryName = chart.split("-chart")[0];
      const border = `1px solid rgba(${r}, ${g}, ${b}, 0.7)`;
      return { category: categoryName, border };
    });
  }, [data]);

  const handleCategoryClick = (category: string) => {
    const selectedCategory = `${category}-chart`;
    setSelectedCategory(selectedCategory);
    localStorage.setItem("selectedCategory", selectedCategory);
  };

  return (
    <ul className={styles.categoriesList}>
      {categoriesWithBorders.map(({ category, border }) => (
        <li
          className={styles.categriesListItem}
          style={{ border }}
          key={category}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </li>
      ))}
    </ul>
  );
});

export { Categories };
