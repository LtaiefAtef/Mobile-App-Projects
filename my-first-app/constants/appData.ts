import { ReportData } from "@/context/AccidentReportContext";
import { IMessage } from "@stomp/stompjs";

//  INSURANCE COMPANIES AND PLATE TYPES DATA
export const insuranceList = [
  { label: "Please choose your insurance", value: "" },
  { label: "Al Baraka Insurances", value: "Al Baraka Insurances" },
  { label: "ASTREE Insurances", value: "ASTREE Insurances" },
  { label: "At-Takafulia Insurances", value: "At-Takafulia Insurances" },
  { label: "BH Insurance", value: "BH Insurance" },
  { label: "BIAT Insurances", value: "BIAT Insurances" },
  { label: "BNA Insurances", value: "BNA Insurances" },
  { label: "CARTE Insurances", value: "CARTE Insurances" },
  { label: "COMAR Insurances", value: "COMAR Insurances" },
  { label: "CTAMA Insurances", value: "CTAMA Insurances" },
  { label: "GAT Insurances", value: "GAT Insurances" },
  { label: "LLOYD Insurances", value: "LLOYD Insurances" },
  { label: "MAE Insurances", value: "MAE Insurances" },
  { label: "MAGHREBIA Insurances", value: "MAGHREBIA Insurances" },
  { label: "STAR Insurances", value: "STAR Insurances" },
  { label: "Zitouna Takaful Insurances", value: "Zitouna Takaful Insurances" },
];

export const plateTypeList = [
  { label: "Type", value: "" },
  { label: "TUN (Tunisie)", value: "TUN (Tunisie)" },
  { label: "PAT (Personnel administratif et technique)", value: "PAT (Personnel administratif et technique)" },
  { label: "CMD (Chef de mission diplomatique)", value: "CMD (Chef de mission diplomatique)" },
  { label: "CD (Corps diplomatique)", value: "CD (Corps diplomatique)" },
  { label: "MD (Mission diplomatique)", value: "MD (Mission diplomatique)" },
  { label: "RS (Regime suspensif)", value: "RS (Regime suspensif)" },
  { label: "TRAC (Tracteur agricole)", value: "TRAC (Tracteur agricole)" },
  { label: "REM (Remorque)", value: "REM (Remorque)" },
  { label: "ONU (Organisation nation unies)", value: "ONU (Organisation nation unies)" },
  { label: "ONG (Organisation non gouvernementale)", value: "ONG (Organisation non gouvernementale)" },
  { label: "AA (Appareil agricole)", value: "AA (Appareil agricole)" },
  { label: "ES (Engin spécial)", value: "ES (Engin spécial)" },
  { label: "MOTO", value: "MOTO" },
  { label: "IT (Immatriculation temporaire)", value: "IT (Immatriculation temporaire)" },
  { label: "MC (Mission consulaire)", value: "MC (Mission consulaire)" },
  { label: "CC (Corps consulaire)", value: "CC (Corps consulaire)" },
  { label: "WW (Véhicule de l'essai)", value: "WW (Véhicule de l'essai)" },
  { label: "- (Véhicule de l'état)", value: "- (Véhicule de l'état)" },
  { label: "Autre", value: "Autre" },
];
export interface Contract {
  id: string
  contractNumber: string
  insuranceCompany: string
  client: string
  type: 'Auto' | 'Habitation' | 'Santé'
  status: 'En cours' | 'Expiré' | 'Suspendu'
  pack: string
  paymentMethod: string
  startDate: string
  endDate: string
  netPremium: string
  fees: string
  taxes: string
  fg: string
  totalPremium: string
  brand?: string
  registration?: string
  marketValue?: string
  drivingLicenseNumber?: string
  accident_date?: string
}

// --- Interface ---
export interface SharedAccidentReportContextType {
    sessionData: SessionData | null;
    reportRef: any;
    loadingSession: boolean;
    updateSession:(value :any) => void;
    toggleLoadingSession:() => void;
    connectWS:(code :string) => void;
    sendMessage:(sessionId :string, msg :IMessage) => void;
    createSession(user :string | null): Promise<SessionData | null>;
    joinSession(code :string, user :string):Promise<SessionData  | null>;
    updateBackendSession(sharedData : any) : Promise<SessionData | null>;
    setSessionData:(value : any) => void;
}
export type Message = {
  text: string;
}
// --- Session Data Type ---
export type SessionData = {
    code: string;
    createdAt: Date;
    createdBy: string;
    participants: string[] | [];
    sharedData: {
      user1Progress: number;
      user2Progress: number;
      redirect: boolean
      sender: string,
      triggerHostAction: boolean,
      triggerGuestAction: boolean,
      report: ReportData | null
    };
    sender:string;
    action:string;
    sharedReport: string[] | null;
    updatedAt: Date;
    status: "WAITING" | "ACTIVE" | "CLOSED";
    logs: string[] | null;
    error: string[] | null;
}
// --- Session ---
export interface Session {
  id: string;
  code: string;
  createdBy: string;
  participants: any;
  sharedData: any;
  status: "WAITING" | "ACTIVE" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}
// --- Session Progress ---
export interface SessionState{
    user1Progress:number;
    user2Progress:number;
    redirect : boolean;
    sender: string;
    triggerHostAction:boolean;
    triggerGuestAction:boolean;
    report:ReportData
}