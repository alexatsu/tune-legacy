"use client";

import { useSession } from "next-auth/react";

import { useEditAlbum } from "../../../hooks";
import styles from "./styles.module.scss";

type EditAlbumModalProps = {
  albumId: string | undefined;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditAlbumModal({ albumId, modalVisible, setModalVisible }: EditAlbumModalProps) {
  const { data: session } = useSession();

  const { title, description, editAlbum } = useEditAlbum(session, albumId);

  const modalClasses: string[] = [styles.Modal];

  if (modalVisible) {
    modalClasses.push(styles.active);
  }

  return (
    <div className={modalClasses.join(" ")} onClick={() => setModalVisible(false)}>
      <form
        className={styles.Content}
        onClick={(event: React.MouseEvent<HTMLFormElement>) => event.stopPropagation()}
      >
        <input
          type="text"
          id="title"
          ref={title}
          className={styles.input}
          required
          placeholder="Title"
        />
        <input
          type="text"
          id="description"
          ref={description}
          className={styles.input}
          required
          placeholder="Description"
        />
        <button
          type="submit"
          className={styles.submitButton}
          onClick={async (e) => {
            await editAlbum(e);
            setModalVisible(false);
          }}
        >
          Click
        </button>
      </form>
    </div>
  );
}
