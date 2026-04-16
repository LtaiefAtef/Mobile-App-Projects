import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import  Constants  from "expo-constants";
import { getToken } from "@/services/api";
import { Client, IMessage } from "@stomp/stompjs";
import { Session, SessionData, SessionState, SharedAccidentReportContextType } from "@/constants/appData";
import { router } from "expo-router";
import { checkIfAuthor, getUser } from "@/services/auth";
// --- Session Config ---
const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
const API_BASE =`http://${host}:8081/sessions/`;
const WS_URL = `ws://${host}:8081/ws`;

// --- api Helper ---
const api = async(path: string, opts: RequestInit = {}) : Promise<Session | null>=>{
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`,{
        headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${token}`
        },
        ...opts
    })
    if(!res.ok){
        const text = await res.text();
        throw new Error(`API Error: ${res.status} - ${text}`);
    }
    return res.status === 204 ? null : res.json();
}

// --- Context ---
const SharedAccidentReportContext = createContext<SharedAccidentReportContextType | null>(null);

//  --- Provider ---
export function SharedAccidentReportProvider({ children }: { children: ReactNode}){
    //  --- Session Data ---
    const [sessionData, setSessionData] = useState<SessionData | null>(null)
    // --- report Ref ---
    const reportRef = useRef(null);
    // --- Loader ---
    const [loadingSession, setLoadingSession] = useState(false);
    // --- Client ---
    const clientRef = useRef<Client | null>(null);
    // --- Update Session Function ---
    const updateSession = ( value: any) => {
        setSessionData(value as SessionData);
    }
    // --- Loading Toggler Function ---
    const toggleLoadingSession = () => { 
        setLoadingSession(!loadingSession)
    }
    // --- Create Session Function ---
    const createSession = useCallback(async(user:string)=>{
        setLoadingSession(true)
        const s : Session | null  = await api("create",{
            method:"POST",
            body: JSON.stringify({ username:user })
        })
        updateSession({...s});
        if(!s?.code){
            return null;
        }
        connectWS(s.code);
        return s;
    },[])
    // --- Join Session Function ---
    const joinSession = async(code:string, user:string)=>{
        const s = await api("join",{
            method:"POST",
            body: JSON.stringify({ code,username:user })
        })
        if(!s?.code){
            return null;
        }
        connectWS(s.code);
        updateSession({ ...s });
        return s;
    }
    // --- Connect To WebSocket Function ---
    const connectWS = useCallback( async(code: string) => {
        if(!code){
            console.log("No Session Code");
            return;
        }
        const client = new Client({
            webSocketFactory: () => {
                const ws = new WebSocket(WS_URL);
                ws.binaryType = "arraybuffer"
                return ws
            },
            reconnectDelay: 5000,
            heartbeatIncoming:0,
            heartbeatOutgoing:0,
            forceBinaryWSFrames:true,
            appendMissingNULLonIncoming:true,
            debug: (msg) => console.log(`[STOMP] ${msg}`),
            onConnect: () => {
                setSessionData(prev => ({
                    ...prev,
                    logs: [...(prev?.logs || []), "WebSocket Connected!"]
                }) as SessionData);

                client.subscribe(`/topic/session/${code}`, async(frame: IMessage) => {
                    const msg = JSON.parse(frame.body);
                    if(msg.type === "USER_JOINED"){
                        setSessionData((prev)=>{
                            if(!prev){
                                return prev;
                            }
                            return { ...prev, participants: [...(prev?.participants ?? []), msg.sender ], status:"ACTIVE" }
                        })
                    }
                    // --- Update Data Case ---
                    /* This if case update Shared Data of the session between two users */
                    if(msg.type === "DATA_UPDATE"){
                        const payload : SessionState = JSON.parse(msg.payload);
                        const user = await getUser();
                        const isAuthor = await checkIfAuthor(user ?? "") ;
                        // --- Case the Host Started the Accident Report Session ---
                        if( isAuthor && payload.sender != user && payload.redirect == true){
                            router.push("/(accident_report)/step-2");
                            setSessionData((prev)=>{
                                if(!prev) return prev;
                                return {...prev, sharedData:{ ...prev.sharedData, user1Progress:payload.user1Progress,user2Progress:payload.user2Progress }}
                            })
                        }
                        // --- Case both users completed their accident and they have to share both their report data ---
                        console.log("CASE BOTH USERS", payload.sender, user);
                        console.log(!isAuthor && payload.sender != user && Number(payload.user1Progress) == 6);
                        console.log(isAuthor && payload.sender != user && Number(payload.user2Progress) == 6);
                        // --- Case User 1 (HOST) ---
                        if( isAuthor && payload.sender != user && Number(payload.user2Progress) == 6){
                            console.log("HOST REPORT");
                            reportRef.current = payload.report as any;
                            setSessionData((prev) => {
                            if (!prev) {
                                return prev;
                            }
                            return {
                                ...prev,
                                sharedData: {
                                ...payload,
                                report: {
                                    driver: {
                                    driverB: payload.report.driver.driverB
                                    },
                                    insuranceCompany: {
                                    vehicleB: payload.report.insuranceCompany.vehicleB
                                    },
                                    visibiledamage: {
                                    vehicleB: payload.report.visibiledamage.vehicleB
                                    },
                                    circumstances: {
                                    vehicleB: payload.report.circumstances.vehicleB
                                    },
                                    signatures: {
                                    vehicleB: payload.report.signatures.vehicleB
                                    },
                                }
                                }
                            }
                            })                          
                        }
                        // --- Case User 2 (GUEST) ---
                        else if(!isAuthor && payload.sender != user && Number(payload.user1Progress) == 6){
                            console.log("GUEST REPORT");
                            reportRef.current = sessionData?.sharedData.report
                            setSessionData((prev) => {
                                if(!prev){
                                    return prev;
                                }
                                return {
                                    ...prev,
                                    sharedData: {
                                        ...payload,
                                        report: {
                                            accidentDate:payload.report.accidentDate,
                                            accidentLocation:payload.report.accidentLocation,
                                            injuries:{ ...payload.report.injuries },
                                            otherVehiclesDamaged:{...payload.report.otherVehiclesDamaged},
                                            witnesses:[...(payload.report.witnesses ?? [])],
                                            driver: {
                                                driverA: payload.report.driver.driverA
                                            },
                                            insuranceCompany: {
                                                vehicleA: payload.report.insuranceCompany.vehicleA
                                            },
                                            visibiledamage: {
                                                vehicleA: payload.report.visibiledamage.vehicleA
                                            },
                                            circumstances: {
                                                vehicleA: payload.report.circumstances.vehicleA
                                            },
                                            signatures: {
                                                vehicleA: payload.report.signatures.vehicleA
                                            },
                                        }
                                    }
                                }
                            })
                        }
                        // --- Case for Traking and updating the Users Progress ---
                        console.log("Progress1: ", payload.user1Progress, sessionData?.sharedData.user1Progress)
                        console.log("Progress2: ", payload.user2Progress, sessionData?.sharedData.user2Progress)
                        if(Number(payload.user1Progress) > Number(sessionData?.sharedData.user1Progress)){
                            setSessionData((prev)=>{
                                if(!prev) return prev;
                                return {...prev, sharedData:{ ...prev.sharedData, user1Progress:payload.user1Progress }}
                            })
                        } else if(Number(payload.user2Progress) > Number(sessionData?.sharedData.user2Progress)){
                            setSessionData((prev)=>{
                                if(!prev) return prev;
                                return { ...prev, sharedData:{ ...prev.sharedData, user2Progress:payload.user2Progress }}
                            })
                        }
                    }

                });
            },
            onStompError: (frame) => {
            console.log("Broker error:", frame.headers["message"]);
            },
            onWebSocketError: (err) => {
                console.log("WebSocket error:", err);
            },
            onUnhandledFrame: (frame) => {
                console.log("Unhandled frame", frame);
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
            }
        });
        client.activate();
        clientRef.current = client;
    }, []);
    // --- Update Backend Session Function ---
    const updateBackendSession = (sharedData : SessionState) => {
        setSessionData((prev : SessionData | null ) => {
            if(!prev) return prev;
            return ({ ...prev, sharedData })
        })
        const s = api("update",{
            method:"POST",
            body: JSON.stringify({ code: sessionData?.code, username: sharedData.sender , sharedData : JSON.stringify({...sharedData}) })
        })
        return s;
    }
    // --- Send Message Function ---
    const sendMessage = (sessionId: string, msg: IMessage) => {
        if(!clientRef.current || !clientRef.current.connected){
            return;
        }
        clientRef.current.publish({
            destination: `topic/session/${sessionId}`,
            body: JSON.stringify(msg)
        })
    }
    return (
        <SharedAccidentReportContext.Provider value={{ reportRef,sessionData:sessionData, updateSession,
         connectWS, loadingSession, toggleLoadingSession, createSession, joinSession, updateBackendSession, sendMessage }}>
            {children}
        </SharedAccidentReportContext.Provider>
    )
}

// --- Hook ---
export function useSharedAccidentReport(){
    const ctx = useContext(SharedAccidentReportContext);
    if(!ctx){
        throw new Error("useSharedAccidentReport must be used inside <AccidentReportProvider>");
    }
    return ctx;
}