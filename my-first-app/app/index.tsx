import { ClaimCard, SubmissionMode } from "@/components/claim-component";
import { useAccidentReport } from "@/context/AccidentReportContext";
import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Design tokens ---
const C = {
  bg: "#F5F4F0",
  card: "#FFFFFF",
  border: "#E2E0D8",
  text: "#1A1A18",
  textMuted: "#7A7870",
  addBg: "#1A1A18",
  addText: "#FFFFFF",
};

export default function Home() {
  const { setUser1Progress } = useAccidentReport();
  const { inSession, setSessionData, defaultSession } = useSharedAccidentReport();
  const { userClaims, userPresent, getData } = useUser();
  const router = useRouter();
  const claims = [
  {
    claimId: "CLM-001",
    claimName: "Medical Expense Reimbursement",
    submittedAt: "2024-01-15T10:30:00Z",
    submittedWith: "John Doe",
    mode: "Session"
  },
  {
    claimId: "CLM-002",
    claimName: "Travel Insurance Claim",
    submittedAt: "2024-02-20T14:45:00Z",
    submittedWith: "Jane Smith",
    mode: "Session"
  },
  {
    claimId: "CLM-003",
    claimName: "Property Damage Claim",
    submittedAt: "2024-03-05T09:15:00Z",
    submittedWith: "Bob Johnson",
    mode: "Session"
  },];
  // useEffect(()=>{
  //   if(!userPresent){
  //     getData();
  //   }
  // },[])
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() => {
            setUser1Progress(1);
            console.log("MANUAL");
            setSessionData(defaultSession);
            inSession.current = false;
            router.push("/(accident_report)/step-1")
          }}
        >
          <Text style={styles.btnText}>Create a claim manually</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Start a new accident report and file your claim manually.</Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() => router.push("/(shared_accident_report)/session")}
        >
          <Text style={styles.btnText}>Create with shared party</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Start an accident report and file your claim by sharing it with the other driver.</Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() => router.push("/(account_setup)/setup")}
        >
          <Text style={styles.btnText}>Set up your account</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Setup your account for a better experience.</Text>
      </View>
      <View style={{width:"100%", marginTop:25, gap:15}}>
      {/* {claims.map((claim) => (
        <ClaimCard
          key={claim.claimId}
          claimId={claim.claimId}
          claimName={claim.claimName}
          submittedAt={claim.submittedAt}
          submittedWith={claim.submittedWith}
          mode={claim.mode}
          onEdit={() => console.log("Edit", claim.claimId)}
          onDelete={() => console.log("Delete", claim.claimId)}
        />
      ))} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: C.text,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    width: "100%",
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    marginTop: 4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.addText,
    letterSpacing: 0.2,
  },
});