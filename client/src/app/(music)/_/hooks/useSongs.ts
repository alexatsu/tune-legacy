import { Session } from "next-auth";
import useSWR from "swr";

import { SongsResponse } from "@/music/_/types";

export const useSongsKey = `/api/songs/get-all`;

function useSongs(session: Session | null, search?: string) {
  const params = search ? `?search=${search}` : "";

  const fetcher = async (url: string, params?: string) => {
    const response = await fetch(url + params, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });

    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<SongsResponse>(
    [useSongsKey, params],
    ([url, params]: [string, string | undefined]) => fetcher(url, params),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

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
