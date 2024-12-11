import { Session } from "next-auth";
import useSWR from "swr";

import { SongsResponse } from "@/music/_/types";

export const useSongsKey = `/api/songs/get-all`;

function useSongs(session: Session | null, search?: string) {
  const fetcherKey = search ? `${useSongsKey}?search=${search}` : useSongsKey;

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });

    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<SongsResponse>(fetcherKey, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const songs = data?.songs;

  return {
    error,
    isLoading,
    songs,
    songsMutate: mutate,
    data,
  };
}

export { useSongs };
