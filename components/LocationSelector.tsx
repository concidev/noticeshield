"use client";

import { buildLocation, locationGroups } from "@/lib/locations";
import type { UserLocation } from "@/lib/types";

interface Props {
  regionIndex: number;
  locality: string;
  onChange: (regionIndex: number, locality: string, location: UserLocation) => void;
  description?: string;
}

export function LocationSelector({ regionIndex, locality, onChange, description }: Props) {
  const selectedRegion = locationGroups[regionIndex] ?? locationGroups[0];

  const handleRegionChange = (nextIndex: number) => {
    const nextLocality = locationGroups[nextIndex].areas[0];
    onChange(nextIndex, nextLocality, buildLocation(nextIndex, nextLocality));
  };

  const handleLocalityChange = (nextLocality: string) => {
    onChange(regionIndex, nextLocality, buildLocation(regionIndex, nextLocality));
  };

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--outline-variant)",
      borderRadius: 8,
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      boxShadow: "0 4px 12px rgba(0,53,95,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="material-symbols-outlined" style={{ color: "var(--outline)", fontSize: 22 }}>location_on</span>
        <div>
          <span className="text-label-md" style={{ color: "var(--on-surface)", display: "block" }}>Where are you?</span>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
            {description ?? "Used to suggest nearby aid and jurisdiction-specific resources."}
          </span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <select
          value={regionIndex}
          onChange={(e) => handleRegionChange(Number(e.target.value))}
          style={{
            minWidth: 0,
            background: "var(--surface-low)",
            border: "1px solid var(--outline-variant)",
            borderRadius: 8,
            padding: "10px 8px",
            fontSize: 14,
            fontFamily: "inherit",
            color: "var(--primary)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {locationGroups.map((group, index) => (
            <option key={`${group.country}-${group.region}`} value={index}>
              {group.region}
            </option>
          ))}
        </select>
        <select
          value={locality}
          onChange={(e) => handleLocalityChange(e.target.value)}
          style={{
            minWidth: 0,
            background: "var(--surface-low)",
            border: "1px solid var(--outline-variant)",
            borderRadius: 8,
            padding: "10px 8px",
            fontSize: 14,
            fontFamily: "inherit",
            color: "var(--primary)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {selectedRegion.areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
