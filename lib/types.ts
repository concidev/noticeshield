export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export type NoticeType =
  | "eviction"
  | "rent_arrears"
  | "utility_shutoff"
  | "benefits"
  | "immigration"
  | "court_hearing"
  | "school"
  | "emergency_public"
  | "boil_water"
  | "evacuation"
  | "healthcare"
  | "unknown";

export interface UserLocation {
  country: string;
  region: string;
  locality: string;
  label: string;
}

export interface LocalResource {
  label: string;
  detail: string;
  category: "legal" | "housing" | "utility" | "benefits" | "healthcare" | "general";
  url?: string;
}

export interface NoticeAnalysis {
  urgency: UrgencyLevel;
  noticeType: NoticeType;
  noticeTypeLabel: string;
  deadline: string | null;
  deadlineDate: string | null;
  summary: string;
  riskIfIgnored: string;
  nextSteps: string[];
  suggestedMessage: string;
  translation: string | null;
  translationLanguage: string | null;
  locationLabel: string | null;
  localResources: LocalResource[];
  disclaimer: string;
  analysisMode: "gemma" | "mock" | "demo" | "cached";
}

export interface AnalyzeRequest {
  noticeText: string;
  targetLanguage?: string;
  location?: UserLocation;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: NoticeAnalysis;
  error?: string;
}

export interface SampleNotice {
  id: string;
  label: string;
  type: NoticeType;
  text: string;
}
