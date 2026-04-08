import { useState, useRef, useEffect, JSX } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Animated, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSession, LogEntry, SessionStatus } from "../../hooks/useSession";

// ─── Types ────────────────────────────────────────────────────────────────────
type ActiveTab = "data" | "log";

// ─── Log entry component ──────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  USER_JOINED:    "#10b981",
  USER_LEFT:      "#f59e0b",
  DATA_UPDATE:    "#6366f1",
  SESSION_CLOSED: "#ef4444",
  SYSTEM:         "#8b5cf6",
  ERROR:          "#ef4444",
};

function LogEntryRow({ entry }: { entry: LogEntry }): JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[s.logRow, { opacity: fadeAnim }]}>
      <Text style={s.logTime}>{entry.time}</Text>
      <Text style={[s.logType, { color: TYPE_COLOR[entry.type] ?? "#94a3b8" }]}>
        {entry.type}
      </Text>
      <Text style={s.logText} numberOfLines={2}>{entry.text}</Text>
    </Animated.View>
  );
}

// ─── Participant chip ─────────────────────────────────────────────────────────
function ParticipantChip({ name, isYou }: { name: string; isYou: boolean }): JSX.Element {
  return (
    <View style={[s.chip, isYou && s.chipYou]}>
      <View style={[s.chipDot, { backgroundColor: isYou ? "#6366f1" : "#10b981" }]} />
      <Text style={s.chipTxt}>{name}{isYou ? " (you)" : ""}</Text>
    </View>
  );
}

// ─── Connection status banner ─────────────────────────────────────────────────
function ConnectionBanner({ wsReady, connected }: { wsReady: boolean; connected: boolean }): JSX.Element {
  if (!wsReady) {
    return (
      <View style={[s.banner, s.bannerConnecting]}>
        <Text style={s.bannerTxt}>⏳  Connecting to server…</Text>
      </View>
    );
  }
  if (!connected) {
    return (
      <View style={[s.banner, s.bannerWaiting]}>
        <Text style={s.bannerTxt}>⌛  Waiting for the other user to join…</Text>
      </View>
    );
  }
  return (
    <View style={[s.banner, s.bannerConnected]}>
      <Text style={s.bannerTxt}>✅  Both users connected — session is live!</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SessionRoomScreen(): JSX.Element {
  const router = useRouter();
  const { code, username } = useLocalSearchParams<Record<string, string>>();

  const {
    session, participants, sharedData,
    log, wsReady, connected, loading, error,
    // ⚠️  Do NOT call joinSession here — session was already joined in session.tsx
    pushData, leaveSession,
  } = useSession(username ?? "");

  const [draft, setDraft]         = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("data");

  const logScrollRef = useRef<ScrollView>(null);

  // Sync incoming peer data into draft
  useEffect(() => {
    setDraft(sharedData);
  }, [sharedData]);

  // Scroll log to bottom on new entry
  useEffect(() => {
    setTimeout(() => logScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [log]);

  const handlePush = async (): Promise<void> => {
    await pushData(draft);
  };

  const handleCopyCode = async (): Promise<void> => {
    await Clipboard.setStringAsync(session?.code ?? code ?? "");
    Alert.alert("Copied!", "Session code copied to clipboard.");
  };

  const handleLeave = (): void => {
    Alert.alert(
      "Leave session?",
      "The other user will be notified.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await leaveSession();
            router.replace("/(shared_accident_report)/session");
          },
        },
      ]
    );
  };

  const sessionCode   = session?.code ?? code ?? "";
  const sessionStatus = (session?.status ?? "WAITING") as SessionStatus;

  const statusColor: Record<SessionStatus, string> = {
    WAITING: "#f59e0b",
    ACTIVE:  "#10b981",
    CLOSED:  "#ef4444",
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#050810", "#080d1a"]} style={{ flex: 1 }}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View>
            <Text style={s.topCode}>{sessionCode}</Text>
            <View style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: statusColor[sessionStatus] }]} />
              <Text style={[s.statusTxt, { color: statusColor[sessionStatus] }]}>
                {sessionStatus}
              </Text>
              <Text style={s.wsTxt}>
                {connected ? " · 🟢 Connected" : wsReady ? " · 🟡 Waiting" : " · ⚪ Connecting…"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={s.iconBtn} onPress={handleCopyCode}>
              <Text style={s.iconBtnTxt}>⧉</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.leaveBtn} onPress={handleLeave}>
              <Text style={s.leaveBtnTxt}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Connection banner ── */}
        <ConnectionBanner wsReady={wsReady} connected={connected} />

        {/* ── Participants ── */}
        <View style={s.participantsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {participants.map(p => (
              <ParticipantChip key={p} name={p} isYou={p === username} />
            ))}
            {participants.length < 2 && (
              <View style={[s.chip, { borderStyle: "dashed" }]}>
                <Text style={[s.chipTxt, { color: "#3d4a5c" }]}>Waiting for peer…</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── Error ── */}
        {!!error && (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>{error}</Text>
          </View>
        )}

        {/* ── Tab switcher ── */}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={[s.tabItem, activeTab === "data" && s.tabItemActive]}
            onPress={() => setActiveTab("data")}
          >
            <Text style={[s.tabItemTxt, activeTab === "data" && s.tabItemTxtActive]}>
              Shared Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabItem, activeTab === "log" && s.tabItemActive]}
            onPress={() => setActiveTab("log")}
          >
            <Text style={[s.tabItemTxt, activeTab === "log" && s.tabItemTxtActive]}>
              Activity Log {log.length > 0 ? `(${log.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Data tab ── */}
        {activeTab === "data" && (
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <TextInput
              style={s.dataInput}
              value={draft}
              onChangeText={(t: string) => setDraft(t)}
              placeholder="Paste or type anything to share…"
              placeholderTextColor="#2a3550"
              multiline
              textAlignVertical="top"
              // Lock input until both users are connected
              editable={connected}
            />
            {!connected && (
              <Text style={s.lockedHint}>🔒  Input locked until peer connects</Text>
            )}
            <View style={s.dataActions}>
              <TouchableOpacity
                style={[s.pushBtn, !connected && s.btnDisabled]}
                onPress={handlePush}
                disabled={!connected || loading}
                activeOpacity={0.8}
              >
                <Text style={s.pushBtnTxt}>↑  Push to peer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.resetBtn}
                onPress={() => setDraft(sharedData)}
              >
                <Text style={s.resetBtnTxt}>↺  Reset</Text>
              </TouchableOpacity>
            </View>
            {draft !== sharedData && connected && (
              <Text style={s.unsavedHint}>● Unsaved local changes</Text>
            )}
          </View>
        )}

        {/* ── Log tab ── */}
        {activeTab === "log" && (
          <ScrollView
            ref={logScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={s.logContent}
          >
            {log.length === 0 && (
              <Text style={s.emptyLog}>No events yet…</Text>
            )}
            {log.map(entry => (
              <LogEntryRow key={entry.id} entry={entry} />
            ))}
          </ScrollView>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ACCENT = "#6366f1";

const s = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1829",
  },
  topCode:   { fontSize: 26, fontWeight: "800", color: "#a5b4fc", letterSpacing: 5 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: "600" },
  wsTxt:     { fontSize: 12, color: "#94a3b8" },

  // ── Connection banners ──
  banner: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bannerConnecting: { backgroundColor: "#1a1200", borderColor: "#78350f" },
  bannerWaiting:    { backgroundColor: "#1a1200", borderColor: "#f59e0b" },
  bannerConnected:  { backgroundColor: "#052e16", borderColor: "#10b981" },
  bannerTxt:        { fontSize: 13, fontWeight: "600", color: "#e2e8f0" },

  iconBtn: {
    backgroundColor: "#0d1220",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e2740",
  },
  iconBtnTxt: { color: "#94a3b8", fontSize: 16 },
  leaveBtn: {
    backgroundColor: "#1c0b0b",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },
  leaveBtnTxt: { color: "#f87171", fontWeight: "600", fontSize: 13 },

  participantsRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1829",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0d1220",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#1e2740",
  },
  chipYou: { borderColor: "#3730a3", backgroundColor: "#1e1b4b" },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipTxt: { color: "#94a3b8", fontSize: 13, fontWeight: "500" },

  errorBox: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#1c0b0b",
    borderWidth: 1,
    borderColor: "#7f1d1d",
    borderRadius: 10,
    padding: 10,
  },
  errorTxt: { color: "#f87171", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: "#080d1a",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#0f1829",
  },
  tabItem:          { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabItemActive:    { backgroundColor: "#0d1525" },
  tabItemTxt:       { color: "#3d4a5c", fontWeight: "600", fontSize: 13 },
  tabItemTxtActive: { color: "#f1f5f9" },

  dataInput: {
    flex: 1,
    backgroundColor: "#060c18",
    borderWidth: 1,
    borderColor: "#0f1829",
    borderRadius: 14,
    padding: 16,
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 12,
  },
  lockedHint:   { color: "#475569", fontSize: 12, marginBottom: 8, textAlign: "center" },
  dataActions:  { flexDirection: "row", gap: 10, marginBottom: 6 },
  pushBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  pushBtnTxt:  { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
  resetBtn: {
    backgroundColor: "#0d1220",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e2740",
  },
  resetBtnTxt:  { color: "#475569", fontWeight: "600", fontSize: 14 },
  unsavedHint:  { color: "#f59e0b", fontSize: 12, marginBottom: 8 },

  logContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 2 },
  emptyLog: {
    color: "#2a3550", fontSize: 13,
    fontFamily: "monospace", marginTop: 20, textAlign: "center",
  },
  logRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#080d1a",
    flexWrap: "wrap",
  },
  logTime: {
    color: "#2a3550", fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    minWidth: 70,
  },
  logType: {
    fontSize: 11, fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    minWidth: 100,
  },
  logText: {
    color: "#64748b", fontSize: 11, flex: 1,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});