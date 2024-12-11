import Link from "next/link";
import { useSession } from "next-auth/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMusicSearchStore } from "@/app/_/store/useMusicSearchStore";
import { useSongs } from "@/app/(music)/_/hooks";
import { MusicList, Skeleton } from "@/music/_/components";
import { attachUUIDToSongs } from "@/music/_/utils/functions";

import styles from "./styles.module.scss";

export const MusicListWrapper = memo(function MusicListWrapper() {
  const { data: session } = useSession();
  const { search } = useMusicSearchStore(useShallow((state) => ({ search: state.search })));
  const { songs, isLoading } = useSongs(session, search);
  const songsWithUUID = attachUUIDToSongs(songs || []);
  const payload = { songs: songsWithUUID || [], message: "success", type: "allmusic" };

  if (isLoading) {
    return (
      <div className={styles.musicListSkeletonContainer}>
        <Skeleton className={styles.musicListSkeleton} />
      </div>
    );
  } else if (!songsWithUUID.length && search === "") {
    return (
      <div className={styles.errorMessageContainer}>
        <p>No songs were added. Look for them in</p> <Link href={"/search"}>Search</Link>
      </div>
    );
  } else {
    return <MusicList data={payload} session={session!} />;
  }
});
