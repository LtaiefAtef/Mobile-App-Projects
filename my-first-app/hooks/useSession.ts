import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { getToken } from "@/services/api";
import Constants from "expo-constants";

// ─── Config ────────────────────────────────────────────────────────────────────
const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
const API_BASE = `http://${host}:8081/sessions/`;
const WS_URL   = `ws://${host}:8081/ws`;

// ─── Types ─────────────────────────────────────────────────────────────────────
export type SessionStatus = "WAITING" | "ACTIVE" | "CLOSED";

export type MessageType =
  | "USER_JOINED"
  | "USER_LEFT"
  | "DATA_UPDATE"
  | "SESSION_CLOSED"
  | "PING"
  | "SYSTEM"
  | "ERROR";

export interface Session {
  id: string;
  code: string;
  createdBy: string;
  participants: string[];
  sharedData: string | null;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: number;
  type: MessageType;
  text: string;
  time: string;
}

interface WsMessage {
  type: MessageType;
  sender: string;
  sessionCode: string;
  payload?: string;
  timestamp: number;
}

export interface UseSessionReturn {
  session: Session | null;
  participants: string[];
  sharedData: string;
  log: LogEntry[];
  wsReady: boolean;
  connected: boolean;        // true when ≥2 participants are in the session
  loading: boolean;
  error: string;
  createSession: () => Promise<Session | null>;
  joinSession: (code: string) => Promise<Session | null>;
  pushData: (data: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  setError: (msg: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const api = async <T>(path: string, opts: RequestInit = {}): Promise<T> => {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? (null as T) : (res.json() as Promise<T>);
};

const timestamp = (): string =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useSession(username: string): UseSessionReturn {
  const [session, setSession]           = useState<Session | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [sharedData, setSharedData]     = useState<string>("");
  const [log, setLog]                   = useState<LogEntry[]>([]);
  const [wsReady, setWsReady]           = useState<boolean>(false);
  const [connected, setConnected]       = useState<boolean>(false); // ≥2 users
  const [loading, setLoading]           = useState<boolean>(false);
  const [error, setError]               = useState<string>("");

  const stompRef    = useRef<Client | null>(null);
  const usernameRef = useRef<string>(username);
  useEffect(() => { usernameRef.current = username; }, [username]);

  // ── Logging ────────────────────────────────────────────────────────────────
  const addLog = useCallback((type: MessageType, text: string): void => {
    setLog(prev => [
      ...prev.slice(-99),
      { type, text, time: timestamp(), id: Date.now() },
    ]);
  }, []);

  // ── Loading/error wrapper ──────────────────────────────────────────────────
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setError("");
      setLoading(true);
      try {
        return await fn();
      } catch (e) {
        setError((e as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const connectWS = useCallback(async (code: string): Promise<void> => {
    if (stompRef.current?.active) {
      stompRef.current.deactivate();
    }

    const token = await getToken();
    console.log("🔌 connectWS — URL:", WS_URL, "| token:", token ? "✓" : "✗");

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => console.log("[STOMP]", msg),
    });

    client.onConnect = () => {
      console.log("✅ STOMP connected");
      setWsReady(true);
      addLog("SYSTEM", "WebSocket connected ✓");

      client.subscribe(`/topic/session/${code}`, (frame: IMessage) => {
        console.log("📨 WS frame:", frame.body);
        try {
          const msg: WsMessage = JSON.parse(frame.body);

          switch (msg.type) {
            case "SYSTEM":
              addLog("SYSTEM", msg.payload ?? "System message");
              break;

            case "USER_JOINED":
              // Add participant and mark session as ACTIVE (both users present)
              setParticipants(prev => {
                const updated = prev.includes(msg.sender)
                  ? prev
                  : [...prev, msg.sender];
                // connected = at least 2 people in the session
                if (updated.length >= 2) {
                  setConnected(true);
                  addLog("USER_JOINED", `✅ ${msg.sender} joined — session is now active!`);
                } else {
                  addLog("USER_JOINED", `${msg.sender} joined — waiting for others...`);
                }
                return updated;
              });
              setSession(prev =>
                prev ? { ...prev, status: "ACTIVE" } : prev
              );
              break;

            case "USER_LEFT":
              setParticipants(prev => {
                const updated = prev.filter(p => p !== msg.sender);
                if (updated.length < 2) {
                  setConnected(false);
                }
                return updated;
              });
              addLog("USER_LEFT", `${msg.sender} left the session`);
              break;

            case "DATA_UPDATE":
              // Only apply remote updates (ignore echo of own pushes)
              if (msg.sender !== usernameRef.current) {
                setSharedData(msg.payload ?? "");
                addLog("DATA_UPDATE", `📝 ${msg.sender} updated data`);
              }
              break;

            case "SESSION_CLOSED":
              setSession(prev => prev ? { ...prev, status: "CLOSED" } : prev);
              setConnected(false);
              addLog("SESSION_CLOSED", "Session was closed");
              break;

            default:
              addLog(msg.type, msg.payload ?? msg.sender ?? "");
          }
        } catch (err) {
          console.log("❌ Error parsing WS frame:", err);
        }
      });
    };

    client.onDisconnect = () => {
      console.log("🔌 STOMP disconnected");
      setWsReady(false);
      setConnected(false);
      addLog("SYSTEM", "WebSocket disconnected");
    };

    client.onStompError = frame => {
      console.log("❌ STOMP error:", frame.headers, frame.body);
      addLog("ERROR", frame.headers?.message ?? "STOMP error");
    };

    client.onWebSocketError = (event) => {
      console.log("❌ WebSocket error:", event);
      addLog("ERROR", "WebSocket connection error");
    };

    client.onWebSocketClose = (event) => {
      console.log("🔴 WebSocket closed — code:", event.code, "reason:", event.reason);
    };

    stompRef.current = client;
    client.activate();
  }, [addLog]);

  const disconnectWS = useCallback((): void => {
    stompRef.current?.deactivate();
    stompRef.current = null;
    setWsReady(false);
    setConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => disconnectWS(), [disconnectWS]);

  // ── Session actions ────────────────────────────────────────────────────────
  const applySession = (s: Session): void => {
    setSession(s);
    setParticipants(s.participants ?? []);
    setSharedData(s.sharedData ?? "");
    // If session already has ≥2 participants on join (e.g. late joiner), mark connected
    if ((s.participants ?? []).length >= 2) {
      setConnected(true);
    }
  };

  const createSession = useCallback(
    (): Promise<Session | null> =>
      withLoading(async () => {
        console.log("Creating session...");
        const s = await api<Session>("create", {
          method: "POST",
          body: JSON.stringify({ username }),
        });
        applySession(s);
        addLog("SYSTEM", `Session ${s.code} created — waiting for others to join...`);
        connectWS(s.code);
        return s;
      }),
    [username, withLoading, connectWS, addLog]
  );

  const joinSession = useCallback(
    (code: string): Promise<Session | null> =>
      withLoading(async () => {
        console.log("Joining session:", code);
        const s = await api<Session>("join", {
          method: "POST",
          body: JSON.stringify({ code: code.trim().toUpperCase(), username }),
        });
        applySession(s);
        addLog("SYSTEM", `Joined session ${s.code}`);
        connectWS(s.code);
        return s;
      }),
    [username, withLoading, connectWS, addLog]
  );

  const pushData = useCallback(
    async (data: string): Promise<void> => {
      console.log("Pushing data...");
      await withLoading(async () => {
        if (!session) return;
        await api<Session>("update", {
          method: "POST",
          body: JSON.stringify({ code: session.code, username, sharedData: data }),
        });
        setSharedData(data);
        addLog("DATA_UPDATE", "Data pushed ✓");
      });
    },
    [session, username, withLoading, addLog]
  );

  const leaveSession = useCallback(async (): Promise<void> => {
    console.log("Leaving session...");
    if (!session) return;
    try {
      await api<null>(
        `${session.code}/leave?username=${encodeURIComponent(username)}`,
        { method: "DELETE" }
      );
    } catch (_) {
      // Best-effort — clean up locally regardless
    }
    disconnectWS();
    setSession(null);
    setParticipants([]);
    setSharedData("");
    setConnected(false);
    setLog([]);
  }, [session, username, disconnectWS]);

  return {
    session, participants, sharedData, log,
    wsReady, connected, loading, error,
    createSession, joinSession, pushData, leaveSession,
    setError,
  };
}