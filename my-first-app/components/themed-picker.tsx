import { Picker } from "@react-native-picker/picker";
import { Platform, StyleSheet, View } from "react-native";

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

export default function StyledPicker({
  items,
  selectedValue,
  onValueChange,
  flex
}: {
  items: { label: string; value: string }[];
  selectedValue?: string;
  onValueChange: (v: string) => void;
  flex?: number;
}) {
  return (
    <View style={[styles.pickerWrapper, flex !== undefined && { flex }]}>
      <Picker
        selectedValue={selectedValue ?? ""}
        onValueChange={onValueChange}
        style={[styles.picker, { color: selectedValue ? C.text : C.textMuted }]}
        dropdownIconColor={C.text}
      >
        <Picker.Item label="Select…" value="" color={C.textMuted} style={{ fontSize: 14 }} />
        {items.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} color={C.text} style={{ fontSize: 14 }} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
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
});