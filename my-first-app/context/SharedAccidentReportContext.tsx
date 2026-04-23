import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import  Constants  from "expo-constants";
import { getToken } from "@/services/api";
import { Client, IMessage } from "@stomp/stompjs";
import { Session, SessionData, SessionState, SharedAccidentReportContextType } from "@/constants/appData";
import { router } from "expo-router";
import { checkIfAuthor, getUser } from "@/services/auth";
import { ReportData } from "./AccidentReportContext";
// --- Session Config ---
const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
const API_BASE =`http://${host}:8081/sessions/`;
const WS_URL = `ws://${host}:8081/ws`;

// --- api Helper ---
const api = async(path: string, opts: RequestInit = {}) : Promise<SessionData | null>=>{
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
    // -- Default Session value ---
    const defaultSession :SessionData = {
        code: "",
        createdAt: new Date(),
        createdBy: "",
        participants: [],
        sharedData: {
            user1Progress: 0,
            user2Progress: 0,
            redirect: false,
            sender: "",
            triggerHostAction: false,
            triggerGuestAction: false,
            report: {} as ReportData
        },
        sender:"",
        sharedReport: null,
        updatedAt: new Date(),
        status: "WAITING",
        logs: [],
        error: null,
        action: ""
    }
    //  --- Session Data ---
    const [sessionData, setSessionData] = useState<SessionData>(defaultSession);
    // --- report Ref ---
    const reportRef = useRef(null);
    // --- Session Data is present ---
    const inSession = useRef(false);
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
        inSession.current=true;
        setLoadingSession(true)
        const s : SessionData | null  = await api("create",{
            method:"POST",
            body: JSON.stringify({ username:user })
        })
        setSessionData((prev) => ({...prev, ...s}));
        if(!s?.code){
            return null;
        }
        connectWS(s.code);
        return s;
    },[])
    // --- Join Session Function ---
    const joinSession = async(code:string, user:string)=>{
        inSession.current=true;
        const s = await api("join",{
            method:"POST",
            body: JSON.stringify({ code,username:user })
        })
        if(!s?.code){
            return null;
        }
        connectWS(s.code);
        setSessionData((prev)=>({...prev, ...s}))
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
                        const payload = JSON.parse(msg.payload);
                        const user = await getUser();
                        const isAuthor = await checkIfAuthor(user ?? "") ;
                        switch(payload.action){
                            case "start session":
                                if(payload.sender != user){
                                    router.push("/(accident_report)/step-2");
                                    setSessionData((prev) => ({...prev, sharedData: { ...payload } })) 
                                    return;
                                }
                                setSessionData((prev) => ({...prev, sharedData: { ...payload } })) 
                                router.push("/(accident_report)/step-1");
                                return;
                            case "progress":
                                if(payload.sender != user && isAuthor){
                                    setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user2Progress:payload.user2Progress } }))
                                    return;
                                }
                                setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user1Progress:payload.user1Progress } }))
                                return;
                            case "final":
                                if(payload.sender != user){
                                    setSessionData((prev) => ({...prev, sharedData: { ...payload } }))
                                    return;
                                }
                            default:
                                break;
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
         connectWS, loadingSession, toggleLoadingSession, createSession, joinSession, updateBackendSession, sendMessage, setSessionData, inSession, defaultSession }}>
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