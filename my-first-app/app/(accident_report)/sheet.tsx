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
} from 'react-native';

// --- Types ---
type Witness = {
  id: string;
  full_name: string;
  address: string;
  isPassangerOfVehicle: boolean;
};

type FormData = {
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
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        focused && styles.inputFocused,
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

export default function IncidentReportForm() {
  const [form, setForm] = useState<FormData>(initialForm);

  // Injuries
  const setAnyInjuries = (v: boolean) =>
    setForm(f => ({
      ...f,
      injuries: { ...f.injuries, anyInjuries: v, injuryDetails: v ? f.injuries.injuryDetails : '' },
    }));

  const setInjuryDetails = (v: string) =>
    setForm(f => ({ ...f, injuries: { ...f.injuries, injuryDetails: v } }));

  // Other vehicles
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

  // Witnesses
  const addWitness = () =>
    setForm(f => ({ ...f, witnesses: [...f.witnesses, makeWitness()] }));

  const removeWitness = (id: string) =>
    setForm(f => ({ ...f, witnesses: f.witnesses.filter(w => w.id !== id) }));

  const updateWitness = (id: string, key: keyof Omit<Witness, 'id'>, value: string | boolean) =>
    setForm(f => ({
      ...f,
      witnesses: f.witnesses.map(w => (w.id === id ? { ...w, [key]: value } : w)),
    }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
    </ScrollView>
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
