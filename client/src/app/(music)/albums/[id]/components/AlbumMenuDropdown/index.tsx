"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

import { MenuDropdown } from "@/app/_/components";
import { handleFetch } from "@/app/_/utils/functions";
import { useAlbums } from "@/app/(music)/_/hooks";

import { EditAlbumModal } from "./EditAlbumModal";
import styles from "./styles.module.scss";

export function AlbumMenuDropdown({ albumId }: { albumId: string | undefined }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const deleteProgressRef = useRef<HTMLLIElement | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const deleteIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { albumsMutate } = useAlbums();

  const handleDeleteAlbum = async () => {
    const response = await handleFetch("/api/albums/delete", "POST", {
      id: albumId,
      session,
    });

    if (response) {
      albumsMutate();
      router.push("/albums");
    }
  };

  const deletingProgress = () => {
    if (isDeletingAlbum) return;

    setDeleteProgress(0);
    setIsDeletingAlbum(true);

    deleteIntervalRef.current = setInterval(() => {
      setDeleteProgress((prevProgress) => {
        if (prevProgress >= 100) {
          if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
          handleDeleteAlbum();
          return prevProgress;
        }
        return prevProgress + 1;
      });
    }, 10);
  };

  const handleMouseUp = () => {
    if (deleteIntervalRef.current) {
      setIsDeletingAlbum(false);
      clearInterval(deleteIntervalRef.current);
      setDeleteProgress(0);
    }
  };

  const handleEditAlbum = () => {
    setModalVisible(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.albumsMenuDropdownContainer}>
      <MenuDropdown
        props={
          <ul className={styles.albumsMusicListMenuProps}>
            <li onClick={handleEditAlbum}>edit album</li>
            <li
              ref={deleteProgressRef}
              data-delete
              onMouseDown={deletingProgress}
              onMouseLeave={handleMouseUp}
              onMouseUp={handleMouseUp}
            >
              x album (hold)
              {isDeletingAlbum && (
                <div
                  style={{ height: "2px", width: `${deleteProgress}%`, background: "#faa0a0" }}
                ></div>
              )}
            </li>
          </ul>
        }
        Icon={<div className={styles.menuBadge}></div>}
        isOpen={isDropdownOpen}
        setIsOpen={() => setIsDropdownOpen(!isDropdownOpen)}
      />
      <div style={{ display: modalVisible ? "block" : "none" }}>
        <EditAlbumModal
          albumId={albumId}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </div>
    </div>
  );
}
