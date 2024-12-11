"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { attachUUIDToSongs } from "@/app/(music)/_/utils/functions";
import { Categories } from "@/charts/_/components/Categories";
import { useCharts } from "@/charts/_/hooks";
import { PageTitle } from "@/music/_/components";
import { ChartSongs } from "@/music/_/types";

import { CategoryButton } from "../../components/CategoryButton";
import { ChartList } from "../../components/ChartList";
import styles from "./styles.module.scss";

export function MainChartsContainer() {
  const { charts, chartsIsLoading } = useCharts();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  const chartData = useMemo(() => {
    if (!charts?.data) return {};
    const updatedChart = {} as { [key: string]: ChartSongs[] };
    for (const key in charts.data) {
      updatedChart[key] = attachUUIDToSongs(charts.data[key]);
    }
    return updatedChart;
  }, [charts]);

  const firstChart = Object.keys(chartData)[0] || "";

  useEffect(() => {
    const cachedCategory = localStorage.getItem("selectedCategory");
    setSelectedCategory(cachedCategory || firstChart);
  }, [firstChart]);

  const payload = useMemo(
    () => ({
      songs: chartData[selectedCategory] as ChartSongs[],
      message: selectedCategory,
      type: "chart",
      id: selectedCategory,
    }),
    [chartData, selectedCategory],
  );

  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  return (
    <div className={styles.chartsMainContainer}>
      <div className={styles.text}>
        <PageTitle title={"Top Charts"}>
          <CategoryButton
            selectedCategory={selectedCategory}
            showDropdown={showDropdown}
            toggleDropdown={toggleDropdown}
          />
        </PageTitle>
      </div>

      <div
        className={
          showDropdown ? styles.chartsCategoriesContainerOpen : styles.chartsCategoriesContainer
        }
      >
        <Categories data={chartData} setSelectedCategory={setSelectedCategory} />
      </div>

      <ChartList payload={payload} chartsIsLoading={chartsIsLoading} />
    </div>
  );
}
