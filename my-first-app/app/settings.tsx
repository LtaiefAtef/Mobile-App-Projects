import StyledPicker from "@/components/themed-picker";
import { languages } from "@/constants/appData";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  text: '#1A1A18',
  textMuted: '#7A7870',
  label: '#4A4844',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  removeRed: '#C0392B',
  removeBg: '#FDF0EE',
  bannerAccent: '#2C2C2A',
};
// --- Sub-components ---

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);
export default function Settings(){
    const [selectedInsurance, setSelectedInsurance] = useState<string | undefined>(undefined);
    const [selectedPlateType, setSelectedPlateType] = useState<string | undefined>(undefined);
    return(
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
                    <View style={styles.card}>
                        <SectionTitle>App Language</SectionTitle>
                        <FieldLabel>Choose Language:</FieldLabel>
                        <StyledPicker
                        items={languages}
                        selectedValue={selectedInsurance}
                        onValueChange={setSelectedInsurance}
                        />
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
        paddingTop:25,
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
        color: C.text,
        marginBottom: 2,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: C.label,
        marginBottom: 4,
    },
})