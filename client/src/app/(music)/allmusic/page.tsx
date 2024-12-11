"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { PageTitle } from "@/music/_/components";

import PageContainer from "../_/layouts/PageContainer";
import { MusicListWrapper } from "./components/MusicListWrapper";
import { SearchMusic } from "./components/SearchMusic";

export default function Page() {
  const { data: session } = useSession();

  if (!session) redirect("/signin");

  return (
    <PageContainer>
      <PageTitle title={"Music"} />
      <SearchMusic />
      <MusicListWrapper />
    </PageContainer>
  );
}
