import { JSX, useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSession } from "../../hooks/useSession";
import { getUser } from "@/services/auth";

type Tab = "create" | "join";

export default function SessionHomeScreen(): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [tab, setTab]           = useState<Tab>("create");
  const [userReady, setUserReady] = useState<boolean>(false);

  const router  = useRouter();
  // Only initialize session hook once username is known
  const session = useSession(username);

  useEffect(() => {
    async function getData() {
      const data = await getUser() ?? "";
      setUsername(data);
      setUserReady(true);
    }
    getData();
  }, []);

  const handleCreate = async (): Promise<void> => {
    const s = await session.createSession();
    if (s) {
      router.push({
        pathname: "/(shared_accident_report)/room",
        params: { code: s.code, username },
      });
    }
  };

  const handleJoin = async (): Promise<void> => {
    if (!joinCode.trim()) {
      session.setError("Enter a session code.");
      return;
    }
    const s = await session.joinSession(joinCode);
    if (s) {
      router.push({
        pathname: "/(shared_accident_report)/room",
        params: { code: s.code, username },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#050810", "#0a0f1e", "#050810"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.pill}>
              <Text style={s.pillTxt}>LIVE</Text>
            </View>
            <Text style={s.title}>LiveLink</Text>
            <Text style={s.sub}>Real-time sessions between two users</Text>
          </View>

          {/* User badge */}
          <View style={s.userBadge}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{username ? username[0].toUpperCase() : "U"}</Text>
            </View>
            <Text style={s.usernameLabel}>{username || "Loading..."}</Text>
          </View>

          {/* Tab switcher */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, tab === "create" && s.tabActive]}
              onPress={() => setTab("create")}
            >
              <Text style={[s.tabTxt, tab === "create" && s.tabTxtActive]}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, tab === "join" && s.tabActive]}
              onPress={() => setTab("join")}
            >
              <Text style={[s.tabTxt, tab === "join" && s.tabTxtActive]}>Join</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!session.error && (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>{session.error}</Text>
            </View>
          )}

          {/* Create card */}
          {tab === "create" && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Start a new session</Text>
              <Text style={s.cardDesc}>
                A unique code will be generated. Share it with the other user so
                they can join your session instantly.
              </Text>
              <TouchableOpacity
                style={[s.primaryBtn, (!userReady || session.loading) && s.btnDisabled]}
                onPress={handleCreate}
                disabled={!userReady || session.loading}
                activeOpacity={0.8}
              >
                {session.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>＋  Create Session</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Join card */}
          {tab === "join" && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Join existing session</Text>
              <Text style={s.cardDesc}>
                Enter the 6-character code shared by the other user.
              </Text>
              <TextInput
                style={s.codeInput}
                placeholder="ABC-123"
                placeholderTextColor="#3d4a5c"
                value={joinCode}
                onChangeText={(t: string) => setJoinCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={7}
              />
              <TouchableOpacity
                style={[s.primaryBtn, (!userReady || session.loading) && s.btnDisabled]}
                onPress={handleJoin}
                disabled={!userReady || session.loading}
                activeOpacity={0.8}
              >
                {session.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnTxt}>→  Join Session</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const ACCENT  = "#6366f1";
const ACCENT2 = "#10b981";

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header:   { alignItems: "center", marginTop: 80, marginBottom: 32 },
  pill: {
    backgroundColor: "#1a1f35",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  pillTxt:  { color: ACCENT2, fontSize: 11, fontWeight: "700", letterSpacing: 3 },
  title:    { fontSize: 38, fontWeight: "800", color: "#f1f5f9", letterSpacing: -1 },
  sub:      { color: "#475569", fontSize: 14, marginTop: 6, textAlign: "center" },

  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0d1220",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1e2740",
    marginBottom: 28,
  },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  avatarTxt:     { color: "#fff", fontWeight: "700", fontSize: 14 },
  usernameLabel: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#0d1220",
    borderRadius: 12,
    padding: 4,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e2740",
  },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabActive:    { backgroundColor: "#1a2540" },
  tabTxt:       { color: "#475569", fontWeight: "600", fontSize: 14 },
  tabTxtActive: { color: "#f1f5f9" },

  errorBox: {
    backgroundColor: "#1c0b0b",
    borderWidth: 1,
    borderColor: "#7f1d1d",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    marginBottom: 12,
  },
  errorTxt: { color: "#f87171", fontSize: 13 },

  card: {
    width: "100%",
    backgroundColor: "#0d1220",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e2740",
    gap: 14,
  },
  cardTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "700" },
  cardDesc:  { color: "#475569", fontSize: 13, lineHeight: 20 },

  codeInput: {
    backgroundColor: "#060c18",
    borderWidth: 1,
    borderColor: "#1e2740",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 6,
    textAlign: "center",
  },

  primaryBtn:    { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  primaryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnDisabled:   { opacity: 0.5 },
});