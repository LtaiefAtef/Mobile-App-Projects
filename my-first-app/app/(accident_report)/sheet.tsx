import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccidentReport } from '@/context/AccidentReportContext';

// --- Design tokens ---
const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  text: '#1A1A18',
  textMuted: '#7A7870',
  label: '#4A4844',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  inputBg: '#FAFAF8',
  green: '#4CAF50',
  greenBg: '#EAF5EA',
  greenBorder: '#4CAF50',
};

// --- Sub-components ---
const Divider = () => <View style={styles.divider} />;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// --- Main ---
export default function SuccessPage() {
  const router = useRouter();
  const { report, downloadReport } = useAccidentReport();
  const [showReport, setShowReport] = React.useState(false);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Success Banner ── */}
      <View style={styles.banner}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.bannerTitle}>Report Submitted</Text>
        <Text style={styles.bannerSubtitle}>
          Your accident report has been successfully submitted.
        </Text>
        <Text style={styles.bannerDate}>
          Submitted on {report.submittedAt || new Date().toLocaleDateString('fr-TN')}
        </Text>
      </View>

      {/* ── View Full Report toggle ── */}
      <TouchableOpacity
        style={styles.toggleReportBtn}
        onPress={() => setShowReport(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleReportBtnText}>
          {showReport ? 'Hide Report ↑' : 'View Full Report ↓'}
        </Text>
      </TouchableOpacity>

      {showReport && (
        <>
          {/* ── Accident Info ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Accident Info</Text>
            <InfoRow label="Date" value={report.accidentDate || '—'} />
            <Divider />
            <InfoRow label="Location" value={report.accidentLocation || '—'} />
            <Divider />
            <InfoRow
              label="Injuries"
              value={report.injuries.anyInjuries
                ? report.injuries.injuryDetails || 'Yes'
                : 'None'}
            />
            <Divider />
            <InfoRow
              label="Other vehicles"
              value={report.otherVehiclesDamaged.otherVehicleInvolved
                ? `${report.otherVehiclesDamaged.numberOfVehicles} vehicle(s)`
                : 'None'}
            />
          </View>

          {/* ── Driver A ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Driver A</Text>
            <InfoRow label="Name" value={report.driver.driverA.fullName || '—'} />
            <Divider />
            <InfoRow label="Address" value={report.driver.driverA.address || '—'} />
            <Divider />
            <InfoRow label="Date of Birth" value={report.driver.driverA.dateOfBirth || '—'} />
            <Divider />
            <InfoRow label="License" value={report.driver.driverA.license || '—'} />
            <Divider />
            <InfoRow label="Insurance" value={report.insuranceCompany.vehicleA.companyName || '—'} />
            <Divider />
            <InfoRow label="Contract No." value={report.insuranceCompany.vehicleA.contractNumber || '—'} />
            <Divider />
            <InfoRow label="Visible Damage" value={report.visibiledamage.vehicleA || '—'} />
            <Divider />
            <InfoRow
              label="Circumstances"
              value={`${report.circumstances.vehicleA.totalChecked} checked`}
            />
          </View>

          {/* ── Driver B ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Driver B</Text>
            <InfoRow label="Name" value={report.driver.driverB.fullName || '—'} />
            <Divider />
            <InfoRow label="Address" value={report.driver.driverB.address || '—'} />
            <Divider />
            <InfoRow label="Date of Birth" value={report.driver.driverB.dateOfBirth || '—'} />
            <Divider />
            <InfoRow label="License" value={report.driver.driverB.license || '—'} />
            <Divider />
            <InfoRow label="Insurance" value={report.insuranceCompany.vehicleB.companyName || '—'} />
            <Divider />
            <InfoRow label="Contract No." value={report.insuranceCompany.vehicleB.contractNumber || '—'} />
            <Divider />
            <InfoRow label="Visible Damage" value={report.visibiledamage.vehicleB || '—'} />
            <Divider />
            <InfoRow
              label="Circumstances"
              value={`${report.circumstances.vehicleB.totalChecked} checked`}
            />
          </View>

          {/* ── Witnesses ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            {report.witnesses.length === 0 ? (
              <Text style={styles.emptyText}>No witnesses.</Text>
            ) : (
              report.witnesses.map((w, i) => (
                <View key={i}>
                  {i > 0 && <Divider />}
                  <InfoRow label={`Witness ${i + 1}`} value={w.full_name || '—'} />
                  <InfoRow label="Address" value={w.address || '—'} />
                  <InfoRow
                    label="Passenger"
                    value={w.isPassangerOfVehicle ? 'Yes' : 'No'}
                  />
                </View>
              ))
            )}
          </View>

          {/* ── Perspectives ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Accident Perspective</Text>
            <Text style={styles.perspectiveLabel}>Driver A</Text>
            <Text style={styles.perspectiveText}>
              {report.accidentPerspective.driverA || '—'}
            </Text>
            <Divider />
            <Text style={styles.perspectiveLabel}>Driver B</Text>
            <Text style={styles.perspectiveText}>
              {report.accidentPerspective.driverB || '—'}
            </Text>
          </View>

          {/* ── Signatures ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <InfoRow
              label="Vehicle A"
              value={report.signatures.vehicleA.signed
                ? `Signed on ${report.signatures.vehicleA.signedAt}`
                : 'Not signed'}
            />
            <Divider />
            <InfoRow
              label="Vehicle B"
              value={report.signatures.vehicleB.signed
                ? `Signed on ${report.signatures.vehicleB.signedAt}`
                : 'Not signed'}
            />
          </View>
          {/* ── Download Button ── */}
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={()=> downloadReport(report)}
            activeOpacity={0.8}
          >
            <Text style={styles.downloadBtnText}>⬇ Download PDF</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── Go Home ── */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
      >
        <Text style={styles.homeBtnText}>Go back to Home</Text>
      </TouchableOpacity>
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
    paddingBottom: 48,
    gap: 12,
  },
  banner: {
    backgroundColor: C.greenBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.greenBorder,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  bannerDate: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  toggleReportBtn: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleReportBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: C.label,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: C.text,
    flex: 2,
    textAlign: 'right',
  },
  perspectiveLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.label,
  },
  perspectiveText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  homeBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
  downloadBtn: {
  backgroundColor: C.greenBg,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: C.greenBorder,
  paddingVertical: 12,
  alignItems: 'center',
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.green,
    letterSpacing: 0.2,
  },
});