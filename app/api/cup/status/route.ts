// app/api/cup/status/route.ts

import { NextResponse } from "next/server"
import { generateFullCup } from "@/lib/cup"
import { generateMockCup } from "@/lib/cup-preview"

export async function GET() {
  const preview = process.env.FPL_CUP_PREVIEW === "true"

  const cup = preview
    ? generateMockCup()
    : await generateFullCup()

  return NextResponse.json({
    groupComplete: cup.groupComplete,
  })
}