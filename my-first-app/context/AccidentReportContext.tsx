// context/AccidentReportContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// --- Types ---
type CircumstancesVehicle = {
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
  report: ReportData;
  update: (patch: DeepPartial<ReportData>) => void;
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
    <AccidentReportContext.Provider value={{ report, update, toggleCircumstance, resetReport }}>
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