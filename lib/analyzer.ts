import type { AnalyzeRequest, NoticeAnalysis } from "./types";
import { mockAnalyze } from "./mockAnalyzer";
import { gemmaAnalyze } from "./gemma";
import { getCachedAnalysis } from "./sampleCache";

export type AnalyzerMode = "gemma" | "mock";

export function getAnalyzerMode(): AnalyzerMode {
  if (process.env.GEMMA_API_URL && process.env.GEMMA_API_KEY) return "gemma";
  return "mock";
}

export async function analyzeNotice(
  request: AnalyzeRequest,
  onToken?: (text: string) => void
): Promise<NoticeAnalysis> {
  if (request.noticeText && !request.imageBase64 && (!request.targetLanguage || request.targetLanguage === "en")) {
    const cached = getCachedAnalysis(request.noticeText, request.location);
    if (cached) return cached;
  }

  const mode = getAnalyzerMode();

  if (mode === "gemma") {
    return gemmaAnalyze(
      request.noticeText,
      request.targetLanguage,
      request.location,
      request.imageBase64,
      request.imageMimeType,
      onToken
    );
  }

  if (!request.noticeText && request.imageBase64) {
    const isPdf = request.imageMimeType === "application/pdf";
    throw new Error(
      isPdf
        ? "PDF analysis requires Gemma live mode. Please paste the notice text instead, or configure GEMMA_API_URL and GEMMA_API_KEY."
        : "Image analysis requires Gemma live mode. Please paste the notice text instead, or configure GEMMA_API_URL and GEMMA_API_KEY."
    );
  }

  return mockAnalyze(request.noticeText, request.targetLanguage, request.location);
}
