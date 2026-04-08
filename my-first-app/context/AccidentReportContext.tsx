// context/AccidentReportContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
// imports for PDF generation and sharing
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// --- Types ---
export type CircumstancesVehicle = {
  parkedStationary: boolean;
  leavingParkingOrDriveway: boolean;
  enteringParkingOrDriveway: boolean;
  exitingParkingLotOrPrivateLand: boolean;
  enteringRoundabout: boolean;
  alreadyInRoundabout: boolean;
  rearEndSameDirection: boolean;
  changingLanes: boolean;
  overtaking: boolean;
  turningRight: boolean;
  turningLeft: boolean;
  reversing: boolean;
  crossingWrongSideOfRoad: boolean;
  crossingIntersection: boolean;
  ranRedLight: boolean;
  failedToYieldRightOfWay: boolean;
  totalChecked: number;
};

type Witness = {
  full_name: string;
  address: string;
  isPassangerOfVehicle: boolean;
};

type Signature = {
  signed: boolean;
  signedAt: string;
  svgData?: string;
};

export type ReportData = {
  submittedAt: string;
  accidentDate: string;
  accidentLocation: string;
  injuries: {
    anyInjuries: boolean;
    injuryDetails: string | null;
  };
  otherVehiclesDamaged: {
    otherVehicleInvolved: boolean;
    numberOfVehicles: number;
  };
  witnesses: Witness[];
  insuranceCompany: {
    vehicleA: { companyName: string; contractNumber: string };
    vehicleB: { companyName: string; contractNumber: string };
  };
  driver: {
    driverA: { fullName: string; address: string; dateOfBirth: string; license: string };
    driverB: { fullName: string; address: string; dateOfBirth: string; license: string };
  };
  visibiledamage: {
    vehicleA: string;
    vehicleB: string;
  };
  circumstances: {
    vehicleA: CircumstancesVehicle;
    vehicleB: CircumstancesVehicle;
  };
  sketchImageUrl: string;
  signatures: {
    vehicleA: Signature;
    vehicleB: Signature;
  };
  accidentPerspective: {
    driverA: string;
    driverB: string;
  };
};

// --- Utility types ---
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// --- Deep merge helper ---
function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base };
  for (const key in patch) {
    const patchVal = patch[key];
    const baseVal = base[key];
    if (patchVal && typeof patchVal === "object" && !Array.isArray(patchVal)) {
      result[key] = deepMerge(baseVal as any, patchVal as any);
    } else {
      result[key] = patchVal as any;
    }
  }
  return result;
}
  async function downloadReport(report: ReportData) {
    console.log("Downloading Report");

    const renderSignature = (
      signed: boolean,
      signedAt?: string,
      svgData?: string
    ): string => {
      if (!signed) return `<span class="badge-unsigned">✗ Not signed</span>`;

      if (svgData) {
        // svgData is already a full SVG string — inline it directly, no <img> needed
        const inlineSvg = svgData
          .replace(/data:image\/svg\+xml,/, "")   // strip data URI prefix if present
          .replace(/%3C/gi, "<")
          .replace(/%3E/gi, ">")
          .replace(/%20/g, " ")
          .replace(/%2C/g, ",")
          .replace(/%22/g, '"')
          .replace(/%27/g, "'")
          .replace(/%2F/g, "/")
          .replace(/%0A/g, "")
          .replace(/%3D/g, "=")
          .replace(/%23/g, "#");

        return `
          <div style="border:1px solid #E2E0D8; border-radius:8px; padding:12px; background:#FAFAF8; display:inline-block;">
            <div style="width:280px; height:120px; overflow:hidden;">
              ${inlineSvg}
            </div>
            <div style="border-top:1px solid #E2E0D8; margin-top:8px; padding-top:6px; font-size:11px; color:#7A7870; text-align:center;">
              ✓ Signed on ${signedAt ?? "—"}
            </div>
          </div>`;
      }

      return `<span class="badge-signed">✓ Signed on ${signedAt ?? "—"}</span>`;
    };

    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1A1A18; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #E2E0D8; padding-bottom: 4px; }
            .subtitle { color: #7A7870; font-size: 13px; margin-bottom: 32px; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F0EFE9; font-size: 13px; }
            .row-sig { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #F0EFE9; font-size: 13px; }
            .label { color: #4A4844; font-weight: 600; }
            .value { color: #1A1A18; text-align: right; max-width: 60%; }
            .badge-signed { color: #4CAF50; font-weight: 600; }
            .badge-unsigned { color: #C0392B; font-weight: 600; }
            .empty { color: #7A7870; font-style: italic; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Accident Report</h1>
          <p class="subtitle">Submitted on ${report.submittedAt || new Date().toLocaleDateString("fr-TN")}</p>

          <h2>Accident Info</h2>
          <div class="row"><span class="label">Date</span><span class="value">${report.accidentDate || "—"}</span></div>
          <div class="row"><span class="label">Location</span><span class="value">${report.accidentLocation || "—"}</span></div>
          <div class="row"><span class="label">Injuries</span><span class="value">${report.injuries.anyInjuries ? report.injuries.injuryDetails ?? "Yes" : "None"}</span></div>
          <div class="row"><span class="label">Other vehicles</span><span class="value">${report.otherVehiclesDamaged.otherVehicleInvolved ? `${report.otherVehiclesDamaged.numberOfVehicles} vehicle(s)` : "None"}</span></div>

          <h2>Driver A</h2>
          <div class="row"><span class="label">Full Name</span><span class="value">${report.driver.driverA.fullName || "—"}</span></div>
          <div class="row"><span class="label">Address</span><span class="value">${report.driver.driverA.address || "—"}</span></div>
          <div class="row"><span class="label">Date of Birth</span><span class="value">${report.driver.driverA.dateOfBirth || "—"}</span></div>
          <div class="row"><span class="label">License</span><span class="value">${report.driver.driverA.license || "—"}</span></div>
          <div class="row"><span class="label">Insurance</span><span class="value">${report.insuranceCompany.vehicleA.companyName || "—"}</span></div>
          <div class="row"><span class="label">Contract No.</span><span class="value">${report.insuranceCompany.vehicleA.contractNumber || "—"}</span></div>
          <div class="row"><span class="label">Visible Damage</span><span class="value">${report.visibiledamage.vehicleA || "—"}</span></div>
          <div class="row"><span class="label">Circumstances</span><span class="value">${report.circumstances.vehicleA.totalChecked} selected</span></div>
          <div class="row"><span class="label">Perspective</span><span class="value">${report.accidentPerspective.driverA || "—"}</span></div>
          <div class="row-sig">
            <span class="label">Signature</span>
            <span class="value">${renderSignature(
              report.signatures.vehicleA.signed,
              report.signatures.vehicleA.signedAt,
              report.signatures.vehicleA.svgData
            )}</span>
          </div>

          <h2>Driver B</h2>
          <div class="row"><span class="label">Full Name</span><span class="value">${report.driver.driverB.fullName || "—"}</span></div>
          <div class="row"><span class="label">Address</span><span class="value">${report.driver.driverB.address || "—"}</span></div>
          <div class="row"><span class="label">Date of Birth</span><span class="value">${report.driver.driverB.dateOfBirth || "—"}</span></div>
          <div class="row"><span class="label">License</span><span class="value">${report.driver.driverB.license || "—"}</span></div>
          <div class="row"><span class="label">Insurance</span><span class="value">${report.insuranceCompany.vehicleB.companyName || "—"}</span></div>
          <div class="row"><span class="label">Contract No.</span><span class="value">${report.insuranceCompany.vehicleB.contractNumber || "—"}</span></div>
          <div class="row"><span class="label">Visible Damage</span><span class="value">${report.visibiledamage.vehicleB || "—"}</span></div>
          <div class="row"><span class="label">Circumstances</span><span class="value">${report.circumstances.vehicleB.totalChecked} selected</span></div>
          <div class="row"><span class="label">Perspective</span><span class="value">${report.accidentPerspective.driverB || "—"}</span></div>
          <div class="row-sig">
            <span class="label">Signature</span>
            <span class="value">${renderSignature(
              report.signatures.vehicleB.signed,
              report.signatures.vehicleB.signedAt,
              report.signatures.vehicleB.svgData
            )}</span>
          </div>

          ${report.witnesses.length > 0 ? `
          <h2>Witnesses</h2>
          ${report.witnesses.map((w, i) => `
            <div class="row"><span class="label">Witness ${i + 1}</span><span class="value">${w.full_name || "—"}</span></div>
            <div class="row"><span class="label">Address</span><span class="value">${w.address || "—"}</span></div>
            <div class="row"><span class="label">Passenger</span><span class="value">${w.isPassangerOfVehicle ? "Yes" : "No"}</span></div>
          `).join("")}` : ""}
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html });
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  }
// --- Default state ---
const defaultCircumstances: CircumstancesVehicle = {
  parkedStationary: false,
  leavingParkingOrDriveway: false,
  enteringParkingOrDriveway: false,
  exitingParkingLotOrPrivateLand: false,
  enteringRoundabout: false,
  alreadyInRoundabout: false,
  rearEndSameDirection: false,
  changingLanes: false,
  overtaking: false,
  turningRight: false,
  turningLeft: false,
  reversing: false,
  crossingWrongSideOfRoad: false,
  crossingIntersection: false,
  ranRedLight: false,
  failedToYieldRightOfWay: false,
  totalChecked: 0,
};

const defaultReport: ReportData = {
  submittedAt: "",
  accidentDate: "",
  accidentLocation: "",
  injuries: {
    anyInjuries: false,
    injuryDetails: null,
  },
  otherVehiclesDamaged: {
    otherVehicleInvolved: false,
    numberOfVehicles: 1,
  },
  witnesses: [],
  insuranceCompany: {
    vehicleA: { companyName: "", contractNumber: "" },
    vehicleB: { companyName: "", contractNumber: "" },
  },
  driver: {
    driverA: { fullName: "", address: "", dateOfBirth: "", license: "" },
    driverB: { fullName: "", address: "", dateOfBirth: "", license: "" },
  },
  visibiledamage: {
    vehicleA: "",
    vehicleB: "",
  },
  circumstances: {
    vehicleA: defaultCircumstances,
    vehicleB: defaultCircumstances,
  },
  sketchImageUrl: "",
  signatures: {
    vehicleA: { signed: false, signedAt: "" },
    vehicleB: { signed: false, signedAt: "" },
  },
  accidentPerspective: {
    driverA: "",
    driverB: "",
  },
};

// --- Context type ---
type AccidentReportContextType = {
  selectedDriver: "driverA" | "driverB";
  switchDriver: () => void;
  report: ReportData;
  update: (patch: DeepPartial<ReportData>) => void;
  downloadReport: (report: ReportData) => void;
  toggleCircumstance: (
    vehicle: "vehicleA" | "vehicleB",
    key: keyof Omit<CircumstancesVehicle, "totalChecked">
  ) => void;
  resetReport: () => void;
};

// --- Context ---
const AccidentReportContext = createContext<AccidentReportContextType | null>(null);

// --- Provider ---
export function AccidentReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ReportData>(defaultReport);
  // --- Current Driver ---
  const [selectedDriver, setSelectedDriver] = useState<"driverA" | "driverB">("driverA");
  // --- Switch Selected Driver function ---
  const switchDriver = () => setSelectedDriver(prev => (prev === "driverA" ? "driverB" : "driverA"));
  // --- Update function with deep merge ---
  const update = (patch: DeepPartial<ReportData>) =>
    setReport(prev => deepMerge(prev, patch));

  const toggleCircumstance = (
    vehicle: "vehicleA" | "vehicleB",
    key: keyof Omit<CircumstancesVehicle, "totalChecked">
  ) =>
    setReport(prev => {
      const current = prev.circumstances[vehicle];
      const updated = { ...current, [key]: !current[key] };
      updated.totalChecked = Object.entries(updated).filter(
        ([k, v]) => k !== "totalChecked" && v === true
      ).length;
      return {
        ...prev,
        circumstances: { ...prev.circumstances, [vehicle]: updated },
      };
    });

  const resetReport = () => setReport(defaultReport);

  return (
    <AccidentReportContext.Provider value={{ report, update, downloadReport, toggleCircumstance, resetReport, selectedDriver, switchDriver }}>
      {children}
    </AccidentReportContext.Provider>
  );
}

// --- Hook ---
export function useAccidentReport() {
  const ctx = useContext(AccidentReportContext);
  if (!ctx) throw new Error("useAccidentReport must be used inside <AccidentReportProvider>");
  return ctx;
}