import type { NoticeAnalysis, UserLocation } from "./types";

const DISCLAIMER =
  "NoticeShield provides general information only and is not legal advice. AI can make mistakes, especially with dates, amounts, addresses, and legal requirements. Verify every deadline and instruction with the original notice or issuing agency. For eviction, court, immigration, benefits, utility shutoff, or healthcare notices, contact a qualified legal professional, advocate, or the issuing office as soon as possible.";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

type CacheEntry = {
  fingerprint: string;
  build: (location?: UserLocation) => NoticeAnalysis;
};

const ENTRIES: CacheEntry[] = [
  {
    fingerprint: "NOTICE TO PAY RENT OR QUIT To: Tenant(s) at 412 M",
    build: (location) => ({
      urgency: "critical",
      noticeType: "rent_arrears",
      noticeTypeLabel: "Rent Arrears / Pay or Quit Notice",
      deadline: "14 days from date of notice",
      deadlineDate: daysFromNow(14),
      summary:
        "Your landlord says you owe $1,250 in unpaid rent for September and October 2023. You must either pay the full amount or move out within 14 days. If you do neither, the landlord can file for eviction in court.",
      riskIfIgnored:
        "If you don't pay or vacate within 14 days, your landlord can file an eviction lawsuit. A court eviction judgment can stay on your record for years and make it very hard to rent another home.",
      nextSteps: [
        "Call Springfield Property Management at (555) 234-5678 today to ask about a payment plan",
        "Contact your local housing authority or dial 211 to ask about emergency rental assistance",
        "Gather proof of any payments already made and any written communications with your landlord",
        "Contact a free tenant rights clinic or legal aid office — eviction notices have strict timelines",
        "If you must move, get written confirmation of the exact amount owed before vacating",
      ],
      suggestedMessage:
        "Dear Springfield Property Management,\n\nI am writing regarding the Notice to Pay Rent or Quit for 412 Maple Street, Unit 3B, dated October 10, 2023.\n\nI understand there is an outstanding balance of $1,250 for September and October rent. I would like to discuss a payment arrangement to resolve this balance as soon as possible. Please contact me at your earliest convenience.\n\nThank you,\n[Your Name]\n[Phone Number]\n[Email]",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "Emergency Rental Assistance",
          detail: "Dial 211 or visit 211.org to find emergency rental assistance programs in your area — many have same-week payments available.",
          category: "housing",
          url: "https://www.211.org",
        },
        {
          label: "Tenant Rights / Legal Aid",
          detail: "LawHelp.org connects you to free tenant rights attorneys and legal aid offices by state. Request a consultation before the 14-day window closes.",
          category: "legal",
          url: "https://www.lawhelp.org",
        },
        {
          label: "HUD Housing Counseling",
          detail: "HUD-approved housing counselors (1-800-569-4287) can help you negotiate with your landlord and identify local assistance funds.",
          category: "housing",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
  {
    fingerprint: "NOTICE OF CLAIM DENIAL Patient: Jane Doe | Member",
    build: (location) => ({
      urgency: "high",
      noticeType: "healthcare",
      noticeTypeLabel: "Insurance Claim Denial",
      deadline: "60 days from date of notice to file an appeal",
      deadlineDate: daysFromNow(60),
      summary:
        "Your health insurance denied the claim for your September 14, 2023 visit to Valley Medical Center, saying the procedure was not medically necessary. You are being billed the full $480.00. You have the right to appeal this decision within 60 days.",
      riskIfIgnored:
        "If you don't appeal within 60 days, you lose the right to challenge the denial and will owe the full $480.00. The medical provider may send the unpaid balance to a debt collection agency.",
      nextSteps: [
        "Request an Explanation of Benefits (EOB) from your insurer in writing to understand the exact denial reason",
        "Ask your doctor at Valley Medical Center to write a letter of medical necessity supporting the procedure",
        "File your written appeal before the 60-day deadline — send it by certified mail and keep a copy",
        "Include your member ID (HMP-00234-X) and date of service (September 14, 2023) in all correspondence",
        "If the first appeal is denied, you can request a free external independent review",
      ],
      suggestedMessage:
        "To Whom It May Concern,\n\nI am writing to formally appeal the denial of my claim for services rendered on September 14, 2023 at Valley Medical Center (Member ID: HMP-00234-X).\n\nI believe the procedure (CPT Code 99213) was medically necessary, and I am enclosing supporting documentation from my provider. I respectfully request that this claim be reconsidered.\n\nPlease confirm receipt of this appeal and advise on next steps.\n\nSincerely,\n[Your Name]\n1-800-555-0222",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "Patient Advocate Foundation",
          detail: "Free case managers help you appeal insurance denials and navigate the system. patientadvocate.org or 1-800-532-5274.",
          category: "healthcare",
          url: "https://www.patientadvocate.org",
        },
        {
          label: "State Insurance Commissioner",
          detail: "Your state's insurance regulator handles wrongful denial complaints. Find yours at naic.org/state_web_map.htm.",
          category: "healthcare",
          url: "https://www.naic.org/state_web_map.htm",
        },
        {
          label: "Hospital Financial Assistance",
          detail: "Contact Valley Medical Center's billing department directly — most nonprofit hospitals have charity care or financial hardship programs.",
          category: "healthcare",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
  {
    fingerprint: "SUMMONS — CIVIL COURT TO: John Doe 412 Maple Stre",
    build: (location) => ({
      urgency: "critical",
      noticeType: "court_hearing",
      noticeTypeLabel: "Civil Court Summons",
      deadline: "Appear in court on November 15, 2023 at 9:00 AM",
      deadlineDate: daysFromNow(21),
      summary:
        "You are being sued by Speedy Lending LLC for $2,340.00 in unpaid debt. You must appear at Springfield Civil Court on November 15, 2023 at 9:00 AM in Room 4B. This is a legal proceeding — missing this date will likely result in an automatic judgment against you.",
      riskIfIgnored:
        "If you do not appear, the judge will almost certainly enter a default judgment for $2,340.00 plus court costs. This allows Speedy Lending to garnish your wages, freeze your bank account, or place a lien on your property.",
      nextSteps: [
        "Contact a legal aid attorney immediately — you have the right to contest this debt claim",
        "Gather all records related to this debt: loan agreements, payment receipts, and any dispute letters",
        "Appear in court on November 15, 2023 at 9:00 AM at 200 Court Plaza, Room 4B — even showing up without preparation is better than a default judgment",
        "Consider requesting a continuance (postponement) to give yourself time to find legal help",
        "Check whether the debt is past the statute of limitations in your state — old debts may not be legally collectible",
      ],
      suggestedMessage:
        "To the Court Clerk,\n\nCase No: 2023-CV-04821 — Speedy Lending LLC v. John Doe\n\nI am writing to confirm my intention to appear at the scheduled hearing on November 15, 2023. I am currently seeking legal representation and may request a continuance.\n\nPlease advise if any paperwork is required prior to the hearing date.\n\nRespectfully,\nJohn Doe\n412 Maple Street, Unit 3B\nSpringfield, IL 62701",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "Free Legal Aid",
          detail: "LawHelp.org connects you to civil legal aid attorneys who can represent you in debt collection cases at no cost.",
          category: "legal",
          url: "https://www.lawhelp.org",
        },
        {
          label: "National Consumer Law Center",
          detail: "nclc.org provides free guides on your rights in debt collection cases and how to respond to a civil court summons.",
          category: "legal",
          url: "https://www.nclc.org",
        },
        {
          label: "Court Self-Help Center",
          detail: "Most civil courthouses have a self-help center with free forms and guidance for people representing themselves in small claims or debt cases.",
          category: "general",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
  {
    fingerprint: "NOTICE OF CHANGE IN BENEFITS Recipient: Jane Doe ",
    build: (location) => ({
      urgency: "high",
      noticeType: "benefits",
      noticeTypeLabel: "SNAP Benefits Reduction",
      deadline: "30 days from notice to appeal; reduction effective December 1, 2023",
      deadlineDate: daysFromNow(30),
      summary:
        "Your SNAP (food assistance) benefits are being reduced from $320 to $190 per month starting December 1, 2023 because the agency says your household income is now too high. You have 30 days to appeal if you believe this is wrong — and if you appeal in time, your current benefit continues until the hearing.",
      riskIfIgnored:
        "If you don't appeal within 30 days, your benefit amount permanently drops to $190/month and you lose the right to challenge the reduction for this period.",
      nextSteps: [
        "Request a fair hearing appeal by calling (555) 789-4400 or visiting 500 State Street, Room 12 before the 30-day deadline",
        "Ask the agency for a copy of the evidence it used to calculate your new income figure",
        "Gather documents showing your actual household income: pay stubs, bank statements, or an employer letter",
        "If you appeal before December 1, your current $320 benefit level must continue until the hearing is decided",
        "Ask about other assistance programs you may now qualify for if your income has genuinely changed",
      ],
      suggestedMessage:
        "To the Benefits Review Office,\n\nCase Number: 2023-SNAP-00871 — Jane Doe\n\nI am writing to formally request a fair hearing to appeal the reduction of my SNAP benefits effective December 1, 2023.\n\nI believe the income information used to calculate this reduction may be incorrect and I am prepared to provide documentation of my actual household income at the hearing.\n\nPlease confirm receipt of this appeal request and advise on the hearing date.\n\nSincerely,\nJane Doe",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "Benefits.gov",
          detail: "Benefits.gov lists all federal and state assistance programs you may qualify for if your SNAP benefit is reduced.",
          category: "benefits",
          url: "https://www.benefits.gov",
        },
        {
          label: "Feeding America Food Bank Finder",
          detail: "feedingamerica.org can help bridge the gap while your appeal is processed — find your nearest food bank.",
          category: "general",
          url: "https://www.feedingamerica.org/find-your-local-foodbank",
        },
        {
          label: "Benefits Legal Aid",
          detail: "Many legal aid organizations specialize in public benefits appeals. LawHelp.org can connect you to one in your state.",
          category: "legal",
          url: "https://www.lawhelp.org",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
  {
    fingerprint: "FINAL NOTICE — SERVICE DISCONNECTION Account: #78",
    build: (location) => ({
      urgency: "critical",
      noticeType: "utility_shutoff",
      noticeTypeLabel: "Electricity Disconnection Warning",
      deadline: "Pay before November 1, 2023 to avoid disconnection",
      deadlineDate: daysFromNow(7),
      summary:
        "Your electricity account (#78234-K) has an unpaid balance of $347.50. If you don't pay or make arrangements before November 1, 2023, your electricity will be shut off. Most utilities are required by law to offer a payment plan before disconnecting service.",
      riskIfIgnored:
        "Disconnection affects heating, refrigeration, and any medical equipment. Reconnection fees typically add $50–$200 on top of the existing balance, and a deposit may be required before service is restored.",
      nextSteps: [
        "Call 1-800-555-0100 today to ask about a payment plan or hardship extension before November 1",
        "Ask if you qualify for LIHEAP (Low-Income Home Energy Assistance Program) — it can pay your balance directly",
        "Dial 211 to find emergency utility assistance funds in your area, including church and community programs",
        "If anyone in your household has a medical condition requiring electricity, tell the utility — many states require extended notice before disconnecting medically vulnerable customers",
        "Even a partial payment may pause the disconnection process while you arrange the rest",
      ],
      suggestedMessage:
        "To Whom It May Concern,\n\nAccount Number: #78234-K\nService Address: 412 Maple Street, Unit 3B\n\nI am writing regarding the Final Disconnection Notice for an outstanding balance of $347.50. I would like to arrange a payment plan to clear this balance and avoid service interruption.\n\nPlease contact me to discuss available options.\n\nThank you,\n[Your Name]\n[Phone Number]",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "LIHEAP Energy Assistance",
          detail: "LIHEAP can pay utility bills directly. Apply at liheap.acf.hhs.gov or through your local community action agency.",
          category: "utility",
          url: "https://www.acf.hhs.gov/ocs/programs/liheap",
        },
        {
          label: "211 Utility Help",
          detail: "Dial 2-1-1 or visit 211.org to find local emergency utility assistance funds, including nonprofit and church programs.",
          category: "utility",
          url: "https://www.211.org",
        },
        {
          label: "State Utility Commission",
          detail: "Your state's Public Utilities Commission can explain your rights before disconnection, including required notice periods and medical hardship protections.",
          category: "utility",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
  {
    fingerprint: "NOTICE OF F-1 STUDENT VISA STATUS TERMINATION Nam",
    build: (location) => ({
      urgency: "critical",
      noticeType: "immigration",
      noticeTypeLabel: "F-1 Student Visa Termination",
      deadline: "60 days to depart or take corrective action",
      deadlineDate: daysFromNow(60),
      summary:
        "Your F-1 student visa status has been terminated because you did not maintain full-time enrollment as required by law. You have 60 days to either leave the United States, file for reinstatement with USCIS, or transfer to a new certified school. Staying beyond 60 days without acting could trigger removal proceedings.",
      riskIfIgnored:
        "Remaining in the US past the 60-day window without taking corrective action creates unlawful presence. This can result in removal (deportation) and a multi-year or permanent bar on re-entering the United States.",
      nextSteps: [
        "Contact an immigration attorney or accredited representative immediately — the 60-day clock starts from the date on this notice",
        "Speak with your school's Designated School Official (DSO) about reinstatement eligibility and filing Form I-539 with USCIS",
        "If transferring to a new school, confirm it is SEVP-certified and start the SEVIS transfer as soon as possible",
        "Do not leave the US without consulting an immigration attorney first — departure may affect your ability to return",
        "Gather all enrollment records, correspondence with your school, and any documentation of extenuating circumstances",
      ],
      suggestedMessage:
        "To the DSO / International Student Office,\n\nI am writing regarding the termination of my F-1 visa status (Alien Registration Number: A 123-456-789 — Maria Gonzalez), dated October 15, 2023.\n\nI would like to understand my options for reinstatement and request guidance on the steps required to restore my status. I am committed to maintaining compliance and wish to resolve this as quickly as possible.\n\nPlease advise on required documentation and next steps.\n\nSincerely,\nMaria Gonzalez\n[Phone Number]\n[Email]",
      translation: null,
      translationLanguage: null,
      locationLabel: location?.label ?? null,
      localResources: [
        {
          label: "Immigration Legal Aid (CLINIC)",
          detail: "Catholic Legal Immigration Network provides free and low-cost immigration legal services nationwide. Find a representative at cliniclegal.org.",
          category: "legal",
          url: "https://cliniclegal.org/find-accredited-representative",
        },
        {
          label: "USCIS F-1 Reinstatement",
          detail: "Official USCIS guidance on F-1 reinstatement (Form I-539) is at uscis.gov. Fee waivers may be available for low-income applicants.",
          category: "general",
          url: "https://www.uscis.gov/i-539",
        },
        {
          label: "NAFSA — Find a Student Advisor",
          detail: "nafsa.org can connect you with a campus immigration advisor or Designated School Official (DSO) at your institution.",
          category: "general",
          url: "https://www.nafsa.org",
        },
      ],
      disclaimer: DISCLAIMER,
      analysisMode: "cached",
    }),
  },
];

const FINGERPRINT_LENGTH = 50;

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function getCachedAnalysis(noticeText: string, location?: UserLocation): NoticeAnalysis | null {
  const normalized = normalize(noticeText);
  const entry = ENTRIES.find((e) => normalized.startsWith(e.fingerprint));
  return entry ? entry.build(location) : null;
}

export function getDemoAnalysis(): NoticeAnalysis {
  return ENTRIES[0].build();
}
