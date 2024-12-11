import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession, Session } from "next-auth";

import { authOptions } from "@/app/_/utils/functions";
import { db } from "@/app/api/_/services";
import { MusicList } from "@/music/_/components";
import { AlbumSongs } from "@/music/_/types";
import { attachUUIDToSongs } from "@/music/_/utils/functions";

import { AlbumMenuDropdown } from "./components";
import styles from "./styles.module.scss";

const fetchAlbumById = async (session: Session, title: string) => {
  const data = await db.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: {
      Albums: {
        where: {
          title,
        },
        include: {
          albumSongs: true,
        },
      },
    },
  });

  const albumSongs = attachUUIDToSongs(data?.Albums[0].albumSongs as AlbumSongs[]);

  const musicList = {
    songs: albumSongs as AlbumSongs[],
    message: `success, title is ${title}`,
    type: "album",
    id: data?.Albums[0].id || "",
  };

  await db.$disconnect();

  return { data, musicList };
};

export default async function Page({ params }: { params: { title: string } }) {
  const session = await getServerSession(authOptions);
  const { title } = params;
  if (!session) redirect("/signin");
  const { data, musicList } = await fetchAlbumById(session, title);
  const { id, title: albumTitle, description, albumSongs } = data?.Albums[0] || {};

  return (
    <div className={styles.albumIdPageContainer}>
      <div className={styles.AlbumHead}>
        <div className={styles.Cover} style={{ background: data?.Albums[0].gradient }}></div>

        <div className={styles.Content}>
          <h1 className={styles.Title}>{albumTitle}</h1>
          <span className={styles.Description}>{description}</span>
        </div>

        <AlbumMenuDropdown albumId={id} />
      </div>

      {albumSongs && albumSongs.length < 1 ? (
        <div className={styles.noSongsWereAdded}>
          No songs were added. Look for them in <Link href={"/allmusic"}>Music</Link>
        </div>
      ) : (
        <div className={styles.AlbumList}>
          <MusicList data={musicList} session={session} albumId={id} />
        </div>
      )}
    </div>
  );
}
