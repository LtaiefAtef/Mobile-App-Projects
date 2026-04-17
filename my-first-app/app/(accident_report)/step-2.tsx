import { Contract, insuranceList, plateTypeList, SessionData } from '@/constants/appData';
import { getUserContract } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StyledPicker from '@/components/themed-picker';
import { useAccidentReport } from '@/context/AccidentReportContext';
import { useSharedAccidentReport } from '@/context/SharedAccidentReportContext';
import { checkIfAuthor, getUser } from '@/services/auth';

// --- Design tokens ---
const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  borderFocus: '#1A1A18',
  text: '#1A1A18',
  textMuted: '#7A7870',
  textPlaceholder: '#B0AEA6',
  label: '#4A4844',
  sectionTitle: '#1A1A18',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  inputBg: '#FAFAF8',
  disabledBg: '#F0EFE9',
  pickerBg: '#FAFAF8',
};

// --- Sub-components ---

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? ''}
      placeholderTextColor={C.textPlaceholder}
      keyboardType={keyboardType ?? 'default'}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};
const Divider = () => <View style={styles.divider} />;

// --- Main component ---

export default function Step2() {
  // -- Saving Step 2 and redirecting to Step 3 ---
  // --- Field ---
  const [selectedInsurance, setSelectedInsurance] = useState<string | undefined>(undefined);
  const [selectedPlateType, setSelectedPlateType] = useState<string | undefined>(undefined);
  const [contractNumber, setContractNumber] = useState<string | undefined>(undefined);
  const [vehicleRegistration, setVehicleRegistration] = useState<string[]>([]);
  const router = useRouter();
  const [submitButton, setSubmitButton] = useState('Next');
  const [loading, setLoading] = useState(false);
  const { selectedDriver, report, update, switchDriver } = useAccidentReport();
  const { sessionData, updateSession, updateBackendSession, setSessionData } = useSharedAccidentReport();
  // --- Function ---
  async function saveAndRedirect() {
    setSubmitButton('Loading…');
    setLoading(true);
    setTimeout(async () => {
      const userContract = await getUserContract(contractNumber);
      setSubmitButton('Next');
      setLoading(false);
      if(sessionData){
        const isAuthor = await checkIfAuthor(sessionData.createdBy);
        if(isAuthor){
          setSessionData((prev : SessionData) => ({ ...prev, sharedData:{ ...prev.sharedData, user1Progress:3 } }));
          updateBackendSession({ ...sessionData.sharedData, user1Progress:3, sender:sessionData?.createdBy, action:"progress" })
        }else{
          const user = await getUser();
          setSessionData((prev : SessionData) => ({ ...prev, sharedData:{ ...prev.sharedData, user2Progress:3 } }));
          updateBackendSession({ ...sessionData.sharedData, user2Progress:3, sender:user, action:"progress" })
          switchDriver();
        }
      }
      if(selectedDriver === "driverA"){
          console.log("HOST COMPLETED STEP2")
        update({ insuranceCompany: { vehicleA: { companyName: selectedInsurance, contractNumber: userContract[0].contractNumber } }, driver: {driverA: { license:userContract[0].drivingLicenseNumber }} });
      }else{
          console.log("GUEST COMPLETED STEP2")
        update({ insuranceCompany: { vehicleB: { companyName: selectedInsurance, contractNumber: userContract[0].contractNumber } }, driver: {driverB: { license:userContract[0].drivingLicenseNumber }} });
      }
      console.log("User contract step-2",userContract[0]);
      router.push({
        pathname: '/(accident_report)/step-3',
        params: { contract: JSON.stringify(userContract[0]) }
      });
    }, 3000);
  }
  // --- Getting Setup Info ---
  useEffect(() => {
    const loadSetupInfo = async () => {
      const raw = await AsyncStorage.getItem("@account_setup_form");
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) return;
      // Set defaults from saved setup info
      setContractNumber(parsed.contractNumber);
      setSelectedInsurance(parsed.insuranceCompany);   // match your AsyncStorage key
      const registration = [parsed.registrationLeft, parsed.registrationPlateType, parsed.registrationRight];
      setVehicleRegistration(registration);
      setSelectedPlateType(parsed.registrationPlateType); // match your AsyncStorage key
    };
    loadSetupInfo();
  }, []);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Search Vehicle</Text>

        {/* ── Insurance selection ── */}
        <View style={styles.card}>
          <SectionTitle>Insurance Company</SectionTitle>
          <StyledPicker
            items={insuranceList}
            selectedValue={selectedInsurance}
            onValueChange={setSelectedInsurance}
          />
        </View>

        {/* ── Contract + plate fields (shown after insurance selected) ── */}
        {selectedInsurance && (
          <View style={styles.card}>
            <SectionTitle>Vehicle Details</SectionTitle>

            <FieldLabel>Policy Number</FieldLabel>
            <StyledInput
              placeholder="Policy Number"
              onChangeText={setContractNumber}
              value={contractNumber}
            />
            <Divider />

            <FieldLabel>Vehicle Registration Number</FieldLabel>
            <View style={styles.plateRow}>
              <View style={styles.plateInputWrapper}>
                <StyledInput placeholder="" value={vehicleRegistration[0]} />
              </View>
              <StyledPicker
                items={plateTypeList}
                selectedValue={selectedPlateType}
                onValueChange={setSelectedPlateType}
                flex={1}
              />
              <View style={styles.plateInputWrapper}>
                <StyledInput placeholder="" value={vehicleRegistration[2]}/>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
              activeOpacity={0.8}
              onPress={saveAndRedirect}
              disabled={loading}
            >
              <Text style={styles.nextBtnText}>{submitButton}</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingVertical:150
  },
  pageTitle: {
    marginLeft: 4,
    fontSize: 25,
    fontWeight: 'bold',
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
    fontWeight: '600',
    color: C.sectionTitle,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.label,
    marginBottom: 4,
  },
  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    fontSize: 14,
    color: C.text,
  },
  inputFocused: {
    borderColor: C.borderFocus,
    backgroundColor: C.card,
  },
  pickerWrapper: {
    backgroundColor: C.pickerBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    color: C.text,
    height: Platform.OS === 'ios' ? undefined : 52,
    fontSize: 14,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plateInputWrapper: {
    flex: 1,
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
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
});