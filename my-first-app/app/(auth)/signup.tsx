import { signupRequest } from "@/services/api";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
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
  flex,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  flex?: number;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.inputFocused, flex !== undefined && { flex }]}
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

const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

const ErrorMsg = ({ msg }: { msg: string }) =>
  msg ? <Text style={styles.errorText}>{msg}</Text> : null;

const Divider = () => <View style={styles.divider} />;

// --- Main component ---
export default function Signup() {
  const [prename, setPrename] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", phone: "", email: "", password: "" });

  const handleSignup = async () => {
    const newErrors = { username: "", phone: "", email: "", password: "" };
    let hasError = false;

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Username must be alphanumeric.";
      hasError = true;
    }
    if (!/^[0-9]+$/.test(phone)) {
      newErrors.phone = "Phone number must contain only digits.";
      hasError = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const result = await signupRequest({ prename, familyName, username, phoneNumber: phone, email, password });
    if (!result) return;
    router.replace(`/(auth)/verify-email?username=${username}&password=${password}`);
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
          <Text style={styles.pageSubtitle}>Create your account</Text>
        </View>

        <View style={styles.card}>
          {/* Full name row */}
          <FieldLabel>Full Name</FieldLabel>
          <View style={styles.nameRow}>
            <StyledInput
              placeholder="Prename"
              value={prename}
              onChangeText={setPrename}
              flex={1}
            />
            <StyledInput
              placeholder="Family Name"
              value={familyName}
              onChangeText={setFamilyName}
              flex={1}
            />
          </View>

          <Divider />

          <FieldLabel>Username</FieldLabel>
          <StyledInput
            placeholder="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors((prev) => ({ ...prev, username: "" }));
            }}
          />
          <ErrorMsg msg={errors.username} />

          <FieldLabel>Phone Number</FieldLabel>
          <StyledInput
            placeholder="Phone Number"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={(text) => {
              setPhone(text);
              setErrors((prev) => ({ ...prev, phone: "" }));
            }}
          />
          <ErrorMsg msg={errors.phone} />

          <FieldLabel>Email</FieldLabel>
          <StyledInput
            placeholder="Email"
            value={email}
            keyboardType="email-address"
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
          />
          <ErrorMsg msg={errors.email} />

          <FieldLabel>Password</FieldLabel>
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

          <TouchableOpacity style={styles.submitBtn} onPress={handleSignup} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" dismissTo>
            <Text style={styles.footerLink}>Login</Text>
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
  nameRow: { flexDirection: "row", gap: 8 },
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
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
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