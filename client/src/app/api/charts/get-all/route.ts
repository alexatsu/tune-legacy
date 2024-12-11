import { NextResponse } from "next/server";

import { ChartsResponse } from "@/app/(music)/_/types";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("called," + process.env.PARSER_SERVICE_CONTAINER);
  const response = await fetch(`${process.env.PARSER_SERVICE_CONTAINER}/charts/get-all`, {
    headers: { "Content-Type": "application/json" },
  });

  const { data } = (await response.json()) as ChartsResponse;
  return NextResponse.json({ message: "success", data }, { status: 200 });
}
