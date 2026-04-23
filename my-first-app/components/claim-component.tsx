import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

// --- Design tokens ---
const C = {
  bg: "#F5F4F0",
  card: "#FFFFFF",
  border: "#E2E0D8",
  text: "#1A1A18",
  textMuted: "#7A7870",
  tagBg: "#F0EFE9",
  tagText: "#7A7870",
  danger: "#D94F4F",
  iconBg: "#1A1A18",
};

export type SubmissionMode = "Session" | "Local";

interface ClaimCardProps {
  claimId: string;
  claimName: string;
  submittedAt: string;
  submittedWith: string;
  mode: SubmissionMode;
  onDelete?: () => void;
  onEdit?: () => void;
}

function EditIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20h4l10.5-10.5a2.828 2.828 0 00-4-4L4 16v4z"
        stroke={C.text}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 6.5l4 4"
        stroke={C.text}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DeleteIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke={C.danger}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 11v5M14 11v5"
        stroke={C.danger}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ClaimIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v5h5"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M8 11h8M8 14h6M8 17h4"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClaimCard({
  claimId,
  claimName,
  submittedAt,
  submittedWith,
  mode,
  onDelete,
  onEdit,
}: ClaimCardProps) {
  return (
    <View style={styles.card}>
      {/* Left icon panel */}
      <View style={styles.iconPanel}>
        <ClaimIcon />
      </View>

      {/* Right content */}
      <View style={styles.content}>
        {/* Top row: name + actions */}
        <View style={styles.topRow}>
          <Text style={styles.claimName} numberOfLines={1}>
            {claimName}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.iconBtn}>
              <EditIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.iconBtn}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        </View>
        {/* ID */}
        <Text style={styles.idText}>#{claimId}</Text>

        <View style={styles.divider} />

        {/* Meta info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Submitted</Text>
            <Text style={styles.metaValue}>{submittedAt}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>With</Text>
            <Text style={styles.metaValue}>{submittedWith}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{mode}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    overflow: "hidden",
    width: "100%",
  },
  iconPanel: {
    width: 64,
    backgroundColor: C.iconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 7,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  claimName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: C.tagBg,
  },
  idText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: -3,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metaItem: {
    gap: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: C.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "500",
    color: C.text,
  },
  tag: {
    marginLeft: "auto",
    backgroundColor: C.tagBg,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: C.tagText,
  },
});