import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

import { db } from "@/api/_/services";

export async function POST(req: NextRequest) {
  const { session }: { session: Session } = await req.json();
  const search = req.nextUrl.searchParams.get("search") || "";
  console.log(search, "youo");
  if (!session) {
    return NextResponse.json({ user: null, message: "Session is required" }, { status: 404 });
  }

  const userEmail = session.user?.email || "";

  if (!userEmail) {
    return NextResponse.json({ songs: [], message: "Email is required" }, { status: 400 });
  }

  const userSongs = await db.song.findMany({
    where: {
      User: {
        email: userEmail,
      },
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
  });

  await db.$disconnect();

  return NextResponse.json(
    { songs: userSongs, message: "Songs fetched successfully", type: "allMusic" },
    { status: 200 },
  );
}
