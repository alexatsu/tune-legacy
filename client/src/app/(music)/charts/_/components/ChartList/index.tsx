import { useSession } from "next-auth/react";
import { memo } from "react";

import { MusicList, Skeleton } from "@/app/(music)/_/components";
import { ChartSongs } from "@/app/(music)/_/types";

import styles from "./styles.module.scss";

export const ChartList = memo(function ChartList({
  payload,
  chartsIsLoading,
}: {
  payload: {
    songs: ChartSongs[];
    message: string;
    type: string;
    id: string;
  };
  chartsIsLoading: boolean;
}) {
  const { data: session } = useSession();
  const chartList = chartsIsLoading ? (
    <div className={styles.chartsListSkeletonContainer}>
      <Skeleton className={styles.chartsListSkeleton} amount={5} />
    </div>
  ) : (
    <MusicList data={payload} session={session!} />
  );
  return chartList;
});
