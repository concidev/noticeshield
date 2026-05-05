import { NextRequest, NextResponse } from "next/server";
import { gemmaTranslateCached } from "@/lib/gemma";
import type { NoticeAnalysis } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { analysis?: NoticeAnalysis; targetLanguage?: string };
    if (!body.analysis || !body.targetLanguage) {
      return NextResponse.json({ success: false, error: "Missing analysis or targetLanguage." }, { status: 400 });
    }
    const translated = await gemmaTranslateCached(body.analysis, body.targetLanguage);
    return NextResponse.json({ success: true, analysis: translated });
  } catch {
    return NextResponse.json({
      success: false,
      error: "Translation is temporarily unavailable. Please try again in a moment.",
    }, { status: 500 });
  }
}
