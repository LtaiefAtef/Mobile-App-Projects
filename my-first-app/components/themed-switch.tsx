import { StyleSheet, Switch, Text, View } from "react-native";
import { ThemedText } from "./themed-text";

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

export const ThemedSwitch = ({ label, value, onValueChange }: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <View style={styles.switchRow}>
    <ThemedText darkColor="white" lightColor="black">
      {label}
    </ThemedText>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: C.border, true: C.switchTrue }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={C.border}
    />
  </View>
);

const styles = StyleSheet.create({
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
});