import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useState } from "react";
import * as MediaLibrary from "expo-media-library";
import Svg, { Path, Rect, Circle, Line, Polyline } from "react-native-svg";
import { WebView } from 'react-native-webview';
import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { router } from "expo-router";
import { useAccidentReport } from "@/context/AccidentReportContext";
import { useUser } from "@/context/UserContext";
import { checkIfAuthor, getUser } from "@/services/auth";
import { SessionData } from "@/constants/appData";
import { ComfyUIServerURL } from "@/services/api";
// --- Design tokens ---
const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  text: '#1A1A18',
  textMuted: '#7A7870',
  sectionTitle: '#1A1A18',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  inputBg: '#FAFAF8',
  removeRed: '#C0392B',
  selectedBg: '#1A1A18',
  selectedText: '#FFFFFF',
  chipBg: '#F0EFE9',
  chipBorder: '#D8D6CE',
  accent: '#2563EB',
};

// ── SVG Car Icons ─────────────────────────────────────────────────────────────

const SedanIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
    <Rect x="2" y="18" width="56" height="13" rx="3" fill={color} />
    <Path d="M10 18 Q14 7 22 6 L38 6 Q46 7 50 18 Z" fill={color} />
    <Path d="M15 8 Q18 5 22 5 L28 5 L28 17 L13 17 Z" fill="rgba(180,220,255,0.65)" />
    <Path d="M32 5 L38 5 Q43 5 46 8 L48 17 L32 17 Z" fill="rgba(180,220,255,0.65)" />
    <Circle cx="13" cy="31" r="5" fill="#222" />
    <Circle cx="13" cy="31" r="2.5" fill="#555" />
    <Circle cx="47" cy="31" r="5" fill="#222" />
    <Circle cx="47" cy="31" r="2.5" fill="#555" />
    <Rect x="2" y="18" width="4" height="7" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="54" y="18" width="4" height="7" rx="1" fill="rgba(255,80,80,0.9)" />
  </Svg>
);

const SUVIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.7} viewBox="0 0 60 42">
    <Rect x="2" y="15" width="56" height="20" rx="3" fill={color} />
    <Rect x="5" y="5" width="50" height="13" rx="3" fill={color} />
    <Path d="M7 6 L8 5 L52 5 L53 6 L53 15 L7 15 Z" fill="rgba(180,220,255,0.65)" />
    <Line x1="30" y1="5" x2="30" y2="15" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    <Circle cx="13" cy="35" r="5.5" fill="#222" />
    <Circle cx="13" cy="35" r="2.8" fill="#555" />
    <Circle cx="47" cy="35" r="5.5" fill="#222" />
    <Circle cx="47" cy="35" r="2.8" fill="#555" />
    <Rect x="2" y="17" width="4" height="8" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="54" y="17" width="4" height="8" rx="1" fill="rgba(255,80,80,0.9)" />
    <Rect x="2" y="8" width="3" height="4" rx="1" fill="rgba(255,220,80,0.8)" />
  </Svg>
);

const HatchbackIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.58} viewBox="0 0 60 34">
    <Rect x="2" y="17" width="56" height="12" rx="3" fill={color} />
    <Path d="M10 17 Q17 6 25 5 L44 5 Q50 8 52 17 Z" fill={color} />
    <Path d="M15 7 Q18 5 23 5 L30 5 L30 16 L13 16 Z" fill="rgba(180,220,255,0.65)" />
    <Path d="M32 5 L43 5 Q47 6 49 9 L50 16 L32 16 Z" fill="rgba(180,220,255,0.65)" />
    <Circle cx="13" cy="29" r="5" fill="#222" />
    <Circle cx="13" cy="29" r="2.5" fill="#555" />
    <Circle cx="47" cy="29" r="5" fill="#222" />
    <Circle cx="47" cy="29" r="2.5" fill="#555" />
    <Rect x="2" y="17" width="4" height="7" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="54" y="17" width="4" height="7" rx="1" fill="rgba(255,80,80,0.9)" />
  </Svg>
);

const PickupIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 70 42">
    <Rect x="2" y="16" width="68" height="18" rx="3" fill={color} />
    <Rect x="5" y="5" width="28" height="14" rx="3" fill={color} />
    <Rect x="35" y="16" width="33" height="1.5" fill="rgba(0,0,0,0.18)" />
    <Path d="M7 7 L8 5 L31 5 L31 16 L7 16 Z" fill="rgba(180,220,255,0.65)" />
    <Circle cx="14" cy="34" r="5.5" fill="#222" />
    <Circle cx="14" cy="34" r="2.8" fill="#555" />
    <Circle cx="56" cy="34" r="5.5" fill="#222" />
    <Circle cx="56" cy="34" r="2.8" fill="#555" />
    <Rect x="2" y="18" width="4" height="8" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="66" y="18" width="4" height="8" rx="1" fill="rgba(255,80,80,0.9)" />
  </Svg>
);

const VanIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.65} viewBox="0 0 65 42">
    <Rect x="2" y="8" width="61" height="26" rx="3" fill={color} />
    <Rect x="4" y="10" width="18" height="13" rx="2" fill="rgba(180,220,255,0.65)" />
    <Rect x="25" y="10" width="14" height="13" rx="2" fill="rgba(180,220,255,0.65)" />
    <Rect x="42" y="10" width="14" height="13" rx="2" fill="rgba(180,220,255,0.65)" />
    <Circle cx="13" cy="34" r="5.5" fill="#222" />
    <Circle cx="13" cy="34" r="2.8" fill="#555" />
    <Circle cx="52" cy="34" r="5.5" fill="#222" />
    <Circle cx="52" cy="34" r="2.8" fill="#555" />
    <Rect x="2" y="14" width="4" height="8" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="59" y="14" width="4" height="8" rx="1" fill="rgba(255,80,80,0.9)" />
  </Svg>
);

const CoupeIcon = ({ color = '#888', size = 44 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size * 0.52} viewBox="0 0 60 31">
    <Rect x="2" y="17" width="56" height="11" rx="3" fill={color} />
    <Path d="M12 17 Q18 5 26 4 L36 4 Q44 5 50 17 Z" fill={color} />
    <Path d="M17 6 Q20 3 25 3 L30 3 L30 16 L15 16 Z" fill="rgba(180,220,255,0.65)" />
    <Path d="M32 3 L37 3 Q41 4 43 7 L45 16 L32 16 Z" fill="rgba(180,220,255,0.65)" />
    <Circle cx="13" cy="28" r="5" fill="#222" />
    <Circle cx="13" cy="28" r="2.5" fill="#555" />
    <Circle cx="47" cy="28" r="5" fill="#222" />
    <Circle cx="47" cy="28" r="2.5" fill="#555" />
    <Rect x="2" y="17" width="4" height="7" rx="1" fill="rgba(255,220,80,0.9)" />
    <Rect x="54" y="17" width="4" height="7" rx="1" fill="rgba(255,80,80,0.9)" />
  </Svg>
);

// ── Accident type SVG icons ────────────────────────────────────────────────────

const RearEndIcon = ({ active = false }) => (
  <Svg width={28} height={20} viewBox="0 0 28 20">
    <Rect x="1" y="6" width="10" height="6" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M3 6 Q4 3 6 3 L9 3 Q11 4 11 6Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="3.5" cy="12" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="8.5" cy="12" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="15" y="6" width="12" height="6" rx="1.5" fill={active ? '#CCCCCC' : '#555'} />
    <Path d="M17 6 Q18 3 21 3 L24 3 Q26 4 26 6Z" fill={active ? '#CCCCCC' : '#555'} />
    <Circle cx="17.5" cy="12" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="24.5" cy="12" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M12 8 L15 10 L12 12" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const HeadOnIcon = ({ active = false }) => (
  <Svg width={28} height={20} viewBox="0 0 28 20">
    <Rect x="1" y="7" width="10" height="6" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M3 7 Q4 4 6 4 L9 4 Q11 5 11 7Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="3.5" cy="13" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="8.5" cy="13" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="17" y="7" width="10" height="6" rx="1.5" fill={active ? '#CCCCCC' : '#555'} />
    <Path d="M19 7 Q20 4 22 4 L25 4 Q27 5 27 7Z" fill={active ? '#CCCCCC' : '#555'} />
    <Circle cx="19.5" cy="13" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="24.5" cy="13" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Line x1="12" y1="10" x2="16" y2="10" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M12 8.5 L14 10 L12 11.5" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <Path d="M16 8.5 L14 10 L16 11.5" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </Svg>
);

const TBoneIcon = ({ active = false }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Rect x="9" y="2" width="10" height="6" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M11 2 Q12 0.5 14 0.5 L15 0.5 Q17 0.5 17 2Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="10.5" cy="8" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="17.5" cy="8" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M14 9 L14 13" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" strokeLinecap="round" />
    <Rect x="2" y="15" width="24" height="6" rx="1.5" fill={active ? '#CCCCCC' : '#555'} />
    <Path d="M4 15 Q7 11 11 11 L17 11 Q21 11 24 15Z" fill={active ? '#CCCCCC' : '#555'} />
    <Circle cx="5" cy="21" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="23" cy="21" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
  </Svg>
);

const SideswipeIcon = ({ active = false }) => (
  <Svg width={28} height={24} viewBox="0 0 28 24">
    <Rect x="1" y="4" width="14" height="6" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M3 4 Q5 1 7 1 L12 1 Q14 2 14 4Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="3.5" cy="10" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="11.5" cy="10" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="10" y="13" width="14" height="6" rx="1.5" fill={active ? '#CCCCCC' : '#555'} />
    <Path d="M12 13 Q14 10 16 10 L21 10 Q23 11 23 13Z" fill={active ? '#CCCCCC' : '#555'} />
    <Circle cx="12.5" cy="19" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="20.5" cy="19" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M11 10 L13 13" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const RolloverIcon = ({ active = false }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Rect x="4" y="16" width="16" height="7" rx="2" fill={active ? '#CCCCCC' : '#555'} transform="rotate(-35 12 19)" />
    <Path d="M5 15 Q10 8 17 11" fill={active ? '#CCCCCC' : '#555'} transform="rotate(-35 12 13)" />
    <Circle cx="5" cy="24" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="19" cy="19" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
    {/* Curved arrow SVG for rollover indicator */}
    <Path d="M18 5 Q23 4 25 9" stroke={active ? '#AAAAAA' : '#7A7870'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <Path d="M25 5 L25 9 L21 9" stroke={active ? '#AAAAAA' : '#7A7870'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FixedObjectIcon = ({ active = false }) => (
  <Svg width={28} height={24} viewBox="0 0 28 24">
    <Rect x="21" y="1" width="6" height="22" rx="2" fill={active ? '#AAAAAA' : '#7A7870'} />
    <Rect x="2" y="8" width="15" height="7" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M4 8 Q6 4 9 4 L14 4 Q16 5 17 8Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="4.5" cy="15" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="14.5" cy="15" r="2.5" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M17 10 L21 12 L17 14" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const PileupIcon = ({ active = false }) => (
  <Svg width={28} height={20} viewBox="0 0 28 20">
    <Rect x="1" y="7" width="7" height="5" rx="1" fill={active ? '#FFFFFF' : '#999'} />
    <Path d="M2 7 Q3 5 4.5 5 L6.5 5 Q8 5 8 7Z" fill={active ? '#FFFFFF' : '#999'} />
    <Circle cx="2.5" cy="12" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="6.5" cy="12" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="10" y="7" width="7" height="5" rx="1" fill={active ? '#CCCCCC' : '#666'} />
    <Path d="M11 7 Q12 5 13.5 5 L15.5 5 Q17 5 17 7Z" fill={active ? '#CCCCCC' : '#666'} />
    <Circle cx="11.5" cy="12" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="15.5" cy="12" r="1.5" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="19" y="7" width="8" height="5" rx="1" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M20 7 Q21 5 22.5 5 L24.5 5 Q26 5 26 7Z" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="20.5" cy="12" r="1.5" fill={active ? '#888' : '#333'} />
    <Circle cx="25.5" cy="12" r="1.5" fill={active ? '#888' : '#333'} />
    <Line x1="9" y1="9.5" x2="10" y2="9.5" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="18" y1="9.5" x2="19" y2="9.5" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const ParkingIcon = ({ active = false }) => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Rect x="1" y="1" width="26" height="26" rx="3" fill="none" stroke={active ? '#AAAAAA' : '#D8D6CE'} strokeWidth="1.5" strokeDasharray="3 2" />
    <Rect x="4" y="8" width="10" height="6" rx="1.5" fill={active ? '#FFFFFF' : '#888'} />
    <Path d="M6 8 Q7 5 9 5 L11 5 Q13 6 13 8Z" fill={active ? '#FFFFFF' : '#888'} />
    <Circle cx="6" cy="14" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="11" cy="14" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Rect x="12" y="16" width="12" height="5" rx="1.5" fill={active ? '#CCCCCC' : '#555'} transform="rotate(-15 18 18)" />
    <Circle cx="13" cy="22" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Circle cx="21" cy="20" r="2" fill={active ? '#AAAAAA' : '#444'} />
    <Path d="M13 13 L14 15" stroke={active ? '#FF9999' : '#C0392B'} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ── SVG for "Save to Photos" icon ─────────────────────────────────────────────
const SaveIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── SVG for generate button arrow ─────────────────────────────────────────────
const GenerateIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 17l10 5 10-5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12l10 5 10-5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

const ACCIDENT_TYPES = [
  { id: 'rear_end',     label: 'Rear-end',     promptLabel: 'rear-end collision',              Icon: RearEndIcon },
  { id: 'head_on',      label: 'Head-on',      promptLabel: 'head-on collision',               Icon: HeadOnIcon },
  { id: 'tbone',        label: 'T-bone',       promptLabel: 'T-bone side impact',             Icon: TBoneIcon },
  { id: 'sideswipe',    label: 'Sideswipe',    promptLabel: 'sideswipe collision',             Icon: SideswipeIcon },
  { id: 'rollover',     label: 'Rollover',     promptLabel: 'rollover accident',               Icon: RolloverIcon },
  { id: 'fixed_object', label: 'Fixed object', promptLabel: 'collision with fixed object',    Icon: FixedObjectIcon },
  { id: 'pileup',       label: 'Pile-up',      promptLabel: 'multi-vehicle pile-up',           Icon: PileupIcon },
  { id: 'parking',      label: 'Parking lot',  promptLabel: 'low-speed parking lot collision', Icon: ParkingIcon },
];

const CAR_TYPES = [
  { id: 'sedan',     label: 'Sedan',        Icon: SedanIcon },
  { id: 'suv',       label: 'SUV',          Icon: SUVIcon },
  { id: 'hatchback', label: 'Hatchback',    Icon: HatchbackIcon },
  { id: 'pickup',    label: 'Pickup truck', Icon: PickupIcon },
  { id: 'van',       label: 'Van',          Icon: VanIcon },
  { id: 'coupe',     label: 'Coupe',        Icon: CoupeIcon },
];

const CAR_COLORS = [
  { label: 'white',  display: 'White',  hex: '#FFFFFF', border: '#D0CFC8', lightText: true },
  { label: 'black',  display: 'Black',  hex: '#1A1A18', border: '#1A1A18', lightText: false },
  { label: 'silver', display: 'Silver', hex: '#C0C0C0', border: '#A0A09A', lightText: true },
  { label: 'red',    display: 'Red',    hex: '#C0392B', border: '#A0301F', lightText: false },
  { label: 'blue',   display: 'Blue',   hex: '#2563EB', border: '#1D4ED8', lightText: false },
  { label: 'gray',   display: 'Gray',   hex: '#6B7280', border: '#4B5563', lightText: false },
  { label: 'green',  display: 'Green',  hex: '#16A34A', border: '#15803D', lightText: false },
  { label: 'yellow', display: 'Yellow', hex: '#EAB308', border: '#CA8A04', lightText: true },
  { label: 'orange', display: 'Orange', hex: '#EA580C', border: '#C2410C', lightText: false },
  { label: 'brown',  display: 'Brown',  hex: '#92400E', border: '#78350F', lightText: false },
];

// ── Car Picker sub-component ──────────────────────────────────────────────────

function CarPicker({
  title,
  selectedType,
  selectedColor,
  onTypeChange,
  onColorChange,
}: {
  title: string;
  selectedType: string | null;
  selectedColor: string | null;
  onTypeChange: (id: string) => void;
  onColorChange: (label: string) => void;
}) {
  const colorHex = CAR_COLORS.find(c => c.label === selectedColor)?.hex ?? '#AAAAAA';

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {/* Car type horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingBottom: 2 }}>
          {CAR_TYPES.map(ct => {
            const selected = selectedType === ct.id;
            return (
              <TouchableOpacity
                key={ct.id}
                style={[styles.carTypeCard, selected && styles.carTypeCardSelected]}
                onPress={() => onTypeChange(ct.id)}
                activeOpacity={0.75}
              >
                <ct.Icon
                  color={selected ? (selectedColor ? colorHex : '#CCCCCC') : '#999999'}
                  size={46}
                />
                <Text style={[styles.carTypeLabel, selected && styles.carTypeLabelSelected]}>
                  {ct.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Color row */}
      <Text style={styles.helperText}>Color</Text>
      <View style={styles.colorRow}>
        {CAR_COLORS.map(c => (
          <TouchableOpacity
            key={c.label}
            style={[
              styles.colorSwatch,
              { backgroundColor: c.hex, borderColor: c.border },
              selectedColor === c.label && styles.colorSwatchSelected,
            ]}
            onPress={() => onColorChange(c.label)}
            activeOpacity={0.75}
          >
            {selectedColor === c.label && (
              <Text style={{ fontSize: 13, color: c.lightText ? '#1A1A18' : '#FFFFFF', fontWeight: '700', lineHeight: 16 }}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary line */}
      {(selectedType || selectedColor) && (
        <Text style={styles.selectedCount}>
          {selectedColor
            ? CAR_COLORS.find(c => c.label === selectedColor)?.display
            : '—'}
          {selectedType ? ` ${CAR_TYPES.find(t => t.id === selectedType)?.label}` : ''}
        </Text>
      )}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Step6() {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [car1Type, setCar1Type] = useState<string | null>(null);
  const [car1Color, setCar1Color] = useState<string | null>(null);
  const [car2Type, setCar2Type] = useState<string | null>(null);
  const [car2Color, setCar2Color] = useState<string | null>(null);
  const [selectedAccident, setSelectedAccident] = useState<string | null>(null);

  const buildPrompt = (): string => {
    const acc = ACCIDENT_TYPES.find(a => a.id === selectedAccident);
    const c1Label = CAR_TYPES.find(t => t.id === car1Type)?.label ?? 'vehicle';
    const c2Label = CAR_TYPES.find(t => t.id === car2Type)?.label ?? 'vehicle';
    const c1Color = car1Color ?? '';
    const c2Color = car2Color ?? '';

    const car1Desc = [c1Color, c1Label].filter(Boolean).join(' ');
    const car2Desc = [c2Color, c2Label].filter(Boolean).join(' ');

    return `${acc?.promptLabel ?? 'car collision'}, ${car1Desc} crashes into ${car2Desc}, drawing, 2D accident diagram`;
  };

  const isReady = !!(selectedAccident && car1Type && car1Color && car2Type && car2Color);

const xhrRequest = (method: string, url: string, body?: string): Promise<{status: number, text: string}> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (body) xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000;
    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(body);
  });
};

const { jobs } = useUser();
const { switchDriver } = useAccidentReport();
const { sessionData, updateBackendSession, setSessionData, inSession } = useSharedAccidentReport();
const { setUser1Progress } = useAccidentReport();
const handleGenerate = () => {
  if (!isReady) { setError('Please complete all steps above.'); return; }
  setError(null);
  const prompt = buildPrompt();
  setResultImage(null);
  (async () => {
    try {
      const { status, text } = await xhrRequest('POST', `${ComfyUIServerURL}/generate`, JSON.stringify({ prompt }));
      if (status !== 202) {
        setError(`Server error: ${status}`);
        return;
      }
      const res = JSON.parse(text);
      jobs.current = { job_ids: res.job_ids, status: res.status }
      if(inSession.current && sessionData){
        setSessionData((prev : SessionData) => ({ ...prev, sharedData:{ ...prev.sharedData, user1Progress:2 } }));
        updateBackendSession({ ...sessionData.sharedData, user1Progress:2, sender:sessionData?.createdBy, action:"progress" })
      }
      if(!inSession.current){
        setUser1Progress(2);
      }
      router.push("/step-2");
    } catch (e: any) {
      console.log('[ERROR]', e.message);
      setError(e.message || 'Failed.');
    }
  })();
};

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginTop: 120 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Generate Sketch Scene</Text>
        <Text style={styles.pageSubtitle}>Configure the accident and we'll build the diagram prompt.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Step 1 – First vehicle */}
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <Text style={styles.stepHeading}>First vehicle</Text>
        </View>
        <CarPicker
          title="Type & color"
          selectedType={car1Type}
          selectedColor={car1Color}
          onTypeChange={setCar1Type}
          onColorChange={setCar1Color}
        />

        {/* Step 2 – Second vehicle */}
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <Text style={styles.stepHeading}>Second vehicle</Text>
        </View>
        <CarPicker
          title="Type & color"
          selectedType={car2Type}
          selectedColor={car2Color}
          onTypeChange={setCar2Type}
          onColorChange={setCar2Color}
        />

        {/* Step 3 – Accident type */}
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <Text style={styles.stepHeading}>Accident type</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.accidentGrid}>
            {ACCIDENT_TYPES.map(acc => {
              const active = selectedAccident === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accidentChip, active && styles.accidentChipSelected]}
                  onPress={() => setSelectedAccident(acc.id)}
                  activeOpacity={0.75}
                >
                  <acc.Icon active={active} />
                  <Text style={[styles.accidentLabel, active && styles.accidentLabelSelected]}>
                    {acc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Prompt preview */}
        {isReady && (
          <View style={[styles.card, styles.promptCard]}>
            <Text style={styles.sectionTitle}>Prompt preview</Text>
            <Text style={styles.promptText}>{buildPrompt()}</Text>
          </View>
        )}

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, !isReady && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          activeOpacity={0.8}
          disabled={!isReady}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isReady && <GenerateIcon color="#FFFFFF" size={16} />}
            <Text style={styles.generateBtnText}>
              {isReady ? 'Generate 2D Diagram' : 'Complete all steps above'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  screenContent: { padding: 16, paddingBottom: 60, paddingTop: 25, gap: 10 },
  pageTitle: { fontSize: 25, fontWeight: 'bold', color: C.text, marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: C.textMuted, marginBottom: 4, lineHeight: 18 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 },
  promptCard: { backgroundColor: '#F0EFF9', borderColor: '#C7C4E8' },
  promptText: { fontSize: 12, color: '#3B3880', lineHeight: 18, fontStyle: 'italic' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.sectionTitle, marginBottom: 2 },
  helperText: { fontSize: 12, color: C.textMuted, marginTop: -4 },
  selectedCount: { fontSize: 12, color: C.accent, fontWeight: '600', marginTop: -4 },
  errorText: { fontSize: 12, color: C.removeRed, marginTop: -4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stepBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.text, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  stepHeading: { fontSize: 14, fontWeight: '600', color: C.text },
  carTypeCard: { width: 90, borderWidth: 1, borderColor: C.chipBorder, backgroundColor: C.chipBg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', gap: 6 },
  carTypeCardSelected: { backgroundColor: C.selectedBg, borderColor: C.selectedBg },
  carTypeLabel: { fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' },
  carTypeLabelSelected: { color: C.selectedText },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  colorSwatchSelected: { borderWidth: 3, transform: [{ scale: 1.18 }] },
  accidentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accidentChip: { borderWidth: 1, borderColor: C.chipBorder, backgroundColor: C.chipBg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', gap: 5, minWidth: '22%', flex: 1 },
  accidentChipSelected: { backgroundColor: C.selectedBg, borderColor: C.selectedBg },
  accidentLabel: { fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' },
  accidentLabelSelected: { color: C.selectedText },
  generateBtn: { backgroundColor: C.addBg, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 4 },
  generateBtnDisabled: { backgroundColor: C.chipBorder },
  generateBtnText: { fontSize: 15, fontWeight: '700', color: C.addText, letterSpacing: 0.3 },
  loadingBox: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  loadingTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  loadingSubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
  resultImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: C.inputBg },
  downloadBtn: { backgroundColor: C.addBg, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: C.addText, letterSpacing: 0.2 },
});