import type { LocalResource, NoticeType, UserLocation } from "./types";

const PROVINCIAL_LEGAL_AID: Record<string, { label: string; url: string }> = {
  "Ontario":          { label: "Legal Aid Ontario",  url: "https://www.legalaid.on.ca" },
  "British Columbia": { label: "Legal Aid BC",        url: "https://lss.bc.ca" },
  "Alberta":          { label: "Legal Aid Alberta",   url: "https://www.legalaid.ab.ca" },
};

export function buildLocalResources(type: NoticeType | "general", location?: UserLocation): LocalResource[] {
  const place = location?.label ?? "your area";
  const isCanada = location?.country === "Canada";

  const legalLabel = isCanada ? "JusticeNet — Legal Aid Finder" : "LawHelp.org — Legal Aid Finder";
  const legalUrl   = isCanada ? "https://justicenet.ca"          : "https://www.lawhelp.org";
  const legalDetail = isCanada
    ? `Find free or low-cost legal help by province at JusticeNet, serving ${place}.`
    : `Find free or low-cost legal help by state at LawHelp.org, serving ${place}.`;

  const helplineLabel  = isCanada ? "211 Canada"       : "211 Helpline";
  const helplineUrl    = isCanada ? "https://211canada.ca" : "https://www.211.org";
  const helplineDetail = `Call or search ${helplineLabel} for housing, food, utility, and crisis support near ${place}.`;

  const resources: LocalResource[] = [
    { label: helplineLabel, detail: helplineDetail, category: "general", url: helplineUrl },
    { label: legalLabel,    detail: legalDetail,    category: "legal",   url: legalUrl },
  ];

  const provincial = isCanada && location?.region ? PROVINCIAL_LEGAL_AID[location.region] : undefined;
  if (provincial) {
    resources.push({
      label: provincial.label,
      detail: `Provincial legal aid for qualifying residents of ${location!.region}. Free help for eligible cases.`,
      category: "legal",
      url: provincial.url,
    });
  }

  resources.push({
    label: "Official Agency Directory",
    detail: `Use your ${isCanada ? "municipal, provincial, or territorial" : "city, county, or state"} website to verify offices, appeal windows, and language access services for ${place}.`,
    category: "general",
  });

  if (type === "general" || type === "eviction" || type === "rent_arrears") {
    resources.push({
      label: "Local Tenant or Housing Hotline",
      detail: isCanada
        ? `Search 211Canada or your provincial tenant rights office for rental assistance and eviction-prevention programs in ${place}.`
        : `Ask for tenant counseling, emergency rental assistance, shelter diversion, and eviction-prevention programs for ${place}.`,
      category: "housing",
      url: helplineUrl,
    });
  }

  if (type === "general" || type === "utility_shutoff") {
    resources.push({
      label: `Utility Assistance (${helplineLabel})`,
      detail: `Ask the utility company and ${helplineLabel} about payment plans, medical protections, and energy assistance programs in ${place}.`,
      category: "utility",
      url: helplineUrl,
    });
  }

  if (type === "general" || type === "benefits") {
    resources.push({
      label: isCanada ? "Benefits Appeal (Canada.ca)" : "Benefits Appeal Support",
      detail: isCanada
        ? `Contact the agency listed on the notice for hearing rights and appeal forms. Visit Canada.ca for national benefit programs.`
        : `Contact the agency listed on the notice for hearing rights, appeal forms, continued benefits rules, and interpreter support for ${place}.`,
      category: "benefits",
      url: isCanada ? "https://www.canada.ca/en/services/benefits.html" : "https://www.benefits.gov",
    });
  }

  if (type === "general" || type === "healthcare") {
    resources.push({
      label: isCanada ? "Patient Advocate / Provincial Health Line" : "Patient Advocate or Insurer Appeals Line",
      detail: isCanada
        ? `Contact your provincial health authority or insurer for claim appeals, financial assistance, and language access services in ${place}.`
        : `Ask for claim appeal steps, financial assistance, charity care, and language access services available in ${place}.`,
      category: "healthcare",
    });
  }

  return resources;
}
