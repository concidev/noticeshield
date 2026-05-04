import type { NoticeAnalysis, NoticeType, UserLocation } from "./types";
import { buildLocalResources } from "./localResources";

function detectNoticeType(text: string): { type: NoticeType; label: string } {
  const lower = text.toLowerCase();
  if (lower.includes("evict") || lower.includes("quit and vacate") || lower.includes("vacate the premises"))
    return { type: "eviction", label: "Eviction Notice" };
  if (lower.includes("rent") && (lower.includes("arrear") || lower.includes("overdue") || lower.includes("unpaid")))
    return { type: "rent_arrears", label: "Rent Arrears Notice" };
  if (lower.includes("disconnect") || lower.includes("shutoff") || lower.includes("shut-off") || lower.includes("termination of service"))
    return { type: "utility_shutoff", label: "Utility Shutoff Warning" };
  if (lower.includes("medicaid") || lower.includes("benefits") || lower.includes("social services") || lower.includes("snap") || lower.includes("welfare"))
    return { type: "benefits", label: "Benefits Change Notice" };
  if (lower.includes("immigration") || lower.includes("visa") || lower.includes("uscis") || lower.includes("deportation"))
    return { type: "immigration", label: "Immigration Notice" };
  if (lower.includes("summons") || lower.includes("court") || lower.includes("hearing") || lower.includes("judgment"))
    return { type: "court_hearing", label: "Court Summons / Hearing Notice" };
  if (lower.includes("suspension") || lower.includes("attendance") || lower.includes("school") || lower.includes("truancy"))
    return { type: "school", label: "School Notice" };
  if (lower.includes("boil water") || lower.includes("do not drink") || lower.includes("water advisory"))
    return { type: "boil_water", label: "Boil Water Advisory" };
  if (lower.includes("evacuat"))
    return { type: "evacuation", label: "Evacuation Order" };
  if (lower.includes("emergency") && lower.includes("public"))
    return { type: "emergency_public", label: "Emergency Public Notice" };
  if (lower.includes("healthcare") || lower.includes("hospital") || lower.includes("prescription") || lower.includes("diagnosis"))
    return { type: "healthcare", label: "Healthcare Notice" };
  return { type: "unknown", label: "Official Notice" };
}

function extractDeadline(text: string): { deadline: string | null; deadlineDate: string | null } {
  const patterns = [
    /within\s+(\d+)\s+days?/i,
    /by\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s*\d{4}/i,
    /on\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s*\d{4}/i,
    /(?:before|no later than)\s+([A-Z][a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /deadline[:\s]+([A-Z][a-z]+\s+\d{1,2},?\s*\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\w+ \d{1,2}, \d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { deadline: match[0], deadlineDate: match[1] ?? match[0] };
    }
  }
  return { deadline: null, deadlineDate: null };
}

function detectUrgency(type: NoticeType, text: string): "critical" | "high" | "medium" | "low" {
  const lower = text.toLowerCase();
  if (
    type === "eviction" ||
    type === "evacuation" ||
    type === "boil_water" ||
    lower.includes("immediate") ||
    lower.includes("final notice") ||
    lower.includes("within 3 days") ||
    lower.includes("within three days")
  )
    return "critical";
  if (
    type === "utility_shutoff" ||
    type === "court_hearing" ||
    type === "immigration" ||
    lower.includes("within 10 days") ||
    lower.includes("within 7 days")
  )
    return "high";
  if (type === "benefits" || type === "rent_arrears" || type === "school")
    return "medium";
  return "low";
}

const noticeTemplates: Record<NoticeType, Partial<NoticeAnalysis>> = {
  eviction: {
    summary:
      "Your landlord is legally demanding you leave the property, usually because of unpaid rent or a lease violation. This is a formal first step in the eviction process.",
    riskIfIgnored:
      "If you do not act, your landlord can file an eviction lawsuit. A court order could force you out, damage your rental history, and make it much harder to find housing in the future.",
    nextSteps: [
      "Read the notice carefully — confirm the exact amount owed and the deadline",
      "Contact your landlord immediately to discuss payment or a payment plan",
      "If you cannot pay, call a local tenant rights organization or legal aid hotline today",
      "Do not ignore the notice — even a response buys you time",
      "Gather any receipts, bank records, or messages related to rent payments",
      "If you believe the notice is wrong, document your evidence immediately",
    ],
    suggestedMessage:
      "Hello, my name is [Your Name] and I am the tenant at [Your Address]. I received an eviction notice dated [Date]. I would like to discuss options to resolve this. Please contact me at [Your Phone Number]. Thank you.",
  },
  rent_arrears: {
    summary:
      "You owe unpaid rent and your landlord has formally notified you of the overdue amount. This is a warning before possible eviction proceedings.",
    riskIfIgnored:
      "Failure to pay or communicate could lead to a formal eviction notice and legal action. Late rent can result in fees and court costs on top of the original debt.",
    nextSteps: [
      "Calculate the exact amount owed and check whether it matches your records",
      "Contact your landlord to arrange payment or a payment plan",
      "Check whether you qualify for emergency rental assistance in your area",
      "Keep written records of all communication with your landlord",
      "If you are in financial hardship, contact a housing counselor or legal aid",
    ],
    suggestedMessage:
      "Hello, I am writing about the rent arrears notice I received for [Address]. I acknowledge the outstanding balance and would like to discuss a payment arrangement. Please contact me at [Your Phone Number] or [Your Email].",
  },
  utility_shutoff: {
    summary:
      "Your utility provider (electricity, gas, or water) is warning that service will be disconnected due to an overdue bill. Service can be cut off on the stated date.",
    riskIfIgnored:
      "If unpaid, your power, gas, or water will be disconnected. Reconnection fees are often charged, and in cold or hot weather, losing utilities can be a serious safety risk — especially for elderly or young household members.",
    nextSteps: [
      "Contact the utility company immediately — even a partial payment may delay shutoff",
      "Ask about payment plans, low-income assistance programs, or emergency help funds",
      "Search for local emergency utility assistance programs (many nonprofits offer this)",
      "If you have medical equipment that needs power, notify the utility company now — they may have a medical exemption",
      "Keep a copy of all communications and payment confirmations",
    ],
    suggestedMessage:
      "Hello, my account number is [Account Number] at [Your Address]. I received a disconnection notice and would like to discuss payment options or assistance programs. Please contact me at [Your Phone Number]. Thank you.",
  },
  benefits: {
    summary:
      "A government agency is changing or stopping a benefit you receive, such as Medicaid, SNAP, or housing assistance. You have the right to appeal.",
    riskIfIgnored:
      "If you do not appeal by the deadline, you lose your right to challenge the decision. Benefits may be cut off, which can affect your healthcare, food, or housing.",
    nextSteps: [
      "Read the notice to understand exactly which benefit is changing and why",
      "Note the appeal deadline — typically 10–30 days from the notice date",
      "Request a fair hearing immediately by contacting the number on the notice",
      "Gather any documents that support your case (income records, household bills, medical letters)",
      "Contact a benefits counselor or legal aid organization for free help with your appeal",
    ],
    suggestedMessage:
      "Hello, my case number is [Case Number] and I received a notice that my benefits will change. I would like to request a hearing to appeal this decision. Please send me the hearing request form or call me at [Your Phone Number].",
  },
  immigration: {
    summary:
      "This is an official immigration notice that may affect your legal status, appointment requirements, or visa conditions. Immigration notices often have strict deadlines.",
    riskIfIgnored:
      "Missing deadlines on immigration notices can result in application denial, loss of legal status, or serious legal consequences. Do not delay taking action.",
    nextSteps: [
      "Read every word carefully — identify the required action and deadline",
      "Contact an immigration attorney or accredited representative immediately",
      "Do not attend any appointment without understanding the purpose first",
      "Do not share this document with anyone who is not your legal representative",
      "Contact your nearest nonprofit immigration legal services organization for free or low-cost help",
    ],
    suggestedMessage:
      "Hello, I received an immigration notice dated [Date] and I need assistance understanding my options. My case or receipt number is [Number]. Please contact me at [Your Phone Number].",
  },
  court_hearing: {
    summary:
      "You have been summoned to appear in court on a specific date. This may be a civil, criminal, or small claims matter. Failing to appear can result in automatic judgment against you.",
    riskIfIgnored:
      "If you miss the court date, the judge may rule against you without hearing your side. A default judgment can lead to wage garnishment, bank levies, or other legal actions.",
    nextSteps: [
      "Note the court date, time, and location carefully — put it in your calendar immediately",
      "Contact a lawyer or legal aid service as soon as possible",
      "Gather any documents related to the case (contracts, receipts, communications)",
      "If you cannot afford a lawyer, contact your local legal aid office for free help",
      "If you cannot attend on the stated date, contact the court immediately to request a postponement",
    ],
    suggestedMessage:
      "Hello, I received a court summons for Case Number [Case Number] with a hearing on [Date]. I need to discuss my legal options. Please contact me at [Your Phone Number] at your earliest convenience.",
  },
  school: {
    summary:
      "Your child's school has sent an official notice about attendance, discipline, or another school matter that requires your attention and possibly a response.",
    riskIfIgnored:
      "Ignoring school notices can lead to escalated disciplinary action, involvement of child protective services, or legal truancy proceedings.",
    nextSteps: [
      "Read the notice to understand whether action or a response is required",
      "Contact the school's main office or the named staff member",
      "Request a meeting if the notice involves suspension or a major issue",
      "Ask for any meeting to be held at a time you can attend",
      "Bring a support person to any formal school meeting if needed",
    ],
    suggestedMessage:
      "Hello, this is [Your Name], parent/guardian of [Child's Name]. I received a notice from the school dated [Date] and would like to discuss it further. Please call me at [Your Phone Number] or email me at [Your Email].",
  },
  emergency_public: {
    summary:
      "Local authorities have issued an emergency public notice affecting your area. This may involve health, safety, infrastructure, or weather conditions.",
    riskIfIgnored:
      "Ignoring emergency public notices can put your health and safety at risk. Follow all official instructions.",
    nextSteps: [
      "Follow all instructions in the notice immediately",
      "Check official local government or emergency management websites for updates",
      "Tell household members and neighbors about the notice",
      "Contact local emergency services if you need assistance complying",
    ],
    suggestedMessage:
      "I am a resident at [Your Address] and received the emergency notice about [Topic]. I need assistance complying. Please advise how I can get help. Call me at [Your Phone Number].",
  },
  boil_water: {
    summary:
      "Your local water authority has issued a boil water advisory. Tap water is unsafe to drink, cook with, or use for brushing teeth without boiling it first.",
    riskIfIgnored:
      "Drinking unboiled tap water during an advisory can cause serious gastrointestinal illness, especially for children, elderly persons, and people with weakened immune systems.",
    nextSteps: [
      "Boil all tap water for at least 1 full minute before drinking or cooking",
      "Discard any ice made during the advisory period",
      "Use bottled water for infant formula and baby food",
      "Tell everyone in your household immediately",
      "Check with your water authority for updates on when the advisory will be lifted",
    ],
    suggestedMessage:
      "Hello, I am a resident at [Your Address] affected by the boil water advisory. I am an elderly person / have young children / have medical needs and may need assistance accessing safe water. Please contact me at [Your Phone Number].",
  },
  evacuation: {
    summary:
      "Authorities have ordered or recommended evacuation of your area due to a dangerous situation such as a natural disaster, fire, or hazardous material incident.",
    riskIfIgnored:
      "Staying in an evacuation zone can be life-threatening. Emergency services may not be able to reach you if you remain.",
    nextSteps: [
      "Leave immediately if this is a mandatory evacuation order",
      "Take essential documents (ID, insurance, medications), water, and phone charger",
      "Follow the designated evacuation routes — do not take shortcuts",
      "Contact local emergency management for shelter locations",
      "Notify family or a trusted contact of your departure and destination",
    ],
    suggestedMessage:
      "Hello, I am a resident at [Your Address] under the evacuation order. I need assistance evacuating due to [Mobility Issue / No Vehicle / Medical Need]. Please contact me at [Your Phone Number] as soon as possible.",
  },
  healthcare: {
    summary:
      "You have received an official healthcare notice regarding a medical procedure, prescription, insurance change, or appointment requirement.",
    riskIfIgnored:
      "Missing healthcare deadlines can affect your medical coverage, result in gaps in treatment, or lead to increased health risks.",
    nextSteps: [
      "Read the notice to identify the specific action required and deadline",
      "Contact your healthcare provider or insurer at the number on the notice",
      "Ask for clarification in plain language if you do not understand",
      "Keep a copy of all related correspondence",
    ],
    suggestedMessage:
      "Hello, I received a healthcare notice dated [Date] about [Topic]. I have questions and would like to understand my options. Please contact me at [Your Phone Number] or [Your Email].",
  },
  unknown: {
    summary:
      "You have received an official notice that requires your attention. Review it carefully to identify any deadlines, amounts owed, or required actions.",
    riskIfIgnored:
      "Official notices often have legal consequences if ignored. Failing to respond by any stated deadline may limit your rights or options.",
    nextSteps: [
      "Read the full notice carefully and identify the sender and purpose",
      "Note any deadlines or dates mentioned",
      "Contact the issuing organization using the contact information provided",
      "Consider consulting a legal aid organization if you are unsure of your rights",
    ],
    suggestedMessage:
      "Hello, I received a notice from your organization dated [Date] and I have questions about what it means and what I need to do. Please contact me at [Your Phone Number].",
  },
};

export async function mockAnalyze(noticeText: string, targetLanguage?: string, location?: UserLocation): Promise<NoticeAnalysis> {
  await new Promise((r) => setTimeout(r, 800));

  const { type, label } = detectNoticeType(noticeText);
  const urgency = detectUrgency(type, noticeText);
  const { deadline, deadlineDate } = extractDeadline(noticeText);
  const template = noticeTemplates[type];

  return {
    urgency,
    noticeType: type,
    noticeTypeLabel: label,
    deadline,
    deadlineDate,
    summary: template.summary ?? "This is an official notice that requires your attention.",
    riskIfIgnored: template.riskIfIgnored ?? "Ignoring this notice may have legal or financial consequences.",
    nextSteps: template.nextSteps ?? ["Read the notice carefully", "Contact the issuing organization", "Seek legal advice if needed"],
    suggestedMessage: template.suggestedMessage ?? "Hello, I received a notice and would like to discuss it. Please contact me at [Your Phone Number].",
    translation: targetLanguage && targetLanguage !== "en" ? `[Gemma 4 live mode would auto-translate this action plan into ${targetLanguage}. Demo mode keeps the full analysis in English.]` : null,
    translationLanguage: targetLanguage && targetLanguage !== "en" ? targetLanguage : null,
    locationLabel: location?.label ?? null,
    localResources: buildLocalResources(type, location),
    disclaimer:
      "NoticeShield provides general information only and is not legal advice. AI can make mistakes, especially with dates, amounts, addresses, and legal requirements. Verify every deadline and instruction with the original notice or issuing agency. For eviction, court, immigration, benefits, utility shutoff, or healthcare notices, contact a qualified legal professional, advocate, or the issuing office as soon as possible.",
    analysisMode: "mock",
  };
}
