import { getUserInfo } from "@/services/api";
import { getUser } from "@/services/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

// --- Design tokens (matches your app) ---
const C = {
  bg: "#F5F4F0",
  card: "#FFFFFF",
  border: "#E2E0D8",
  borderFocus: "#1A1A18",
  text: "#1A1A18",
  textMuted: "#7A7870",
  textPlaceholder: "#B0AEA6",
  label: "#4A4844",
  sectionTitle: "#1A1A18",
  removeRed: "#C0392B",
  removeBg: "#FDF0EE",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
  inputBg: "#FAFAF8",
};

// --- SectionTitle Component ---
const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

// --- FieldLabel Component ---
const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

// --- EditableField Component ---
interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  editable?: boolean;
}

const EditableField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  editable = true,
}: EditableFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textPlaceholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};



// --- Avatar Initials Component ---
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials || "?"}</Text>
    </View>
  );
};

// --- Main Profile Page ---
export default function Profile() {
  const [fullName, setFullName] = useState("Jean Dupont");
  const [username, setUsername] = useState("jeandupont");
  const [phone, setPhone] = useState("+216 12 345 678");
  const [email, setEmail] = useState("jean.dupont@email.com");
  const [password, setPassword] = useState("mysecretpassword");

  const [editingSection, setEditingSection] = useState<
    "personal" | "contact" | "security" | null
  >(null);

  const handleSave = () => {
    Alert.alert("Saved", "Your profile has been updated successfully.");
    setEditingSection(null);
  };

useEffect(()=>{
  async function getData(){
    const user = await getUser();
    if(!user){
      router.push("/login");
      return;
    }
    const userInfo = await getUserInfo(user).then((data)=>{
      if(!data) return;
      setFullName(data.firstName + " " + data.lastName);
      setUsername(data.username);
      setEmail(data.email);
      setPhone(data.phone);
      setPassword(data.password);
    }).catch((e) => {
      Alert.alert("User Not Found", "Could not fetch user info");
      throw new Error("User Not Found, Error: " + e);
    });
  }
  getData();
},[])

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
        {/* Page Title */}
        <Text style={styles.pageTitle}>My Profile</Text>

        {/* Avatar & Name Banner */}
        <View style={styles.bannerCard}>
          <Avatar name={fullName} />
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerName}>{fullName || "Your Name"}</Text>
            <Text style={styles.bannerUsername}>@{username || "username"}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionTitle>Personal Information</SectionTitle>
            <TouchableOpacity
              onPress={() =>
                setEditingSection(
                  editingSection === "personal" ? null : "personal"
                )
              }
              style={styles.editBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>
                {editingSection === "personal" ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <EditableField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            editable={editingSection === "personal"}
          />
          <EditableField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            editable={editingSection === "personal"}
          />

          {editingSection === "personal" && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionTitle>Contact Information</SectionTitle>
            <TouchableOpacity
              onPress={() =>
                setEditingSection(
                  editingSection === "contact" ? null : "contact"
                )
              }
              style={styles.editBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>
                {editingSection === "contact" ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <EditableField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+216 XX XXX XXX"
            keyboardType="phone-pad"
            editable={editingSection === "contact"}
          />
          <EditableField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            editable={editingSection === "contact"}
          />

          {editingSection === "contact" && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionTitle>Security</SectionTitle>
            <TouchableOpacity
              onPress={() =>
                setEditingSection(
                  editingSection === "security" ? null : "security"
                )
              }
              style={styles.editBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>
                {editingSection === "security" ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <EditableField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            editable={editingSection === "security"}
          />

          {editingSection === "security" && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Update Password</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <SectionTitle>Danger Zone</SectionTitle>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action is irreversible.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {} },
                ]
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },

  // --- Banner ---
  bannerCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.addBg,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: C.addText,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bannerInfo: {
    gap: 2,
  },
  bannerName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  bannerUsername: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: "500",
  },

  // --- Card ---
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  dangerCard: {
    borderColor: "#F5C6C2",
    backgroundColor: C.removeBg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.sectionTitle,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textMuted,
  },

  // --- Fields ---
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: C.label,
  },
  input: {
    backgroundColor: C.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    fontWeight: "400",
  },
  inputFocused: {
    borderColor: C.borderFocus,
  },
  inputDisabled: {
    color: C.textMuted,
    backgroundColor: C.bg,
  },

  // --- Save Button ---
  saveBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.addText,
    letterSpacing: 0.2,
  },

  // --- Delete Button ---
  deleteBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8A09A",
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: C.card,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.removeRed,
    letterSpacing: 0.2,
  },
});