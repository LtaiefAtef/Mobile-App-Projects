import { loginRequest } from "@/services/api";
import { saveToken, saveUser } from "@/services/auth";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Design tokens ---
const C = {
  bg: "#F5F4F0",
  card: "#FFFFFF",
  border: "#E2E0D8",
  borderFocus: "#1A1A18",
  text: "#1A1A18",
  textMuted: "#7A7870",
  textPlaceholder: "#B0AEA6",
  label: "#4A4844",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
  inputBg: "#FAFAF8",
  errorText: "#C0392B",
  link: "#1A1A18",
};

// --- Sub-components ---
const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? ""}
      placeholderTextColor={C.textPlaceholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType ?? "default"}
      autoCapitalize="none"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const ErrorMsg = ({ msg }: { msg: string }) =>
  msg ? <Text style={styles.errorText}>{msg}</Text> : null;

// --- Main component ---
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    const newErrors = { username: "", password: "" };
    let hasError = false;

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      newErrors.username = "Username must be alphanumeric.";
      hasError = true;
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;
    try{
      const data = await loginRequest(username, password);
      if (!data) return;
      await saveToken(data.access_token, data.refresh_token, data.expires_in);
      saveUser(username);
      router.push("/");
    }catch(e:any){
      setErrors({username:e?.message, password:e?.message});
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Welcome to FTUSA</Text>
          <Text style={styles.pageSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Username</Text>
          <StyledInput
            placeholder="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors((prev) => ({ ...prev, username: "" }));
            }}
          />
          <ErrorMsg msg={errors.username} />

          <Text style={styles.fieldLabel}>Password</Text>
          <StyledInput
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          <ErrorMsg msg={errors.password} />

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" dismissTo>
            <Text style={styles.footerLink}>Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  screenContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    gap: 16,
  },
  header: { alignItems: "center", marginBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: C.text },
  pageSubtitle: { fontSize: 14, color: C.textMuted, marginTop: 4 },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: C.label,
    marginBottom: 2,
    marginTop: 4,
  },
  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
    fontSize: 14,
    color: C.text,
  },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.card },
  errorText: { fontSize: 12, color: C.errorText, fontWeight: "500" },
  submitBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: C.addText, letterSpacing: 0.2 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 14, color: C.textMuted },
  footerLink: { fontSize: 14, fontWeight: "600", color: C.link, textDecorationLine: "underline" },
});