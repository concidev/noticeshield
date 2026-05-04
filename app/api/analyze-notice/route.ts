import { NextRequest, NextResponse } from "next/server";
import { analyzeNotice } from "@/lib/analyzer";
import type { AnalyzeRequest } from "@/lib/types";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 10_000;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json() as Partial<AnalyzeRequest>;

  const noticeText = (body.noticeText ?? "").trim();
  const targetLanguage = body.targetLanguage ?? "en";
  const location = body.location;
  const imageBase64 = body.imageBase64;
  const imageMimeType = body.imageMimeType;

  if (!noticeText && !imageBase64) {
    return NextResponse.json({ success: false, error: "Please provide notice text or an image." }, { status: 400 });
  }

  if (noticeText.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ success: false, error: "Notice text is too long. Please trim it to under 10,000 characters." }, { status: 400 });
  }

  if (imageBase64) {
    const imageSizeBytes = Math.ceil((imageBase64.length * 3) / 4);
    if (imageSizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "Image file is too large. Maximum size is 5MB." }, { status: 400 });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      try {
        const analysis = await analyzeNotice(
          { noticeText, targetLanguage, location, imageBase64, imageMimeType },
          (text: string) => send({ type: "token", text }),
        );
        send({ type: "result", analysis });
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Analysis failed." });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
