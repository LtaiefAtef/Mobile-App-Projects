import { isVerified, resendVerification } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Design tokens ---
const C = {
  bg: "#F5F4F0",
  card: "#FFFFFF",
  border: "#E2E0D8",
  text: "#1A1A18",
  textMuted: "#7A7870",
  label: "#4A4844",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
  disabledBg: "#E2E0D8",
  disabledText: "#B0AEA6",
};

export default function VerifyEmail() {
  const { username, password, action } = useLocalSearchParams();
  const router = useRouter();
  const [timer, setTimer] = useState(60);
  const [disabledButton, setDisabledButton] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimer(60);
    setDisabledButton(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setDisabledButton(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();

    const poll = setInterval(async () => {
      try {
        const verified = await isVerified(username as string);
        if(action === "verify email"){
          handleResend();
          if(verified){
            router.back();
            Alert.prompt("Sucessful", "Email modified sucessfully");
            return;
          }
        }
        if (verified) {
          clearInterval(poll);
          router.replace("/(auth)/login");
        }
      } catch (e) {
        console.log("Polling error:", e);
      }
    }, 3000);

    pollRef.current = poll;
    const timeout = setTimeout(() => clearInterval(poll), 600000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, []);

  const handleResend = async () => {
    await resendVerification(username as string);
    startTimer();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.screen}>
        <View style={styles.card}>
          {/* Icon placeholder */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉</Text>
          </View>

          <Text style={styles.pageTitle}>Check your email</Text>
          <Text style={styles.description}>
            A verification email has been sent to your inbox. Please open it and follow the link to activate your account.
          </Text>

          <View style={styles.divider} />

          {disabledButton && (
            <View style={styles.timerRow}>
              <Text style={styles.timerLabel}>Resend available in</Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerValue}>{timer}s</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.resendBtn, disabledButton && styles.resendBtnDisabled]}
            onPress={handleResend}
            disabled={disabledButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.resendBtnText, disabledButton && styles.resendBtnTextDisabled]}>
              Resend Verification Email
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Waiting for verification automatically…
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  iconText: {
    fontSize: 28,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    width: "100%",
    marginVertical: 4,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerLabel: {
    fontSize: 13,
    color: C.label,
  },
  timerBadge: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  timerValue: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  resendBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  resendBtnDisabled: {
    backgroundColor: C.disabledBg,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.addText,
    letterSpacing: 0.2,
  },
  resendBtnTextDisabled: {
    color: C.disabledText,
  },
  footerNote: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
  },
});