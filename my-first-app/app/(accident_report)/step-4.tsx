import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { CircumstancesVehicle, useAccidentReport } from "@/context/AccidentReportContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  removeRed: '#C0392B',
  removeBg: '#FDF0EE',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  switchTrue: '#1A1A18',
  inputBg: '#FAFAF8',
};
// --- StyledInput Component ---
const StyledInput = ({
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType,
    editable,
    }: {
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
    editable?: boolean;
    }) => {
    const [focused, setFocused] = useState(false);
    return (
    <TextInput
        style={[
        styles.input,
        multiline && styles.inputMultiline,
        focused && styles.inputFocused,
        editable === false && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor={C.textPlaceholder}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable !== false}
    />
    );
    };
// --- SectionTitle Component ---
const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);
// --- FieldLabel Component ---
const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);
// --- Circumstances Labels ---
const CIRCUMSTANCES_LABELS: Record<string, string> = {
  parkedStationary: "Parked / Stationary",
  leavingParkingOrDriveway: "Leaving parking or driveway",
  enteringParkingOrDriveway: "Entering parking or driveway",
  exitingParkingLotOrPrivateLand: "Exiting parking lot / private land",
  enteringRoundabout: "Entering a roundabout",
  alreadyInRoundabout: "Already in roundabout",
  rearEndSameDirection: "Rear-end (same direction)",
  changingLanes: "Changing lanes",
  overtaking: "Overtaking",
  turningRight: "Turning right",
  turningLeft: "Turning left",
  reversing: "Reversing",
  crossingWrongSideOfRoad: "Crossing on wrong side of road",
  crossingIntersection: "Crossing an intersection",
  ranRedLight: "Ran a red light",
  failedToYieldRightOfWay: "Failed to yield right of way",
};
// --- Checkbox Component ---
const Checkbox = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity
    style={[styles.circumstanceOption, checked && styles.circumstanceOptionChecked]}
    onPress={onToggle}
    activeOpacity={0.8}>
    <Text style={[styles.circumstanceOptionText, checked && styles.circumstanceOptionTextChecked]}>
      {checked ? '✓ ' : ''}{label}
    </Text>
  </TouchableOpacity>
);
// --- Main COmponent --- 
export default function Step4() {

// --- Date of birth ---
const [dateFrame, setDateFrame ] = useState(false)
const [date, setDate] = useState<Date>(new Date())
// --- Change Date function ---
function changeDate(_: any, selectedDate?: Date | null){
  setDateFrame(false);
  if(selectedDate) setDate(selectedDate);
}
// --- Driver Information ---
const [fullName, setFullName] = useState<string>("")
const [address, setAdress] = useState<string>("");
const [visibleDamage, setVisibleDamage] = useState<string>("");
const [accidentPrespective, setAccidentPrespective] = useState< string>("");
const [circumstances, setCircumstances] = useState<CircumstancesVehicle>({
  parkedStationary: false,
  leavingParkingOrDriveway: false,
  enteringParkingOrDriveway: false,
  exitingParkingLotOrPrivateLand: false,
  enteringRoundabout: false,
  alreadyInRoundabout: false,
  rearEndSameDirection: false,
  changingLanes: false,
  overtaking: false,
  turningRight: false,
  turningLeft: false,
  reversing: false,
  crossingWrongSideOfRoad: false,
  crossingIntersection: false,
  ranRedLight: false,
  failedToYieldRightOfWay: false,
  totalChecked:0
});
// --- Toggle CheckBox ---
const toggleCircumstance = (key: keyof typeof circumstances) => {
  setCircumstances(prev => ({ ...prev, [key]: !prev[key] }));
};
// --- Expo Router ---
const router = useRouter();
// --- Save Step 4 and Redirect ---
const { selectedDriver, report, update, switchDriver } = useAccidentReport();
const SaveAndRedirect = async()=>{
  const totalChecked = Object.keys(circumstances).filter(key => circumstances[key as keyof CircumstancesVehicle] === true).length;
  if(selectedDriver === "driverA"){
    console.log("driverA step4");
    update({
      driver: {
        driverA: { fullName, address, dateOfBirth:date.toDateString()},
      },
      visibiledamage: {
        vehicleA: visibleDamage,
      },
      accidentPerspective: {
        driverA: accidentPrespective,
      },
      circumstances: {
        vehicleA: { ...circumstances, totalChecked },
      },
    });
  }else{
    update({
      driver: {
        driverB: { fullName, address, dateOfBirth:date.toDateString() },
      },
      visibiledamage: {
        vehicleB: visibleDamage,
      },
      accidentPerspective: {
        driverB: accidentPrespective,
      },
      circumstances: {
        vehicleB: { ...circumstances, totalChecked },
      },
    });
  }
  router.push("/(accident_report)/step-5");
  console.log("FULL DRIVER A REPORT : ",report);
}
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
          showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>Contract Info</Text>
            {/* --- Driver Section --- */}
            <View style={styles.card}>
                <SectionTitle>Driver Information</SectionTitle>
                <FieldLabel>Fullname</FieldLabel>
                <StyledInput placeholder="Fullname" keyboardType="default" onChangeText={ v => setFullName(v) } value={fullName}/>
                <FieldLabel>Address</FieldLabel>
                <StyledInput placeholder="Address" keyboardType="default" onChangeText={ v => setAdress(v) } value={address}/>
                <FieldLabel>Date of birth</FieldLabel>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setDateFrame(!dateFrame)}
                  activeOpacity={0.7}>
                  <Text style={styles.dateText}>{date.toDateString()}</Text>
                </TouchableOpacity>
                {dateFrame && <DateTimePicker 
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={changeDate}
                ></DateTimePicker>}
            </View>
            {/* --- Damage Section --- */}
            <View style={styles.card}>
                <SectionTitle>Damage Information</SectionTitle>
                <FieldLabel>Visible Damage</FieldLabel>
                <StyledInput placeholder="" keyboardType="default" onChangeText={v => setVisibleDamage(v)} value={visibleDamage} multiline/>
                <FieldLabel>Accident Prespective</FieldLabel>
                <StyledInput placeholder="Your perspective of the accident" keyboardType="default" onChangeText={v => setAccidentPrespective(v)} value={accidentPrespective} multiline/>
                <FieldLabel>Circumstances</FieldLabel>
                <View style={styles.circumstancesGrid}>
                  {(Object.keys(circumstances) as Array<keyof typeof circumstances>).map(key => (
                    key !== "totalChecked" && <Checkbox
                      key={key}
                      label={CIRCUMSTANCES_LABELS[key]}
                      checked={circumstances[key]}
                      onToggle={() => toggleCircumstance(key)}
                    />
                  ))}
                </View>
            </View>
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={ SaveAndRedirect }>
              <Text style={styles.addBtnText}>Next</Text>
            </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>);
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
  inputMultiline: {
    minHeight: 88,
    paddingTop: 11,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInputWrapper: {
    flex: 1,
  },
  locateBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
  },
  dateField: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
  },
  dateText: {
    fontSize: 14,
    color: C.text,
  },
  errorText: {
    fontSize: 12,
    color: C.removeRed,
    marginTop: -4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 14,
    color: C.text,
    flex: 1,
    paddingRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    fontStyle: 'italic',
  },
  witnessBlock: {
    gap: 8,
  },
  witnessBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  witnessIndex: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.removeBg,
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.removeRed,
  },
  fieldGap: {
    height: 2,
  },
  addBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
    circumstancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  circumstanceOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.inputBg,
  },
  circumstanceOptionChecked: {
    backgroundColor: C.addBg,
    borderColor: C.addBg,
  },
  circumstanceOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textMuted,
  },
  circumstanceOptionTextChecked: {
    color: C.addText,
    fontWeight: '600',
  },
});