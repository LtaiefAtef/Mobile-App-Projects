import { SessionState } from "@/constants/appData";
import { useAccidentReport } from "@/context/AccidentReportContext";
import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { checkIfAuthor, getUser } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  ScrollView,
  Alert,
  GestureResponderEvent,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// --- Design tokens (matches your app) ---
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
  inputBg: '#FAFAF8',
};

// --- SectionTitle Component ---
const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

// --- FieldLabel Component ---
const FieldLabel = ({ children }: { children: string }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

// --- Build SVG string from drawn paths ---
const buildSvgString = (paths: string[], width: number, height: number): string => {
  const pathElements = paths
    .map(d => `<path d="${d}" stroke="#1A1A18" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="120" viewBox="0 0 ${width} ${height}">${pathElements}</svg>`;
};

export default function Step5(): React.JSX.Element {
    const [agreed, setAgreed] = useState<boolean>(false);
    const currentPathRef = useRef<string>("");
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>("");
    const [isSigned, setIsSigned] = useState<boolean>(false);

    const panResponder = useRef(
    PanResponder.create({
        onStartShouldSetPanResponder: (): boolean => true,
        onMoveShouldSetPanResponder: (): boolean => true,

        onPanResponderGrant: (evt: GestureResponderEvent): void => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX},${locationY}`;
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
        setIsSigned(true);
        },

        onPanResponderMove: (evt: GestureResponderEvent): void => {
        const { locationX, locationY } = evt.nativeEvent;
        const updated = `${currentPathRef.current} L${locationX},${locationY}`;
        currentPathRef.current = updated;
        setCurrentPath(updated);
        },

        onPanResponderRelease: (): void => {
        const finalPath = currentPathRef.current;
        if (finalPath) {
            setPaths((prev: string[]) => [...prev, finalPath]);
        }
        currentPathRef.current = "";
        setCurrentPath("");
        },
    })
    ).current;
  const handleClear = (): void => {
    setPaths([]);
    setCurrentPath("");
    setIsSigned(false);
  };


  const toggleAgreed = (): void => setAgreed((prev: boolean) => !prev);
//  --- Saving Signature and redirecting to next step ---
    const { report, update, selectedDriver, switchDriver } = useAccidentReport();
    const { sessionData, updateBackendSession } = useSharedAccidentReport();
    const router = useRouter();
    const saveAndRedirect = async() => {
        const svgData = buildSvgString(paths, 350, 420);
        if(sessionData){
          const isAuthor = await checkIfAuthor(sessionData.createdBy);
          if(isAuthor){
            update({ signatures: { vehicleA: { signed:isSigned, signedAt:new Date().toDateString(), svgData } } });
            updateBackendSession({ ...sessionData.sharedData, user1Progress:6,
            sender:sessionData?.createdBy, report, redirect : false } as SessionState)
          }else{
            const user = await getUser();
            update({ signatures: { vehicleB: { signed:isSigned, signedAt:new Date().toDateString(), svgData } } });
            updateBackendSession({ ...sessionData.sharedData, user2Progress:6,
            sender:user, report, redirect : false, } as SessionState)
          }
          await AsyncStorage.setItem('@accident_report', JSON.stringify(report));
          router.push("/(accident_report)/sheet");
          return;
        }
        if(selectedDriver === "driverA"){
            update({ signatures: { vehicleA: { signed:isSigned, signedAt:new Date().toDateString(), svgData } } });
            switchDriver();
            router.push("/(accident_report)/step-2");
        }else{
            update({ signatures: { vehicleB: { signed:isSigned, signedAt:new Date().toDateString(), svgData } } });
            try {
                await AsyncStorage.setItem('@accident_report', JSON.stringify(report));
                router.push("/(accident_report)/sheet");
            } catch (e) {
                console.error("Failed to save report:", e);
            }
        }
    }
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
        <Text style={styles.pageTitle}>Sign the Agreement</Text>

        {/* Signature Card */}
        <View style={styles.card}>
          <SectionTitle>Your Signature</SectionTitle>
          <FieldLabel>Draw your signature in the space below</FieldLabel>

          {/* Canvas */}
          <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
            <Svg style={styles.canvas}>
              {paths.map((d: string, i: number) => (
                <Path
                  key={i}
                  d={d}
                  stroke={C.text}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath ? (
                <Path
                  d={currentPath}
                  stroke={C.text}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>

            {!isSigned && (
              <View style={styles.placeholder} pointerEvents="none">
                <Text style={styles.placeholderText}>✍️  Sign here</Text>
              </View>
            )}
          </View>

          {/* Baseline */}
          <View style={styles.signatureLine} />
          <Text style={styles.signatureHint}>Sign above the line</Text>

          {/* Clear Button */}
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>🗑  Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Agreement Checkbox */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={toggleAgreed}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the{" "}
              <Text style={styles.link}>Terms & Conditions</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
            onPress={()=>saveAndRedirect()}
            style={[styles.addBtn, (!isSigned || !agreed) && styles.addBtnDisabled]}
            activeOpacity={0.8}
        >
          <Text style={styles.addBtnText} >Submit & Sign</Text>
        </TouchableOpacity>
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
  canvasWrapper: {
    height: 420,
    backgroundColor: C.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: C.textPlaceholder,
    fontStyle: "italic",
  },
  signatureLine: {
    height: 1,
    backgroundColor: C.border,
    marginTop: -4,
  },
  signatureHint: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: "center",
    marginTop: -4,
  },
  clearBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.removeRed,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: C.addBg,
    borderColor: C.addBg,
  },
  checkmark: {
    color: C.addText,
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: C.label,
    lineHeight: 20,
  },
  link: {
    color: C.text,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  addBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
});