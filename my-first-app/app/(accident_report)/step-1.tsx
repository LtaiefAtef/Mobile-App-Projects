import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAccidentReport } from '@/context/AccidentReportContext';
import { useSharedAccidentReport } from '@/context/SharedAccidentReportContext';
import { SessionState } from '@/constants/appData';

// --- Types ---
type Witness = {
  id: string;
  full_name: string;
  address: string;
  isPassangerOfVehicle: boolean;
};

type FormData = {
  // Page 2 fields
  address: string;
  accidentDate: Date;
  // Page 1 fields
  injuries: {
    anyInjuries: boolean;
    injuryDetails: string;
  };
  otherVehiclesDamaged: {
    otherVehicleInvolved: boolean;
    numberOfVehicles: string;
  };
  witnesses: Witness[];
};

// --- Initial state ---
const initialForm: FormData = {
  address: '',
  accidentDate: new Date(),
  injuries: {
    anyInjuries: false,
    injuryDetails: '',
  },
  otherVehiclesDamaged: {
    otherVehicleInvolved: false,
    numberOfVehicles: '',
  },
  witnesses: [],
};

const makeWitness = (): Witness => ({
  id: Date.now().toString(),
  full_name: '',
  address: '',
  isPassangerOfVehicle: false,
});

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

const SwitchRow = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: C.border, true: C.switchTrue }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={C.border}
    />
  </View>
);

const Divider = () => <View style={styles.divider} />;

// --- Main form ---

export default function Step1() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [dateFrame, setDateFrame] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
// --- Location ---
const getLocation = async () => {
  setLocationLoading(true);
  setForm(f => ({ ...f, address: 'Locating...' }));

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    setErrorMsg('Permission denied');
    setForm(f => ({ ...f, address: '' }));
    setLocationLoading(false);
    return;
  }

  let loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Lowest,
  }).catch(() => null);

  if (!loc) {
    loc = await Location.getLastKnownPositionAsync({});
  }

  if (!loc) {
    setErrorMsg('Could not get location. Make sure GPS is enabled.');
    setForm(f => ({ ...f, address: '' }));
    setLocationLoading(false);
    return;
  }

  const places = await Location.reverseGeocodeAsync({
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  });

  if (places.length > 0) {
    const place = places[0];
    setForm(f => ({ ...f, address: place.formattedAddress ?? '' }));
  }

  setLocationLoading(false);
};

  // --- Date ---
  const changeDate = (_: any, selectedDate?: Date | null) => {
    setDateFrame(false);
    if (selectedDate) setForm(f => ({ ...f, date: selectedDate }));
  };

  // --- Injuries ---
  const setAnyInjuries = (v: boolean) =>
    setForm(f => ({
      ...f,
      injuries: { ...f.injuries, anyInjuries: v, injuryDetails: v ? f.injuries.injuryDetails : '' },
    }));

  const setInjuryDetails = (v: string) =>
    setForm(f => ({ ...f, injuries: { ...f.injuries, injuryDetails: v } }));

  // --- Other vehicles ---
  const setOtherVehicleInvolved = (v: boolean) =>
    setForm(f => ({
      ...f,
      otherVehiclesDamaged: {
        ...f.otherVehiclesDamaged,
        otherVehicleInvolved: v,
        numberOfVehicles: v ? f.otherVehiclesDamaged.numberOfVehicles : '',
      },
    }));

  const setNumberOfVehicles = (v: string) =>
    setForm(f => ({
      ...f,
      otherVehiclesDamaged: { ...f.otherVehiclesDamaged, numberOfVehicles: v },
    }));

  // --- Witnesses ---
  const addWitness = () =>
    setForm(f => ({ ...f, witnesses: [...f.witnesses, makeWitness()] }));

  const removeWitness = (id: string) =>
    setForm(f => ({ ...f, witnesses: f.witnesses.filter(w => w.id !== id) }));

  const updateWitness = (id: string, key: keyof Omit<Witness, 'id'>, value: string | boolean) =>
    setForm(f => ({
      ...f,
      witnesses: f.witnesses.map(w => (w.id === id ? { ...w, [key]: value } : w)),
    }));
  // --- Save step 1 and redirect to step 2 ---
  const { report, update} = useAccidentReport();
  const { sessionData, updateSession, updateBackendSession } = useSharedAccidentReport();
  const saveAndRedirect = async() => {
    update({accidentDate:form.accidentDate.toDateString(), submittedAt:new Date().toDateString() ,accidentLocation:form.address, injuries:form.injuries, witnesses:form.witnesses,
      otherVehiclesDamaged: { otherVehicleInvolved:form.otherVehiclesDamaged.otherVehicleInvolved, numberOfVehicles: Number(form.otherVehiclesDamaged.numberOfVehicles) }})
    if(sessionData){
      updateBackendSession({ ...sessionData.sharedData, user1Progress:2,sender:sessionData?.createdBy, 
        redirect:false } as SessionState)
    }
    router.push({ pathname: "/(accident_report)/step-2" });
    
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 , marginTop: 120 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Accident Info</Text>
        {/* ── Shared Info ── */}
        <View style={styles.card}>
          <SectionTitle>Shared Info</SectionTitle>
          {/* Location */}
          <FieldLabel>Accident location</FieldLabel>
          <View style={styles.locationRow}>
            <View style={styles.locationInputWrapper}>
              <StyledInput
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                placeholder="Accident location"
                editable={!locationLoading}
              />
            </View>
            <TouchableOpacity
              style={styles.locateBtn}
              onPress={getLocation}
              activeOpacity={0.8}
              disabled={locationLoading}
            >
              <Text style={styles.locateBtnText}>
                {locationLoading ? '…' : 'Locate'}
              </Text>
            </TouchableOpacity>
          </View>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Divider />

          {/* Date */}
          <FieldLabel>Accident date</FieldLabel>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setDateFrame(!dateFrame)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{form.accidentDate.toDateString()}</Text>
          </TouchableOpacity>

          {dateFrame && (
            <DateTimePicker
              testID="dateTimePicker"
              value={form.accidentDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={changeDate}
            />
          )}
        </View>

        {/* ── Injuries ── */}
        <View style={styles.card}>
          <SectionTitle>Injuries</SectionTitle>

          <SwitchRow
            label="Any injuries?"
            value={form.injuries.anyInjuries}
            onValueChange={setAnyInjuries}
          />

          {form.injuries.anyInjuries && (
            <>
              <Divider />
              <FieldLabel>Injury details</FieldLabel>
              <StyledInput
                value={form.injuries.injuryDetails}
                onChangeText={setInjuryDetails}
                placeholder="Describe the injuries..."
                multiline
              />
            </>
          )}
        </View>

        {/* ── Other Vehicles ── */}
        <View style={styles.card}>
          <SectionTitle>Other vehicles damaged</SectionTitle>

          <SwitchRow
            label="Other vehicle involved?"
            value={form.otherVehiclesDamaged.otherVehicleInvolved}
            onValueChange={setOtherVehicleInvolved}
          />

          {form.otherVehiclesDamaged.otherVehicleInvolved && (
            <>
              <Divider />
              <FieldLabel>Number of vehicles</FieldLabel>
              <StyledInput
                value={form.otherVehiclesDamaged.numberOfVehicles}
                onChangeText={setNumberOfVehicles}
                placeholder="e.g. 2"
                keyboardType="numeric"
              />
            </>
          )}
        </View>

        {/* ── Witnesses ── */}
        <View style={styles.card}>
          <SectionTitle>Witnesses</SectionTitle>

          {form.witnesses.length === 0 && (
            <Text style={styles.emptyText}>No witnesses added yet.</Text>
          )}

          {form.witnesses.map((w, i) => (
            <View key={w.id}>
              {i > 0 && <Divider />}
              <View style={styles.witnessBlock}>
                <View style={styles.witnessBlockHeader}>
                  <Text style={styles.witnessIndex}>Witness {i + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeWitness(w.id)}
                    style={styles.removeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <FieldLabel>Full name</FieldLabel>
                <StyledInput
                  value={w.full_name}
                  onChangeText={v => updateWitness(w.id, 'full_name', v)}
                  placeholder="e.g. Mohamed Trabelsi"
                />

                <View style={styles.fieldGap} />

                <FieldLabel>Address</FieldLabel>
                <StyledInput
                  value={w.address}
                  onChangeText={v => updateWitness(w.id, 'address', v)}
                  placeholder="e.g. 12 Rue de Carthage, Tunis"
                />

                <View style={styles.fieldGap} />

                <SwitchRow
                  label="Passenger of a vehicle?"
                  value={w.isPassangerOfVehicle}
                  onValueChange={v => updateWitness(w.id, 'isPassangerOfVehicle', v)}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addWitness} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add witness</Text>
          </TouchableOpacity>
        </View>
         <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={saveAndRedirect}>
            <Text style={styles.addBtnText} >Next</Text>
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
    paddingTop:25,
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
});