"use client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { AlbumsResponse } from "@/music/_/types";

import { AlbumCard } from "../AlbumCard";
import { CreateAlbumModal } from "./CreateAlbumModal";
import styles from "./styles.module.scss";

const fetchAllAlbums = async (session: Session) => {
  const url = `${process.env.CLIENT_URL}/api/albums/get-all`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session }),
  });

  return response.json();
};

export function AlbumList() {
  const { data: session } = useSession();

  const { data, isLoading, error } = useSWR<AlbumsResponse>(`/api/albums/get-all`, fetchAllAlbums, {
    revalidateOnFocus: false,
  });
  if (!session) redirect("/signin");

  const payload = data?.albums;

  return (
    <div className={styles.AlbumList}>
      <CreateAlbumModal />
      {payload?.map(({ id, gradient, title, description }) => (
        <Link key={id} href={`/albums/${id}`} style={{ textDecoration: "none" }}>
          <AlbumCard key={id} gradient={gradient} title={title} description={description} />
        </Link>
      ))}
    </div>
  );
}
