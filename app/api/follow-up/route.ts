import { NextRequest } from "next/server";
import { gemmaFollowUp } from "@/lib/gemma";
import type { NoticeAnalysis } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  let body: { analysis?: NoticeAnalysis; question?: string };
  try {
    body = await req.json() as { analysis?: NoticeAnalysis; question?: string };
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid request body." }), { status: 400 });
  }

  if (!body.analysis || !body.question?.trim()) {
    return new Response(JSON.stringify({ success: false, error: "Missing analysis or question." }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        const answer = await gemmaFollowUp(
          body.analysis!,
          body.question!,
          (text: string) => send({ type: "token", text }),
        );
        send({ type: "result", answer });
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Follow-up failed." });
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
