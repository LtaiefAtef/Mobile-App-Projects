import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";
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
            reportDataRef: {} as RefObject<ReportData>
        },
        sender:"",
        sharedReport: null,
        updatedAt: new Date(),
        status: "WAITING",
        logs: [],
        error: null,
        action: ""
    }
// --- Context ---
const SharedAccidentReportContext = createContext<SharedAccidentReportContextType | null>(null);

//  --- Provider ---
export function SharedAccidentReportProvider({ children }: { children: ReactNode}){

    //  --- Session Data ---
    const [sessionData, setSessionData] = useState<SessionData>(defaultSession);
    // --- SessionDataRef ---
    const sessionDataRef = useRef<SessionData>(defaultSession);
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
    const createSession = async(user:string)=>{
        inSession.current=true;
        setLoadingSession(true)
        const s : SessionData | null  = await api("create",{
            method:"POST",
            body: JSON.stringify({ username:user })
        })
        if(!s?.code){
            return null;
        }
        sessionDataRef.current = s;
        setSessionData((prev) => ({...prev, ...s}));
        connectWS(s.code);
        return s;
    }
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
        sessionDataRef.current = s;
        setSessionData((prev)=>({...prev, ...s}))
        connectWS(s.code);
        return s;
    }
    // --- Connect To WebSocket Function ---
    const connectWS = useCallback( async(code: string) => {
        if(!code){
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
                        const isAuthor = await checkIfAuthor(sessionDataRef.current?.createdBy ?? "");
                        switch(payload.action){
                            case "start session":
                                console.log("start session");
                                setSessionData((prev) => ({...prev, sharedData: { ...payload } })) 
                                sessionDataRef.current = {...sessionDataRef.current , sharedData : payload }
                                if(isAuthor){
                                    return router.push("/(accident_report)/step-1");
                                }else{
                                    return router.push("/(accident_report)/step-3");
                                }
                            case "progress":
                                console.log("progress");
                                setTimeout(() => {
                                    if(payload.sender != user && isAuthor){
                                        if(sessionData.sharedData.user2Progress < payload.user2Progress ){
                                            setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user2Progress:payload.user2Progress } }))
                                        }
                                        return;
                                    }
                                    if(sessionData.sharedData.user1Progress < payload.user1Progress ){
                                        setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user1Progress:payload.user1Progress } }))
                                    }
                                    return;
                                }, 1000);
                            case "final":
                                console.log("final");
                                if(payload.sender != user){
                                    if(isAuthor){
                                        sessionDataRef.current = { ...sessionDataRef.current , sharedData : {...sessionDataRef.current.sharedData, reportDataRef: payload.reportDataRef,
                                            user2Progress:payload.user2Progress
                                         } }
                                        setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user2Progress:payload.user2Progress } }))
                                        return;
                                    }
                                    sessionDataRef.current = { ...sessionDataRef.current , sharedData : {...sessionDataRef.current.sharedData, reportDataRef: payload.reportDataRef,
                                        user1Progress:payload.user1Progress
                                        } }
                                    setSessionData((prev)=> ({...prev, sharedData: { ...prev.sharedData, sender:payload.sender, user1Progress:payload.user1Progress } }))
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
    useEffect(() => {
        return () => {
            if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            }
        };
        }, []);
        const resetSession = () => {
            inSession.current = false;
            if (clientRef.current) {
                clientRef.current.onDisconnect = () => {};
                clientRef.current.onStompError = () => {};
                clientRef.current.onWebSocketError = () => {};
                clientRef.current.onConnect = () => {};
                clientRef.current.reconnectDelay = 0;
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            sessionDataRef.current = defaultSession;
            setLoadingSession(false);
            setSessionData(defaultSession);
        };
    return (
        <SharedAccidentReportContext.Provider value={{ 
            sessionData:sessionData, updateSession,
            connectWS, loadingSession, toggleLoadingSession,
            createSession, joinSession, updateBackendSession,
            sendMessage, setSessionData, inSession, defaultSession,
            sessionDataRef,resetSession
         }}>
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