import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getUser } from "@/services/auth";
import { useRouter } from "expo-router";

export default function SessionPage() {
    const { loadingSession, toggleLoadingSession, createSession, joinSession } = useSharedAccidentReport();
    const [sessionType, setSessionType] = useState<string>("create");
    const [joinCode, setJoinCode] = useState<string>("")
    const router = useRouter();
    // --- Handle Create Session Function ---
    async function handleCreateSession(){
        const user = await getUser();
        if(!user){
            return;
        }
        toggleLoadingSession();
        const session = await createSession(user);
        toggleLoadingSession();
        router.push({
            pathname:"/(shared_accident_report)/room",
        })
    }
    // --- Handle Join Session Function ---
    async function handleJoinSession() {
        const user = await getUser();
        if(!user){
            return;
        }
        const session = await joinSession(joinCode,user);
        toggleLoadingSession();
        router.push({
            pathname:"/(shared_accident_report)/room",
        })
    }
    return (
        <LinearGradient
            colors={['#1a1740', '#2d2870', '#1a1740']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={ styles.container }
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                >
                    <Text style={ styles.title }>Live Link</Text>
                    <Text style={ styles.subtitle }>Users in session</Text>

                    <View style={ styles.card }>
                        <View style={ styles.header }>
                            <TouchableOpacity
                                style={[styles.tab, sessionType === "create" && styles.tabActive]}
                                onPress={() => setSessionType("create")}
                            >
                                <Text style={[styles.tabText, sessionType === "create" && styles.tabTextActive]}>
                                    Create Session
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, sessionType === "join" && styles.tabActive]}
                                onPress={() => setSessionType("join")}
                            >
                                <Text style={[styles.tabText, sessionType === "join" && styles.tabTextActive]}>
                                    Join Session
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {sessionType === "create" && (
                            <View style={ styles.cardChild }>
                                <Text style={ styles.cardLabel }>Start a new session and share the code with the other user.</Text>
                                <TouchableOpacity disabled={loadingSession} onPress={handleCreateSession} style={ styles.button }>
                                    <Text style={ styles.buttonText }>{loadingSession ? "Loading":"Create Session"}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {sessionType === "join" && (
                            <View style={ styles.cardChild }>
                                <Text style={ styles.cardLabel }>Enter a session code to join an existing session.</Text>
                                <TextInput
                                    style={styles.codeInput}
                                    placeholder="ABC-123"
                                    placeholderTextColor="#3d4a5c"
                                    value={joinCode}
                                    onChangeText={(t: string) => setJoinCode(t.toUpperCase())}
                                    autoCapitalize="characters"
                                    maxLength={7}
                                />
                                <TouchableOpacity onPress={handleJoinSession} style={ styles.button }>
                                    <Text style={ styles.buttonText }>Join Session</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    title: {
        color: "#ffffff",
        fontSize: 32,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    subtitle: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 32,
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: "#ffffff",
        marginHorizontal: 4,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    header: {
        flexDirection: "row",
        backgroundColor: "#f0eeff",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: "#5447cc",
        shadowColor: "#5447cc",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        color: "#5447cc",
        fontWeight: "600",
        fontSize: 14,
    },
    tabTextActive: {
        color: "#ffffff",
    },
    cardChild: {
        marginTop: 4,
    },
    cardLabel: {
        color: "#888",
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    button: {
        marginTop: 16,
        backgroundColor: "#5447cc",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        shadowColor: "#5447cc",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.3,
    },
    codeInput: {
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: "#1e2740",
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 16,
        color: "#060c18",
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: 6,
        textAlign: "center",
  },
});