"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { useShallow } from "zustand/react/shallow";

import { MenuDropdown } from "@/app/_/components/MenuDropdown";
import { usePlayerContext } from "@/app/_/providers";
import { useStreamStore } from "@/app/_/store";
import { handleFetch } from "@/app/_/utils/functions";
import { playerIcons } from "@/music/_/components/icons/player";
import { useAlbums, useSongs } from "@/music/_/hooks";
import { Album, AlbumSongs, ChartSongs, Song, SongsResponse } from "@/music/_/types";

import { attachUUIDToSongs } from "../../utils/functions";
import { miscIcons } from "../icons/misc";
import styles from "./styles.module.scss";

const { Play, Pause, ThreeDots, Add } = playerIcons;
const { LoadingCircle } = miscIcons;

const formatedDuration = (duration: string) => {
  const [hours, minutes, seconds] = duration.split(":");
  return (
    <span>
      {+hours < 1 ? "" : hours + ":"}
      {minutes && minutes + ":"}
      {+seconds < 10 ? "0" + seconds : seconds}
    </span>
  );
};

type MusicList = {
  data: {
    songs: Song[] | AlbumSongs[] | ChartSongs[];
    message: string;

    type: string | undefined;
    id?: string | undefined;
  };
  session: Session;
  albumId?: string;
};

export function MusicList({ data, session, albumId }: MusicList) {
  const { mutate } = useSWRConfig();
  const pathname = usePathname();
  const { currentSongOrStreamRef, playerRef, currentPayload, playerUrl } = usePlayerContext();
  const { data: userSongs, songsMutate } = useSongs(session);

  const [isAddingSong, setIsAddingSong] = useState(false);
  const currentAddedSongRef = useRef("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [isSongInTheAlbumAccordionOpen, setIsSongInTheAlbumAccordionOpen] = useState(false);

  const { albums, albumsMutate, albumsIsLoading } = useAlbums();
  const [currentScrollableAlbumId, setCurrentScrollableAlbumId] = useState<string | null>(null);
  const addToAlbumContainerRef = useRef<HTMLDivElement>(null);
  const {
    currentId,
    setCurrentId,
    isStreaming: isPlaying,
    setIsStreaming,
    handlePause,
    setSeek,
    isStartingPlaying,
    setIsStartingPlaying,
  } = useStreamStore(
    useShallow((state) => ({
      currentId: state.currentId,
      setCurrentId: state.setCurrentId,
      isStreaming: state.isStreaming,
      setIsStreaming: state.setIsStreaming,
      handlePause: state.handlePause,
      volume: state.volume,
      setSeek: state.setSeek,
      isStartingPlaying: state.isStartingPlaying,
      setIsStartingPlaying: state.setIsStartingPlaying,
    })),
  );

  const updateCurrentPayload = () => {
    if (!currentPayload.current || currentPayload.current.type !== data.type) {
      currentPayload.current = {
        songsOrStreams: data.songs,
        type: data.type,
        id: "",
      };
    }

    if (currentPayload.current.type === "album") {
      const albumSongs = currentPayload.current?.songsOrStreams[0] as AlbumSongs;
      const currentAlbumId = albumSongs.albumId;

      if (currentAlbumId !== albumId) {
        currentPayload.current = {
          songsOrStreams: data.songs,
          type: data.type,
          id: data.id,
        };
      }
    }

    if (currentPayload.current.type === "search") {
      currentPayload.current = {
        songsOrStreams: data.songs,
        type: data.type,
        id: "",
      };
    }
  };

  const updateCurrentSongOrStream = (urlId: string) => {
    const findSonginThePayload = currentPayload.current?.songsOrStreams.find(
      (song) => song.urlId === urlId,
    );
    currentSongOrStreamRef.current = findSonginThePayload as Song | AlbumSongs;
  };

  const sortPayloadByDateDescending = (payload: Song[] | AlbumSongs[]) => {
    return payload.sort((a, b) => {
      const aDate = a.addedAt ? new Date(a.addedAt) : new Date(0);
      const bDate = b.addedAt ? new Date(b.addedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  };
  const handlePlayById = (song: Song | AlbumSongs) => {
    const { urlId, url } = song;
    setIsStreaming(true);
    setCurrentId(urlId);

    updateCurrentPayload();

    if (currentId === urlId) {
      return;
    }

    if (playerRef.current) {
      setIsStartingPlaying(true);
      setSeek(0);
      playerUrl.current = url;
      currentSongOrStreamRef.current = song;
    }

    updateCurrentSongOrStream(urlId);
  };

  const renderPlayButton = (song: Song) => {
    const iscurrentTrackRef = song.urlId === currentId;

    const playButton = (
      <div className={styles.notPlaying} onClick={() => handlePlayById(song)}>
        <Play />
      </div>
    );
    const pauseButton = (
      <div className={styles.playing} onClick={() => handlePause()}>
        <Pause />
      </div>
    );

    if (iscurrentTrackRef && isStartingPlaying) {
      return <LoadingCircle />;
    }

    if (isPlaying && iscurrentTrackRef && currentPayload.current?.type === data.type) {
      return pauseButton;
    } else {
      return playButton;
    }
  };

  const addSongToMyMusic = async (song: Song) => {
    const { url, urlId, title, duration, cover } = song;
    setIsAddingSong(true);
    currentAddedSongRef.current = urlId;
    const body = { url, urlId, title, duration, cover, session };
    await handleFetch<{ message: string }>(`/api/songs/add`, "POST", body);

    currentAddedSongRef.current = "";

    songsMutate();
    setIsAddingSong(false);
  };

  const updateCurrentPayloadAfterAddingSong = async () => {
    const getAllSongs = await handleFetch<SongsResponse>(
      "/api/songs/get-all",
      "POST",
      { session },
      { "Content-Type": "application/json" },
    );
    const songsWithUUID = attachUUIDToSongs(getAllSongs.songs);
    const sortedPayload = sortPayloadByDateDescending(songsWithUUID);
    if (currentPayload.current?.type === "allmusic") {
      currentPayload.current = {
        songsOrStreams: sortedPayload,
        type: "allmusic",
        id: "",
      };
    }
    const currentSong = currentSongOrStreamRef.current;
    if (currentSong) {
      updateCurrentSongOrStream(currentSong.urlId);
    }
  };

  const renderAddButton = (song: Song & { isAdded?: boolean }) => {
    const ifIsSongID = song.urlId === currentAddedSongRef.current;
    const isSongInDB = userSongs?.songs.find((userSong) => userSong.urlId === song.urlId);

    if (isAddingSong && ifIsSongID) {
      return <LoadingCircle />;
    } else if (isSongInDB) {
      return <Add key={song.id} className={styles.added} />;
    } else {
      return (
        <Add
          key={song.id}
          onClick={async () => {
            await addSongToMyMusic(song);

            await updateCurrentPayloadAfterAddingSong();
            console.log(currentPayload.current, "here is the updated current payload");
          }}
        />
      );
    }
  };

  const deleteFromCurrentPayload = (songId: Song["id"]) => {
    const payload = currentPayload.current?.songsOrStreams as Song[];

    const filterOutSong = payload.filter((song) => song.id !== songId);

    currentPayload.current = {
      songsOrStreams: filterOutSong,
      type: currentPayload.current?.type,
      id: currentPayload.current?.id || "",
    };
  };

  const deleteFromMyMusic = async (songId: Song["id"]) => {
    await handleFetch<{ message: string }>(`/api/songs/delete`, "POST", {
      songId,
      session,
    });

    setOpenDropdownIndex(null);
    if (currentPayload.current) {
      deleteFromCurrentPayload(songId);
    }
    songsMutate();
  };

  const handleMusicListDropdownToggle = useCallback(
    (index: number) => {
      setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    },
    [openDropdownIndex],
  );

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (
        (event.target as HTMLElement).tagName === "LI" ||
        (event.target as HTMLElement).tagName === "SPAN"
      ) {
        return;
      } else {
        setOpenDropdownIndex(null);
        setIsSongInTheAlbumAccordionOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, [
    isSongInTheAlbumAccordionOpen,
    setIsSongInTheAlbumAccordionOpen,
    openDropdownIndex,
    handleMusicListDropdownToggle,
  ]);

  const handleSongInAlbumAccordion = (event: React.MouseEvent<HTMLLIElement>) => {
    event.stopPropagation();
    setIsSongInTheAlbumAccordionOpen(!isSongInTheAlbumAccordionOpen);
  };

  const checkIfSongInTheAlbum = (song: Song, album: Album) => {
    const findSongInAlbum = album.albumSongs.find((albumSong) => albumSong.urlId === song.urlId);
    if (findSongInAlbum) {
      return <p>&#10004;</p>;
    } else {
      return <p>+</p>;
    }
  };

  const addOrRemoveSongInTheAlbum = async (song: Song, album: Album) => {
    await handleFetch<{ message: string }>(`/api/albums/add-or-delete-song`, "POST", {
      session,
      album,
      song,
    });
    albumsMutate();
    setCurrentScrollableAlbumId(album.id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScrollableAlbumId) {
        const albumElement = document.querySelector(
          `li[data-album-id="${currentScrollableAlbumId}"]`,
        );
        albumElement?.scrollIntoView({ block: "center" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentScrollableAlbumId]);

  const dropdownMenuProps = (song: Song, pathname: string) => {
    const classAddToAlbumContainer = isSongInTheAlbumAccordionOpen
      ? styles.addToAlbumsContainerVisible
      : styles.addToAlbumsContainer;

    const checkIfAlbumId = pathname.split("/");
    const getAlbumById = (id: string) => albums?.albums.find((album) => album.id === id);
    const allowedPaths = ["/allmusic", "/charts"];

    const list = (className: string) => [
      {
        node: allowedPaths.includes(pathname) && (
          <>
            <li className={className} onClick={(e) => handleSongInAlbumAccordion(e)}>
              add to album
            </li>
            {isSongInTheAlbumAccordionOpen && (
              <div className={classAddToAlbumContainer} ref={addToAlbumContainerRef}>
                {albums?.albums.map((album) => (
                  <li
                    data-album-id={album.id}
                    className={styles.addToAlbums}
                    key={album.id}
                    onClick={() => addOrRemoveSongInTheAlbum(song, album)}
                  >
                    {albumsIsLoading ? <LoadingCircle /> : checkIfSongInTheAlbum(song, album)}
                    <span className={styles.addToAlbumsTitle}>{album.title}</span>
                  </li>
                ))}
              </div>
            )}
          </>
        ),
      },
      {
        node: (
          <Link href={song.url} target="_blank">
            <li className={className}>source video</li>
          </Link>
        ),
      },
      {
        node: pathname === "/allmusic" && (
          <li className={styles.deleteSong} onClick={() => deleteFromMyMusic(song.id)}>
            x from music
          </li>
        ),
      },
      ...(checkIfAlbumId.length > 2
        ? [
            {
              node: (
                <li
                  className={styles.deleteSong}
                  onClick={() => addOrRemoveSongInTheAlbum(song, getAlbumById(checkIfAlbumId[2])!)}
                >
                  x from album
                </li>
              ),
            },
          ]
        : []),
    ];

    const result = (
      <>
        {list(styles.musicListMenuProps).map(({ node }) => (
          <React.Fragment key={crypto.randomUUID()}>{node}</React.Fragment>
        ))}
      </>
    );

    return result;
  };

  const sortedSongs = sortPayloadByDateDescending(data?.songs || []);

  return (
    <ul className={styles.musicList}>
      {sortedSongs.map((song, index) => (
        <li
          className={styles.musicListItem}
          key={song.uuid}
          style={{ backgroundColor: currentId === song.urlId ? "var(--widget-bg-playing)" : "" }}
        >
          <div className={styles.leftSection}>
            <div className={styles.imageBlock}>
              {renderPlayButton(song)}
              <Image
                src={song.cover || ""}
                alt={song.title}
                width={40}
                height={40}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
            <span className={styles.title}>{song.title}</span>
          </div>

          <div className={styles.rightSection}>
            {formatedDuration(song.duration)}
            {pathname === "/search" && renderAddButton(song)}
            {pathname === "/charts" && renderAddButton(song)}
            <MenuDropdown
              props={dropdownMenuProps(song, pathname)}
              Icon={<ThreeDots className={styles.threeDotsMenu} />}
              isOpen={openDropdownIndex === index}
              setIsOpen={() => handleMusicListDropdownToggle(index)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
