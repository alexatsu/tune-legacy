import { Session } from "next-auth";
import { FormEvent, useRef } from "react";

import { customRevalidatePath, handleFetch } from "@/app/_/utils/functions";

export function useEditAlbum(session: Session | null, albumId: string | undefined) {
  const title = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLInputElement>(null);

  const editAlbum = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const titleValue = title.current?.value || "";
    const descriptionValue = description.current?.value || "";

    if (titleValue && descriptionValue) {
      await handleFetch("/api/albums/edit", "PUT", {
        session,
        id: albumId,
        title: titleValue,
        description: descriptionValue,
      });

      customRevalidatePath(`/albums/${albumId}`);
    }
  };

  return { editAlbum, title, description };
}
