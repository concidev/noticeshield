"use client";

import { useState, useRef, useCallback } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { buildLocation, locationGroups } from "@/lib/locations";
import type { UserLocation } from "@/lib/types";

interface Props {
  onSubmit: (data: {
    noticeText: string;
    targetLanguage: string;
    location: UserLocation;
    imageBase64?: string;
    imageMimeType?: string;
  }) => void;
  isLoading: boolean;
}

const SAMPLES = [
  {
    type: "Housing",
    title: "Rent Arrears Notice",
    borderColor: "var(--urgent)",
    tagColor: "var(--urgent)",
    tagBg: "var(--error-container)",
    text: `NOTICE TO PAY RENT OR QUIT

To: Tenant(s) at 412 Maple Street, Unit 3B

You are hereby notified that you owe the sum of $1,250 in past-due rent for the months of September and October. You are required to pay this amount in full within 14 DAYS of the date of this notice, or vacate and surrender the premises.

If you fail to pay the rent or vacate within the time period stated above, your landlord will pursue all legal remedies available, including filing an action for eviction with the court.

Date: October 10, 2023
Contact: Springfield Property Management, (555) 234-5678`,
  },
  {
    type: "Medical",
    title: "Insurance Claim Denial",
    borderColor: "var(--urgent)",
    tagColor: "var(--urgent)",
    tagBg: "var(--error-container)",
    text: `NOTICE OF CLAIM DENIAL

Patient: Jane Doe | Member ID: HMP-00234-X
Date of Service: September 14, 2023
Provider: Valley Medical Center

Your claim for services rendered on the above date has been DENIED for the following reason: The procedure (CPT Code 99213) was deemed not medically necessary under your current plan.

Amount Billed: $480.00
Your Responsibility: $480.00

YOU HAVE THE RIGHT TO APPEAL THIS DECISION. To file an appeal, you must submit a written request within 60 DAYS of the date of this notice. Include your member ID, the date of service, and supporting documentation from your provider.

Contact our Member Services at 1-800-555-0222 for assistance.`,
  },
  {
    type: "Legal",
    title: "Court Summons",
    borderColor: "var(--urgent)",
    tagColor: "var(--urgent)",
    tagBg: "var(--error-container)",
    text: `SUMMONS — CIVIL COURT

TO: John Doe
412 Maple Street, Unit 3B
Springfield, IL 62701

YOU ARE HEREBY SUMMONED to appear before the Springfield Civil Court, 200 Court Plaza, Room 4B, on NOVEMBER 15, 2023 at 9:00 AM.

Case No: 2023-CV-04821
Plaintiff: Speedy Lending LLC
Claim: Collection of unpaid debt — $2,340.00

FAILURE TO APPEAR may result in a default judgment being entered against you for the full amount claimed plus court costs. You have the right to contest this claim and to be represented by an attorney.

Court Clerk: (555) 678-9100`,
  },
  {
    type: "Benefits",
    title: "Benefits Reduction Notice",
    borderColor: "var(--warning)",
    tagColor: "#854d0e",
    tagBg: "#fef9c3",
    text: `NOTICE OF CHANGE IN BENEFITS

Recipient: Jane Doe | Case Number: 2023-SNAP-00871

This letter is to inform you that your Supplemental Nutrition Assistance Program (SNAP) benefits will be REDUCED effective December 1, 2023.

Current Monthly Benefit: $320.00
New Monthly Benefit: $190.00
Reason for Change: Reported household income exceeds the allowable threshold for your household size.

If you believe this decision is incorrect, you have the RIGHT TO APPEAL within 30 DAYS of this notice. To request a fair hearing, contact your local benefits office at (555) 789-4400 or visit in person at 500 State Street, Room 12.`,
  },
  {
    type: "Utility",
    title: "Final Disconnect Warning",
    borderColor: "var(--warning)",
    tagColor: "#854d0e",
    tagBg: "#fef9c3",
    text: `FINAL NOTICE — SERVICE DISCONNECTION

Account: #78234-K
Service Address: 412 Maple Street, Unit 3B

Your account has an outstanding balance of $347.50. Despite previous notices, this amount remains unpaid.

IMPORTANT: If payment is not received by November 1, 2023, your electricity service will be disconnected.

To avoid disconnection, please pay the full amount or contact our office at 1-800-555-0100 to discuss a payment plan before the disconnection date.`,
  },
  {
    type: "Immigration",
    title: "Visa Status Termination",
    borderColor: "var(--urgent)",
    tagColor: "var(--urgent)",
    tagBg: "var(--error-container)",
    text: `NOTICE OF F-1 STUDENT VISA STATUS TERMINATION

Name: Maria Gonzalez
Alien Registration Number: A 123-456-789
Current Status: F-1 Student Visa (Active)

This letter is to inform you that your F-1 student visa status has been TERMINATED effective immediately.

Reason: Failure to maintain full-time enrollment as required under 8 C.F.R. § 214.2(f)(6).

You are required to DEPART THE UNITED STATES within 60 DAYS of the date of this notice, or take one of the following corrective actions:
1. File a reinstatement application with USCIS (Form I-539)
2. Transfer to a new SEVP-certified school and restore your status
3. Apply for a change of immigration status

Failure to depart or take corrective action may result in removal proceedings and a multi-year bar on re-entry to the United States.

Contact: Student and Exchange Visitor Program (SEVP): 1-703-603-3400
Date of Notice: October 15, 2023`,
  },
];

const MAX_IMAGE_SIZE_MB = 5;

export function NoticeUploader({ onSubmit, isLoading }: Props) {
  const [noticeText, setNoticeText] = useState("");
  const [regionIndex, setRegionIndex] = useState(0);
  const [locality, setLocality] = useState(locationGroups[0].areas[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLocation = buildLocation(regionIndex, locality);

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    setImageFile(file);
    setShowTextInput(false);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      onSubmit({ noticeText: noticeText.trim(), targetLanguage: "en", location: selectedLocation, imageBase64: base64, imageMimeType: imageFile.type });
    } else {
      onSubmit({ noticeText: noticeText.trim(), targetLanguage: "en", location: selectedLocation });
    }
  };

  const canSubmit = !isLoading && (imageFile !== null || noticeText.trim().length > 20);
  const hasInput = imageFile !== null || noticeText.trim().length > 0;

  return (
    <div className="notice-uploader" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div className="uploader-controls" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <LocationSelector
          regionIndex={regionIndex}
          locality={locality}
          onChange={(nextRegionIndex, nextLocality) => {
            setRegionIndex(nextRegionIndex);
            setLocality(nextLocality);
          }}
        />

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          background: "var(--secondary-container)",
          borderRadius: 8,
        }}>
          <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontSize: 18, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>translate</span>
          <span className="text-label-sm" style={{ color: "var(--on-secondary-container)" }}>
            Translation into 12 languages available after analysis
          </span>
        </div>
      </div>

      {imagePreview && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--outline-variant)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
        }}>
          <img
            src={imagePreview}
            alt="Notice preview"
            style={{ maxHeight: 200, borderRadius: 6, objectFit: "contain", maxWidth: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span className="text-label-sm" style={{ color: "var(--outline)" }}>{imageFile?.name}</span>
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {!imagePreview && !showTextInput && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button
            onClick={() => cameraInputRef.current?.click()}
            aria-label="Take a photo of your notice using the camera"
            style={{
              background: "var(--surface)", border: "1px solid var(--outline-variant)",
              borderRadius: 12, padding: 20,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              cursor: "pointer", height: 128,
              boxShadow: "0 4px 12px rgba(0,53,95,0.05)", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-fixed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <span className="text-label-md" style={{ color: "var(--on-surface)" }}>Take Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload a notice file from your device (image or PDF)"
            style={{
              background: "var(--surface)", border: "1px solid var(--outline-variant)",
              borderRadius: 12, padding: 20,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              cursor: "pointer", height: 128,
              boxShadow: "0 4px 12px rgba(0,53,95,0.05)", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--secondary-fixed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            </div>
            <span className="text-label-md" style={{ color: "var(--on-surface)" }}>Upload File</span>
          </button>

          <button
            onClick={() => setShowTextInput(true)}
            aria-label="Paste or type the notice text manually"
            style={{
              gridColumn: "span 2",
              background: "var(--surface)", border: "1px solid var(--outline-variant)",
              borderRadius: 12, padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
              cursor: "pointer", height: 48,
              boxShadow: "0 4px 12px rgba(0,53,95,0.05)", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>content_paste</span>
            <span className="text-label-md" style={{ color: "var(--on-surface)" }}>Paste Text Manually</span>
          </button>
        </div>
      )}

      {showTextInput && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder={`Paste the text of your notice here…\n\nExample: "NOTICE TO QUIT — You are required to vacate the premises within 3 days…"`}
            rows={7}
            autoFocus
            style={{
              width: "100%", borderRadius: 8,
              border: "1px solid var(--outline-variant)",
              background: "var(--surface)", padding: "14px 16px",
              fontSize: 16, fontFamily: "inherit", color: "var(--on-surface)",
              resize: "none", outline: "none", lineHeight: "1.6", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.borderWidth = "2px"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.borderWidth = "1px"; }}
          />
          <button
            onClick={() => { setNoticeText(""); setShowTextInput(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--outline)", fontSize: 13, fontFamily: "inherit", alignSelf: "flex-end" }}
          >
            Back to options
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, height: 1, background: "var(--outline-variant)" }} />
        <span className="text-label-sm" style={{ color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Or Try a Sample</span>
        <div style={{ flex: 1, height: 1, background: "var(--outline-variant)" }} />
      </div>

      <div className="sample-grid" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SAMPLES.map((s) => (
          <button
            key={s.type}
            aria-label={`Analyze sample: ${s.title}`}
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
              onSubmit({ noticeText: s.text, targetLanguage: "en", location: selectedLocation });
            }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--outline-variant)",
              borderLeft: `4px solid ${s.borderColor}`,
              borderRadius: 8, padding: "16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,53,95,0.03)",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            <div>
              <span className="text-label-sm" style={{
                color: s.tagColor, background: s.tagBg,
                padding: "2px 8px", borderRadius: 9999,
                display: "inline-block", marginBottom: 4,
              }}>
                {s.type}
              </span>
              <h3 className="text-label-md" style={{ color: "var(--on-surface)", margin: 0 }}>{s.title}</h3>
            </div>
            <span className="material-symbols-outlined" style={{ color: "var(--outline)", fontSize: 18 }}>arrow_forward_ios</span>
          </button>
        ))}
      </div>

      {(hasInput || showTextInput) && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%", height: 48,
            background: canSubmit ? "var(--primary)" : "var(--outline-variant)",
            color: canSubmit ? "var(--on-primary)" : "var(--on-surface-variant)",
            borderRadius: 8, border: "none",
            fontSize: 14, fontWeight: 600, fontFamily: "inherit",
            cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: canSubmit ? "0 8px 16px rgba(0,53,95,0.15)" : "none",
            transition: "all 0.15s",
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                display: "inline-block", width: 18, height: 18,
                border: "2.5px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              Analyzing notice…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>analytics</span>
              Analyze Notice
            </>
          )}
        </button>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf"
        style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; resolve(r.split(",")[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
