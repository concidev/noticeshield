/**
 * Gemma 4 adapter for NoticeShield.
 *
 * This file is the integration point for Gemma 4 (via Kaggle, local runtime, or a compatible API).
 * In the hackathon MVP, this is wired to the Kaggle / OpenAI-compatible endpoint.
 * For local/private mode, replace GEMMA_API_URL and GEMMA_API_KEY with a local Gemma server.
 *
 * Prompt engineering is designed for Gemma 4's multimodal reasoning capabilities:
 * - Structured JSON output
 * - Multilingual translation
 * - Document understanding (image + text)
 */

import type { LocalResource, NoticeAnalysis, NoticeType, UrgencyLevel, UserLocation } from "./types";

const GEMMA_API_URL = process.env.GEMMA_API_URL ?? "";
const GEMMA_API_KEY = process.env.GEMMA_API_KEY ?? "";

const SYSTEM_PROMPT = `You are NoticeShield, an AI assistant that helps people understand urgent civic notices.
Your job is to analyze official notices and return a structured JSON response.

Always respond with a single valid JSON object matching this exact schema:
{
  "urgency": "critical" | "high" | "medium" | "low",
  "noticeType": "eviction" | "rent_arrears" | "utility_shutoff" | "benefits" | "immigration" | "court_hearing" | "school" | "emergency_public" | "boil_water" | "evacuation" | "healthcare" | "unknown",
  "noticeTypeLabel": "Human-readable label",
  "deadline": "Exact deadline text from notice or null",
  "deadlineDate": "ISO date YYYY-MM-DD or null",
  "summary": "Plain-language 2-3 sentence summary of what this notice means",
  "riskIfIgnored": "1-2 sentences: what happens if no action is taken",
  "nextSteps": ["Step 1", "Step 2", ...],
  "suggestedMessage": "Template message the recipient can use to contact the sender",
  "translation": "Full translation in the requested language, or null if English",
  "translationLanguage": "Language code (es, fr, zh, etc.) or null",
  "locationLabel": "User location label or null",
  "localResources": [
    { "label": "Resource name", "detail": "How this resource helps and where to find it", "category": "legal" | "housing" | "utility" | "benefits" | "healthcare" | "general" }
  ]
}

Rules:
- Use plain, simple language (Grade 6 reading level)
- Be specific about deadlines and amounts mentioned in the notice
- Always recommend professional legal help for serious notices
- Use the user's location to suggest relevant aid categories, hotline names, and offices when possible
- If unsure about a local resource, suggest a stable official directory instead of inventing a specific office
- Never provide legal advice — provide information and next steps only
- Be compassionate — recipients are often scared or overwhelmed
- Language auto-detection: If the notice text is written in a language other than English, automatically detect it, set translationLanguage to its BCP 47 code (e.g. "es", "fr", "zh", "ar"), and populate the translation field with a full translation of summary, riskIfIgnored, nextSteps, suggestedMessage, and localResources.detail — even if no translation was explicitly requested`;

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish", fr: "French", zh: "Chinese (Simplified)",
  ar: "Arabic", pt: "Portuguese", hi: "Hindi",
  ru: "Russian", vi: "Vietnamese", ko: "Korean",
  tl: "Filipino", so: "Somali",
};

function buildUserPrompt(noticeText: string, targetLanguage?: string, location?: UserLocation): string {
  const langName = targetLanguage ? (LANGUAGE_NAMES[targetLanguage] ?? targetLanguage) : null;
  const langInstruction =
    langName && targetLanguage !== "en"
      ? `\n\nIMPORTANT: Return summary, riskIfIgnored, nextSteps, suggestedMessage, translation, and localResources.detail in ${langName}. Set translationLanguage to "${targetLanguage}". Keep proper names, agency names, addresses, case numbers, and deadlines unchanged.`
      : "";
  const locationInstruction = location
    ? `\n\nUSER LOCATION: ${location.label}. Use this to tailor localResources and mention that rules, deadlines, and aid options can vary by jurisdiction.`
    : "\n\nUSER LOCATION: Not provided. Recommend national or official directories instead of location-specific offices.";

  return `Please analyze the following official notice and return the structured JSON response:\n\n---\n${noticeText}\n---${locationInstruction}${langInstruction}`;
}

export async function gemmaAnalyze(
  noticeText: string,
  targetLanguage?: string,
  location?: UserLocation,
  imageBase64?: string,
  imageMimeType?: string,
  onToken?: (text: string) => void
): Promise<NoticeAnalysis> {
  if (!GEMMA_API_URL || !GEMMA_API_KEY) {
    throw new Error("Gemma API not configured. Set GEMMA_API_URL and GEMMA_API_KEY environment variables.");
  }

  const messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (imageBase64 && imageMimeType) {
    messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
        },
        {
          type: "text",
          text: buildUserPrompt(noticeText || "Please analyze this notice image.", targetLanguage, location),
        },
      ],
    });
  } else {
    messages.push({ role: "user", content: buildUserPrompt(noticeText, targetLanguage, location) });
  }

  const response = await fetch(GEMMA_API_URL, {
    method: "POST",
    signal: AbortSignal.timeout(120_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEMMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GEMMA_MODEL ?? "gemma-4-27b-it",
      messages,
      temperature: 0.2,
      max_tokens: 8192,
      stream: !!onToken,
      // response_format conflicts with streaming on Google AI Studio — only use it in non-streaming mode.
      // Set GEMMA_JSON_MODE=false to disable entirely.
      ...(!onToken && process.env.GEMMA_JSON_MODE !== "false" ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemma API error ${response.status}: ${error}`);
  }

  let fullContent: string;

  if (onToken && response.body) {
    // ── Streaming mode ──────────────────────────────────────────────────────
    // Gemma 4 thinking models always start with <thought>...</thought>.
    // We accumulate everything but only emit visible tokens once past that block.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    fullContent = "";
    let pastThought = false;

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break outer;

        let delta = "";
        try {
          delta = (JSON.parse(raw) as { choices?: Array<{ delta?: { content?: string } }> })
            .choices?.[0]?.delta?.content ?? "";
        } catch { continue; }

        if (!delta) continue;
        fullContent += delta;

        if (!pastThought) {
          const closeIdx = fullContent.indexOf("</thought>");
          if (closeIdx !== -1) {
            pastThought = true;
            const after = fullContent.slice(closeIdx + "</thought>".length);
            if (after.trim()) onToken(after);
          }
        } else {
          onToken(delta);
        }
      }
    }
  } else {
    // ── Non-streaming mode ──────────────────────────────────────────────────
    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    fullContent = data.choices?.[0]?.message?.content ?? "";
    if (!fullContent) throw new Error("Empty response from Gemma API");
  }

  // Strip thought tags and code fences before parsing JSON
  const stripped = fullContent
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // Extract the outermost JSON object — guards against trailing text or truncation
  const jsonStart = stripped.indexOf("{");
  const jsonEnd = stripped.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    const preview = stripped.slice(0, 300).replace(/\n/g, " ");
    throw new Error(`Gemma returned a response but no JSON was found. Preview: "${preview || "(empty)"}"`);
  }
  const jsonSlice = stripped.slice(jsonStart, jsonEnd + 1);

  let parsed: Partial<NoticeAnalysis>;
  try {
    parsed = JSON.parse(jsonSlice) as Partial<NoticeAnalysis>;
  } catch {
    throw new Error("Gemma's response was cut off before the JSON was complete. This usually means the notice is very long — try trimming it, or it may resolve on retry.");
  }
  const parsedResources = Array.isArray(parsed.localResources) ? parsed.localResources : [];

  return {
    urgency: (parsed.urgency as UrgencyLevel) ?? "medium",
    noticeType: (parsed.noticeType as NoticeType) ?? "unknown",
    noticeTypeLabel: parsed.noticeTypeLabel ?? "Official Notice",
    deadline: parsed.deadline ?? null,
    deadlineDate: parsed.deadlineDate ?? null,
    summary: parsed.summary ?? "Analysis unavailable.",
    riskIfIgnored: parsed.riskIfIgnored ?? "Please consult a professional.",
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    suggestedMessage: parsed.suggestedMessage ?? "",
    translation: parsed.translation ?? null,
    translationLanguage: parsed.translationLanguage ?? null,
    locationLabel: parsed.locationLabel ?? location?.label ?? null,
    localResources: parsedResources.filter((resource): resource is LocalResource =>
      typeof resource?.label === "string" &&
      typeof resource?.detail === "string" &&
      typeof resource?.category === "string"
    ),
    disclaimer:
      "NoticeShield provides general information only and is not legal advice. AI can make mistakes, especially with dates, amounts, addresses, and legal requirements. Verify every deadline and instruction with the original notice or issuing agency. For eviction, court, immigration, benefits, utility shutoff, or healthcare notices, contact a qualified legal professional, advocate, or the issuing office as soon as possible.",
    analysisMode: "gemma",
  };
}

/**
 * Answer a follow-up question about a notice, given its already-computed analysis.
 * Returns the answer as a plain string. Streams tokens via onToken if provided.
 */
export async function gemmaFollowUp(
  analysis: NoticeAnalysis,
  question: string,
  onToken?: (text: string) => void
): Promise<string> {
  if (!GEMMA_API_URL || !GEMMA_API_KEY) {
    return "Live Gemma mode is not configured. Please add GEMMA_API_URL and GEMMA_API_KEY to enable follow-up questions.";
  }

  const context = [
    `Notice type: ${analysis.noticeTypeLabel}`,
    `Urgency: ${analysis.urgency}`,
    `Deadline: ${analysis.deadline ?? "Not specified"}`,
    `Summary: ${analysis.summary}`,
    `Risk if ignored: ${analysis.riskIfIgnored}`,
    `Required steps: ${analysis.nextSteps.join(" | ")}`,
    analysis.locationLabel ? `Location context: ${analysis.locationLabel}` : "",
  ].filter(Boolean).join("\n");

  const response = await fetch(GEMMA_API_URL, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEMMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GEMMA_MODEL ?? "gemma-4-27b-it",
      messages: [
        {
          role: "system",
          content: `You are NoticeShield, a compassionate AI assistant helping people understand official notices.
You have already analyzed a notice for this user. Answer their follow-up question using the analysis context provided.
Rules:
- Plain language, Grade 6 reading level
- Be specific, compassionate, and direct
- Do NOT provide legal advice — provide information and next steps only
- If the question is outside what the notice covers, say so and direct them to appropriate help
- Keep answers concise: 2–5 sentences unless the question requires more detail
- Never invent facts not present in the analysis or the notice`,
        },
        {
          role: "user",
          content: `Here is what we know about this notice:\n\n${context}\n\nUser's question: ${question}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: !!onToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemma API error ${response.status}`);
  }

  let fullContent: string;

  if (onToken && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    fullContent = "";
    let pastThought = false;

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break outer;
        let delta = "";
        try {
          delta = (JSON.parse(raw) as { choices?: Array<{ delta?: { content?: string } }> })
            .choices?.[0]?.delta?.content ?? "";
        } catch { continue; }
        if (!delta) continue;
        fullContent += delta;
        if (!pastThought) {
          const closeIdx = fullContent.indexOf("</thought>");
          if (closeIdx !== -1) {
            pastThought = true;
            const after = fullContent.slice(closeIdx + "</thought>".length);
            if (after.trim()) onToken(after);
          }
        } else {
          onToken(delta);
        }
      }
    }
  } else {
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    fullContent = data.choices?.[0]?.message?.content ?? "";
  }

  return fullContent
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();
}

/**
 * Translate only the user-facing fields of a pre-cached analysis.
 * Much faster than a full analysis call — no reasoning, just translation.
 * Falls back to the original English analysis if anything goes wrong.
 */
export async function gemmaTranslateCached(
  analysis: NoticeAnalysis,
  targetLanguage: string
): Promise<NoticeAnalysis> {
  if (!GEMMA_API_URL || !GEMMA_API_KEY) {
    return { ...analysis, translationLanguage: targetLanguage };
  }

  const langName = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;

  const payload = {
    summary: analysis.summary,
    riskIfIgnored: analysis.riskIfIgnored,
    nextSteps: analysis.nextSteps,
    suggestedMessage: analysis.suggestedMessage,
    resourceDetails: analysis.localResources.map((r) => r.detail),
  };

  const response = await fetch(GEMMA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEMMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GEMMA_MODEL ?? "gemma-4-27b-it",
      messages: [
        {
          role: "system",
          content: `You are a precise translator. Translate the JSON field values below into ${langName}.
Rules:
- Return ONLY valid JSON with the exact same keys
- Keep proper names, agency names, addresses, phone numbers, URLs, dates, case numbers, and monetary amounts unchanged
- Translate all descriptive text naturally at a Grade 6 reading level`,
        },
        {
          role: "user",
          content: `Translate all values to ${langName}:\n\n${JSON.stringify(payload)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) return { ...analysis, translationLanguage: targetLanguage };

  try {
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? "";
    if (!raw) return { ...analysis, translationLanguage: targetLanguage };

    // Strip thought tags and code fences before parsing
    const cleaned = raw
      .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return { ...analysis, translationLanguage: targetLanguage };

    const t = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as {
      summary?: string;
      riskIfIgnored?: string;
      nextSteps?: string[];
      suggestedMessage?: string;
      resourceDetails?: string[];
    };

    return {
      ...analysis,
      summary: t.summary ?? analysis.summary,
      riskIfIgnored: t.riskIfIgnored ?? analysis.riskIfIgnored,
      nextSteps: Array.isArray(t.nextSteps) ? t.nextSteps : analysis.nextSteps,
      suggestedMessage: t.suggestedMessage ?? analysis.suggestedMessage,
      localResources: analysis.localResources.map((r, i) => ({
        ...r,
        detail: t.resourceDetails?.[i] ?? r.detail,
      })),
      translation: null,
      translationLanguage: targetLanguage,
    };
  } catch {
    return { ...analysis, translationLanguage: targetLanguage };
  }
}
