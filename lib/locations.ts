import type { UserLocation } from "./types";

export interface LocationGroup {
  country: string;
  region: string;
  areas: string[];
}

export const locationGroups: LocationGroup[] = [
  {
    region: "California",
    country: "United States",
    areas: ["Los Angeles County", "Bay Area", "Sacramento County", "San Diego County"],
  },
  {
    region: "New York",
    country: "United States",
    areas: ["New York City", "Buffalo / Erie County", "Rochester / Monroe County", "Albany Capital Region"],
  },
  {
    region: "Texas",
    country: "United States",
    areas: ["Houston / Harris County", "Dallas County", "Austin / Travis County", "San Antonio / Bexar County"],
  },
  {
    region: "Florida",
    country: "United States",
    areas: ["Miami-Dade County", "Orlando / Orange County", "Tampa Bay", "Jacksonville / Duval County"],
  },
  {
    region: "Illinois",
    country: "United States",
    areas: ["Chicago / Cook County", "Springfield", "Peoria County", "Champaign County"],
  },
  {
    region: "Massachusetts",
    country: "United States",
    areas: ["Boston", "Worcester County", "Springfield / Hampden County", "Cambridge / Middlesex County"],
  },
  {
    region: "Washington",
    country: "United States",
    areas: ["Seattle / King County", "Spokane County", "Tacoma / Pierce County", "Olympia / Thurston County"],
  },
  {
    region: "Ontario",
    country: "Canada",
    areas: ["Toronto", "Ottawa", "Hamilton", "Mississauga / Peel Region"],
  },
  {
    region: "British Columbia",
    country: "Canada",
    areas: ["Metro Vancouver", "Victoria / Capital Region", "Kelowna / Okanagan", "Fraser Valley"],
  },
  {
    region: "Alberta",
    country: "Canada",
    areas: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
  },
  {
    region: "Quebec",
    country: "Canada",
    areas: ["Montréal", "Québec City", "Laval", "Gatineau"],
  },
  {
    region: "Manitoba",
    country: "Canada",
    areas: ["Winnipeg", "Brandon", "Steinbach", "Thompson"],
  },
  {
    region: "Saskatchewan",
    country: "Canada",
    areas: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw"],
  },
  {
    region: "Nova Scotia",
    country: "Canada",
    areas: ["Halifax", "Cape Breton / Sydney", "Truro", "Dartmouth"],
  },
];

export function buildLocation(regionIndex: number, locality: string): UserLocation {
  const selectedRegion = locationGroups[regionIndex] ?? locationGroups[0];

  return {
    country: selectedRegion.country,
    region: selectedRegion.region,
    locality,
    label: `${locality}, ${selectedRegion.region}, ${selectedRegion.country}`,
  };
}

export function getDefaultLocation(): UserLocation {
  return buildLocation(0, locationGroups[0].areas[0]);
}
