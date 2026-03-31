import { plateTypeList } from '@/constants/appData';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

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
  sectionTitle: "#1A1A18",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
  inputBg: "#FAFAF8",
  disabledBg: "#F0EFE9",
  errorText: "#C0392B",
  badgeBg: "#F0EFE9",
  badgeText: "#7A7870",
  pickerBg: "#FAFAF8",
};

// --- Constants ---
const STORAGE_KEY = "@account_setup_form";

// --- Types ---
type InspectionResult = "Passed" | "Failed" | "";

export type FormData = {
  registrationLeft: string;
  registrationPlateType: string;
  registrationRight: string;
  vin: string;
  brand: string;
  model: string;
  vehicleType: string;
  firstRegistrationDate: Date | null;
  fiscalPower: string;
  ownerName: string;
  ownerAddress: string;
  registrationIssueDate: Date | null;
  licenseNumber: string;
  lastName: string;
  firstName: string;
  dateOfBirth: Date | null;
  licenseIssueDate: Date | null;
  licenseExpiryDate: Date | null;
  contractNumber: string;
  insuranceCompany: string;
  roadTaxLeft: string;
  roadTaxPlateType: string;
  roadTaxRight: string;
  roadTaxYear: string;
  amountPaid: string;
  paymentDate: Date | null;
  roadTaxVehicleType: string;
  certificateNumber: string;
  inspectionLeft: string;
  inspectionPlateType: string;
  inspectionRight: string;
  inspectionDate: Date | null;
  inspectionResult: InspectionResult;
  validUntil: Date | null;
  inspectionCenter: string;
};

const DATE_FIELDS: (keyof FormData)[] = [
  "firstRegistrationDate",
  "registrationIssueDate",
  "dateOfBirth",
  "licenseIssueDate",
  "licenseExpiryDate",
  "paymentDate",
  "inspectionDate",
  "validUntil",
];

const initialForm: FormData = {
  registrationLeft: "",
  registrationPlateType: "",
  registrationRight: "",
  vin: "",
  brand: "",
  model: "",
  vehicleType: "",
  firstRegistrationDate: null,
  fiscalPower: "",
  ownerName: "",
  ownerAddress: "",
  registrationIssueDate: null,
  licenseNumber: "",
  lastName: "",
  firstName: "",
  dateOfBirth: null,
  licenseIssueDate: null,
  licenseExpiryDate: null,
  contractNumber: "",
  insuranceCompany: "",
  roadTaxLeft: "",
  roadTaxPlateType: "",
  roadTaxRight: "",
  roadTaxYear: "",
  amountPaid: "",
  paymentDate: null,
  roadTaxVehicleType: "",
  certificateNumber: "",
  inspectionLeft: "",
  inspectionPlateType: "",
  inspectionRight: "",
  inspectionDate: null,
  inspectionResult: "",
  validUntil: null,
  inspectionCenter: "",
};

// --- AsyncStorage helpers ---
const serializeForm = (form: FormData): Record<string, string | null> => {
  const result: Record<string, string | null> = {};
  for (const key in form) {
    const value = form[key as keyof FormData];
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (value === null) {
      result[key] = null;
    } else {
      result[key] = value as string;
    }
  }
  return result;
};

const deserializeForm = (raw: Record<string, string | null>): FormData => {
  const result: any = { ...initialForm };
  for (const key in raw) {
    if (DATE_FIELDS.includes(key as keyof FormData)) {
      result[key] = raw[key] ? new Date(raw[key] as string) : null;
    } else {
      result[key] = raw[key] ?? "";
    }
  }
  return result as FormData;
};

const saveForm = async (form: FormData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serializeForm(form)));
  } catch (e) {
    console.error("Failed to save form:", e);
  }
};

const loadForm = async (): Promise<FormData | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserializeForm(JSON.parse(raw));
  } catch (e) {
    console.error("Failed to load form:", e);
    return null;
  }
};

// --- Sub-components ---

const SectionTitle = ({ number, children }: { number: string; children: string }) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.sectionBadge}>
      <Text style={styles.sectionBadgeText}>{number}</Text>
    </View>
    <Text style={styles.sectionTitle}>{children}</Text>
  </View>
);

const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "decimal-pad";
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline, focused && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? ""}
      placeholderTextColor={C.textPlaceholder}
      multiline={multiline}
      keyboardType={keyboardType ?? "default"}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
};

const StyledPicker = ({
  items,
  selectedValue,
  onValueChange,
  flex,
}: {
  items: { label: string; value: string }[];
  selectedValue?: string;
  onValueChange: (v: string) => void;
  flex?: number;
}) => (
  <View style={[styles.pickerWrapper, flex !== undefined && { flex }]}>
    <Picker
      selectedValue={selectedValue ?? ""}
      onValueChange={onValueChange}
      style={[styles.picker, { color: selectedValue ? C.text : C.textMuted }]}
      dropdownIconColor={C.text}
    >
      <Picker.Item label="Type…" value="" color={C.textMuted} style={{ fontSize: 14 }} />
      {items.map(item => (
        <Picker.Item key={item.value} label={item.label} value={item.value} color={C.text} style={{ fontSize: 14 }} />
      ))}
    </Picker>
  </View>
);

// Reusable plate row: [input] [picker] [input]
const PlateRow = ({
  leftValue, onLeftChange,
  plateType, onPlateTypeChange,
  rightValue, onRightChange,
}: {
  leftValue: string; onLeftChange: (v: string) => void;
  plateType: string; onPlateTypeChange: (v: string) => void;
  rightValue: string; onRightChange: (v: string) => void;
}) => (
  <View style={styles.plateRow}>
    <View style={styles.plateInputWrapper}>
      <StyledInput value={leftValue} onChangeText={onLeftChange} placeholder="123" keyboardType="numeric" />
    </View>
    <StyledPicker
      items={plateTypeList}
      selectedValue={plateType}
      onValueChange={onPlateTypeChange}
      flex={1}
    />
    <View style={styles.plateInputWrapper}>
      <StyledInput value={rightValue} onChangeText={onRightChange} placeholder="4567" keyboardType="numeric" />
    </View>
  </View>
);

const DateField = ({ value, onPress }: { value: Date | null; onPress: () => void }) => (
  <TouchableOpacity style={styles.dateField} onPress={onPress} activeOpacity={0.7}>
    <Text style={value ? styles.dateText : styles.datePlaceholder}>
      {value ? value.toDateString() : "Select date…"}
    </Text>
    <Text style={styles.dateIcon}>📅</Text>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const ResultToggle = ({ value, onChange }: { value: InspectionResult; onChange: (v: InspectionResult) => void }) => (
  <View style={styles.toggleRow}>
    {(["Passed", "Failed"] as InspectionResult[]).map((option) => (
      <TouchableOpacity
        key={option}
        style={[styles.toggleOption, value === option && (option === "Passed" ? styles.togglePassed : styles.toggleFailed)]}
        onPress={() => onChange(option)}
        activeOpacity={0.8}
      >
        <Text style={[styles.toggleOptionText, value === option && styles.toggleOptionTextActive]}>
          {option === "Passed" ? "✓ Passed" : "✗ Failed"}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

type DatePickerKey = keyof Pick<FormData,
  "firstRegistrationDate" | "registrationIssueDate" | "dateOfBirth" |
  "licenseIssueDate" | "licenseExpiryDate" | "paymentDate" | "inspectionDate" | "validUntil"
>;

// --- Main component ---
export default function AccountSetup() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [activeDatePicker, setActiveDatePicker] = useState<DatePickerKey | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await loadForm();
      if (saved) setForm(saved);
    })();
  }, []);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openDatePicker = (key: DatePickerKey) => setActiveDatePicker(key);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (activeDatePicker && selectedDate) setField(activeDatePicker, selectedDate);
    setActiveDatePicker(null);
  };

  const handleSubmit = async () => {
    await saveForm(form);
    router.replace("/");
  };

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
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Account Setup</Text>
          <Text style={styles.pageSubtitle}>
            Enter your vehicle and personal documents to complete your profile.
          </Text>
          <TouchableOpacity style={styles.importBtn} onPress={() => console.log("Import CSV clicked")} activeOpacity={0.8}>
            <Text style={styles.importBtnText}>+ Import .CSV</Text>
          </TouchableOpacity>
        </View>

        {/* ── 1. Vehicle Registration Card ── */}
        <View style={styles.card}>
          <SectionTitle number="1">Vehicle Registration Card</SectionTitle>

          <FieldLabel>Registration Number</FieldLabel>
          <PlateRow
            leftValue={form.registrationLeft}
            onLeftChange={(v) => setField("registrationLeft", v)}
            plateType={form.registrationPlateType}
            onPlateTypeChange={(v) => setField("registrationPlateType", v)}
            rightValue={form.registrationRight}
            onRightChange={(v) => setField("registrationRight", v)}
          />

          <Divider />

          <FieldLabel>VIN (Chassis Number)</FieldLabel>
          <StyledInput value={form.vin} onChangeText={(v) => setField("vin", v)} placeholder="e.g. VF1RFD00X56789012" />

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Brand</FieldLabel>
              <StyledInput value={form.brand} onChangeText={(v) => setField("brand", v)} placeholder="e.g. Peugeot" />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Model</FieldLabel>
              <StyledInput value={form.model} onChangeText={(v) => setField("model", v)} placeholder="e.g. 308" />
            </View>
          </View>

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Vehicle Type</FieldLabel>
              <StyledInput value={form.vehicleType} onChangeText={(v) => setField("vehicleType", v)} placeholder="e.g. Sedan" />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Fiscal Power</FieldLabel>
              <StyledInput value={form.fiscalPower} onChangeText={(v) => setField("fiscalPower", v)} placeholder="e.g. 7 CV" keyboardType="numeric" />
            </View>
          </View>

          <Divider />

          <FieldLabel>First Registration Date</FieldLabel>
          <DateField value={form.firstRegistrationDate} onPress={() => openDatePicker("firstRegistrationDate")} />

          <Divider />

          <FieldLabel>Owner Name</FieldLabel>
          <StyledInput value={form.ownerName} onChangeText={(v) => setField("ownerName", v)} placeholder="e.g. Mohamed Ben Ali" />

          <FieldLabel>Owner Address</FieldLabel>
          <StyledInput value={form.ownerAddress} onChangeText={(v) => setField("ownerAddress", v)} placeholder="e.g. 12 Rue de Carthage, Tunis" multiline />

          <Divider />

          <FieldLabel>Issue Date</FieldLabel>
          <DateField value={form.registrationIssueDate} onPress={() => openDatePicker("registrationIssueDate")} />
        </View>

        {/* ── 2. Driver's License ── */}
        <View style={styles.card}>
          <SectionTitle number="2">Driver's License</SectionTitle>

          <FieldLabel>License Number</FieldLabel>
          <StyledInput value={form.licenseNumber} onChangeText={(v) => setField("licenseNumber", v)} placeholder="e.g. 12345678" />

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Last Name</FieldLabel>
              <StyledInput value={form.lastName} onChangeText={(v) => setField("lastName", v)} placeholder="e.g. Ben Ali" />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>First Name</FieldLabel>
              <StyledInput value={form.firstName} onChangeText={(v) => setField("firstName", v)} placeholder="e.g. Mohamed" />
            </View>
          </View>

          <Divider />

          <FieldLabel>Date of Birth</FieldLabel>
          <DateField value={form.dateOfBirth} onPress={() => openDatePicker("dateOfBirth")} />

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Issue Date</FieldLabel>
              <DateField value={form.licenseIssueDate} onPress={() => openDatePicker("licenseIssueDate")} />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Expiry Date</FieldLabel>
              <DateField value={form.licenseExpiryDate} onPress={() => openDatePicker("licenseExpiryDate")} />
            </View>
          </View>
        </View>

        {/* ── 3. Insurance Contract ── */}
        <View style={styles.card}>
          <SectionTitle number="3">Car Insurance</SectionTitle>

          <FieldLabel>Contract Number</FieldLabel>
          <StyledInput value={form.contractNumber} onChangeText={(v) => setField("contractNumber", v)} placeholder="e.g. POL-2024-001234" />

          <Divider />

          <FieldLabel>Insurance Company</FieldLabel>
          <StyledInput value={form.insuranceCompany} onChangeText={(v) => setField("insuranceCompany", v)} placeholder="e.g. STAR Assurances" />
        </View>

        {/* ── 4. Road Tax ── */}
        <View style={styles.card}>
          <SectionTitle number="4">Road Tax (Vignette)</SectionTitle>

          <View style={[styles.twoCol]}>
            <View style={styles.twoColItem}>
              <FieldLabel>Registration Number</FieldLabel>
              <PlateRow
                leftValue={form.roadTaxLeft}
                onLeftChange={(v) => setField("roadTaxLeft", v)}
                plateType={form.roadTaxPlateType}
                onPlateTypeChange={(v) => setField("roadTaxPlateType", v)}
                rightValue={form.roadTaxRight}
                onRightChange={(v) => setField("roadTaxRight", v)}
              />
            </View>
            <View style={[styles.twoColItem]}>
              <FieldLabel>Year</FieldLabel>
              <StyledInput value={form.roadTaxYear} onChangeText={(v) => setField("roadTaxYear", v)} placeholder="e.g. 2024" keyboardType="numeric" />
            </View>
          </View>

          <Divider />

          <FieldLabel>Vehicle Type</FieldLabel>
          <StyledInput value={form.roadTaxVehicleType} onChangeText={(v) => setField("roadTaxVehicleType", v)} placeholder="e.g. Sedan" />

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Amount Paid (TND)</FieldLabel>
              <StyledInput value={form.amountPaid} onChangeText={(v) => setField("amountPaid", v)} placeholder="e.g. 120.000" keyboardType="decimal-pad" />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Payment Date</FieldLabel>
              <DateField value={form.paymentDate} onPress={() => openDatePicker("paymentDate")} />
            </View>
          </View>
        </View>

        {/* ── 5. Technical Inspection ── */}
        <View style={styles.card}>
          <SectionTitle number="5">Technical Inspection</SectionTitle>

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Certificate Number</FieldLabel>
              <StyledInput value={form.certificateNumber} onChangeText={(v) => setField("certificateNumber", v)} placeholder="e.g. CT-2024-001" />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Registration Number</FieldLabel>
              <PlateRow
                leftValue={form.inspectionLeft}
                onLeftChange={(v) => setField("inspectionLeft", v)}
                plateType={form.inspectionPlateType}
                onPlateTypeChange={(v) => setField("inspectionPlateType", v)}
                rightValue={form.inspectionRight}
                onRightChange={(v) => setField("inspectionRight", v)}
              />
            </View>
          </View>

          <Divider />

          <FieldLabel>Inspection Result</FieldLabel>
          <ResultToggle value={form.inspectionResult} onChange={(v) => setField("inspectionResult", v)} />

          <Divider />

          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <FieldLabel>Inspection Date</FieldLabel>
              <DateField value={form.inspectionDate} onPress={() => openDatePicker("inspectionDate")} />
            </View>
            <View style={styles.twoColItem}>
              <FieldLabel>Valid Until</FieldLabel>
              <DateField value={form.validUntil} onPress={() => openDatePicker("validUntil")} />
            </View>
          </View>

          <Divider />

          <FieldLabel>Inspection Center</FieldLabel>
          <StyledInput value={form.inspectionCenter} onChangeText={(v) => setField("inspectionCenter", v)} placeholder="e.g. Centre de Contrôle Technique Tunis" />
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>Complete Setup</Text>
        </TouchableOpacity>

        {activeDatePicker && (
          <DateTimePicker
            value={form[activeDatePicker] ?? new Date()}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  screenContent: { padding: 16, paddingBottom: 48, gap: 12 },

  header: { marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: C.text },
  pageSubtitle: { fontSize: 14, color: C.textMuted, marginTop: 4, lineHeight: 20 },

  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
    marginBottom: 4,
  },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  sectionBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.addBg, justifyContent: "center", alignItems: "center" },
  sectionBadgeText: { fontSize: 12, fontWeight: "700", color: C.addText },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: C.sectionTitle },

  fieldLabel: { fontSize: 13, fontWeight: "500", color: C.label, marginBottom: 4 },

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
  inputMultiline: { minHeight: 72, paddingTop: 11 },

  dateField: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: 14, color: C.text },
  datePlaceholder: { fontSize: 14, color: C.textPlaceholder },
  dateIcon: { fontSize: 14 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 2 },

  twoCol: { flexDirection: "column", gap: 10},
  twoColItem: { flex: 1},

  plateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  plateInputWrapper: { flex: 1 },

  pickerWrapper: {
    backgroundColor: C.pickerBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    color: C.text,
    height: Platform.OS === "ios" ? undefined : 52,
    fontSize: 14,
  },

  toggleRow: { flexDirection: "row", gap: 10 },
  toggleOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.inputBg, alignItems: "center" },
  togglePassed: { backgroundColor: "#EAF5EA", borderColor: "#4CAF50" },
  toggleFailed: { backgroundColor: "#FDF0EE", borderColor: "#C0392B" },
  toggleOptionText: { fontSize: 14, fontWeight: "500", color: C.textMuted },
  toggleOptionTextActive: { color: C.text, fontWeight: "600" },

  submitBtn: { backgroundColor: C.addBg, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: C.addText, letterSpacing: 0.2 },

  importBtn: { marginTop: 12, alignSelf: "flex-start", backgroundColor: C.addBg, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  importBtnText: { color: C.addText, fontSize: 13, fontWeight: "600", letterSpacing: 0.2 },
});