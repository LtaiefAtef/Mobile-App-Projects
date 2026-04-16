import { Session, SessionState } from "@/constants/appData";
import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { checkIfAuthor } from "@/services/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, Clipboard } from "react-native";

export default function Room() {
    const { sessionData, updateBackendSession } = useSharedAccidentReport();
    const router = useRouter();
    const [isAuthor, setIsAuthor] = useState(false);
    if(!sessionData){
        return <View style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
                <Text style={{ fontSize:35 }}>UnAuthorized Action <Link href="/">GO Back {"<-"}</Link></Text>
            </View>;
    }
    useEffect(()=>{
        async function run(){
            const value = await checkIfAuthor(sessionData?.createdBy ?? "");
            setIsAuthor(value);
        }
        run();
    },[])
    const statusColor = {
        WAITING: { bg: "#fff8e1", text: "#b8860b" },
        ACTIVE:  { bg: "#e8f5e9", text: "#2e7d32" },
        CLOSED:  { bg: "#fce4ec", text: "#c62828" },
    }[sessionData?.status] ?? { bg: "#f0eeff", text: "#5447cc" };
    const copyCode = () => Clipboard.setString(sessionData?.code ?? "");

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
                    style={styles.container}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                >
                    {/* Header */}
                    <Text style={styles.title}>Live Room</Text>
                    <Text style={styles.subtitle}>
                        Created by <Text style={styles.highlight}>{sessionData?.createdBy ?? "—"}</Text>
                    </Text>

                    {/* Session Code Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardSectionLabel}>Session Code</Text>
                        <View style={styles.codeRow}>
                            <Text style={styles.code}>{sessionData?.code ?? "——————"}</Text>
                            <TouchableOpacity style={styles.copyButton} onPress={copyCode}>
                                <Text style={styles.copyButtonText}>Copy</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Status */}
                        <View style={styles.statusRow}>
                            <Text style={styles.cardSectionLabel}>Status</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                <Text style={[styles.statusText, { color: statusColor.text }]}>
                                    {sessionData?.status ?? "—"}
                                </Text>
                            </View>
                        </View>

                        {/* Timestamps */}
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Created</Text>
                                <Text style={styles.metaValue}>
                                    {sessionData?.createdAt ? new Date(sessionData.createdAt).toLocaleString() : "—"}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Updated</Text>
                                <Text style={styles.metaValue}>
                                    {sessionData?.updatedAt ? new Date(sessionData.updatedAt).toLocaleString() : "—"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Participants Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardSectionLabel}>
                            Participants ({(sessionData?.participants?? []).length})
                        </Text>
                        {sessionData ? (sessionData?.participants ?? []).map((p:string,index:number)=>(
                            //  User badge
                            <View key={index} style={styles.userBadge}>
                                <View style={styles.avatar}>
                                <Text style={styles.avatarTxt}>{p ? p[0].toUpperCase() : "U"}</Text>
                                </View>
                                <Text style={styles.usernameLabel}>{p || "Loading..."}</Text>
                            </View>
                        ))
                        :<Text style={styles.emptyText}>Waiting for participants to join...</Text>}
                    </View>

                    {/* Shared Data Card */}
                    <TouchableOpacity 
                        disabled={(sessionData?.participants ?? []).length < 2 && isAuthor == false } 
                        style={[styles.copyButton,((sessionData?.participants ?? []).length < 2 || !isAuthor) 
                            && {backgroundColor:"#ececec"}]} 
                        onPress={()=>{if(isAuthor == false) return;
                        updateBackendSession({ user1Progress:1, user2Progress:2,triggerGuestAction:true,triggerHostAction:false, redirect:true, 
                        sender :sessionData?.createdBy } as SessionState)
                        router.push("/(accident_report)/step-1")}}>
                        <Text style={styles.copyButtonText}>Continue</Text>
                    </TouchableOpacity>
  
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
    },
    highlight: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#ffffff",
        marginBottom: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    cardSectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#aaa",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f0eeff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    code: {
        fontSize: 22,
        fontWeight: "700",
        color: "#5447cc",
        letterSpacing: 4,
    },
    copyButton: {
        backgroundColor: "#5447cc",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems:"center"
    },
    copyButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    metaRow: {
        flexDirection: "row",
        gap: 12,
    },
    metaItem: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 10,
    },
    metaLabel: {
        fontSize: 11,
        color: "#aaa",
        marginBottom: 3,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: 12,
        color: "#444",
        fontWeight: "500",
    },
    emptyText: {
        color: "#bbb",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 16,
    },
    sharedData: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },
    userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f4f6fc",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 28,
    },
    avatar: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: "#6366f1",
        alignItems: "center", justifyContent: "center",
    },
    avatarTxt:     { color: "#fff", fontWeight: "700", fontSize: 14 },
    usernameLabel: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
});