import { Contract } from "@/constants/appData";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  sectionTitle: "#1A1A18",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
  inputBg: "#FAFAF8",
  disabledBg: "#F0EFE9",
};

// --- Sub-components ---

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

const ReadonlyField = ({ value }: { value?: string }) => (
  <View style={styles.readonlyField}>
    <Text style={styles.readonlyText}>{value ?? "—"}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// --- Main component ---

export default function SecondStep() {
  const { contract } = useLocalSearchParams<{ contract: string }>();
  const userContract: Contract = JSON.parse(contract);
  const router = useRouter();

  const fields: { label: string; value?: string }[] = [
    { label: "Client", value: userContract?.client },
    { label: "Driving License", value: userContract?.drivingLicenseNumber },
    { label: "Vehicle Registration Number", value: userContract?.registration },
    { label: "Insurance Company", value: userContract?.insuranceCompany },
    { label: "Car Brand", value: userContract?.brand },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Contract Info</Text>

        <View style={styles.card}>
          <SectionTitle>Contract Details</SectionTitle>

          {fields.map((field, i) => (
            <View key={field.label}>
              {i > 0 && <Divider />}
              <FieldLabel>{field.label}</FieldLabel>
              <ReadonlyField value={field.value} />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/(accident_report)/step-3",
              params: { contract: JSON.stringify(contract) },
            })
          }
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---

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
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.sectionTitle,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: C.label,
    marginBottom: 4,
  },
  readonlyField: {
    backgroundColor: C.disabledBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
  },
  readonlyText: {
    fontSize: 14,
    color: C.text,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  nextBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.addText,
    letterSpacing: 0.2,
  },
});