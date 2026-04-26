import React, { useEffect, useState } from 'react';
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
import { useSharedAccidentReport } from '@/context/SharedAccidentReportContext';
import { checkIfAuthor, getUser } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClaim } from '@/services/api';

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

const Divider = () => <View style={styles.divider} />;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default function SuccessPage() {
  const router = useRouter();
  const { report, downloadReport, update, setUser1Progress, setUser2Progress, defaultReport, switchDriver } = useAccidentReport();
  const [showReport, setShowReport] = useState(false);
  const [frame, setFrame] = useState(true);
  const [waitingForOtherParty, setWaitingForOtherParty] = useState(true);
  const { sessionData, inSession, defaultSession, setSessionData, reportRef } = useSharedAccidentReport();
  useEffect(() => {
    async function wait(){
    if (inSession.current && sessionData) {
      const isAuthor = await checkIfAuthor(sessionData.createdBy);

      if (
        sessionData.sharedData?.user1Progress === 6 &&
        sessionData.sharedData?.user2Progress === 6
      ) {
        setWaitingForOtherParty(false);
      }

      const Finalreport = sessionData?.sharedData?.report;
      if (!isAuthor) {
        console.log("GUEST IS UPDATING HIS REPORT");
        update({
          accidentDate: Finalreport?.accidentDate ?? "",
          accidentLocation: Finalreport?.accidentLocation ?? "",
          injuries: { ...(Finalreport?.injuries ?? {}) },
          otherVehiclesDamaged: { ...(Finalreport?.otherVehiclesDamaged ?? {}) },
          witnesses: [...(Finalreport?.witnesses ?? [])],
          driver: { driverA: Finalreport?.driver?.driverA ?? {} },
          insuranceCompany: { vehicleA: Finalreport?.insuranceCompany?.vehicleA ?? {} },
          visibiledamage: { vehicleA: Finalreport?.visibiledamage?.vehicleA ?? "" },
          circumstances: { vehicleA: Finalreport?.circumstances?.vehicleA ?? {} },
          signatures: { vehicleA: Finalreport?.signatures?.vehicleA ?? {} }
        });
      } else {
        console.log("HOST IS UPDATING HIS REPORT");
        update({
          driver: { driverB: Finalreport?.driver?.driverB ?? {} },
          insuranceCompany: { vehicleB: Finalreport?.insuranceCompany?.vehicleB ?? {} },
          visibiledamage: { vehicleB: Finalreport?.visibiledamage?.vehicleB ?? "" },
          circumstances: { vehicleB: Finalreport?.circumstances?.vehicleB ?? {} },
          signatures: { vehicleB: Finalreport?.signatures?.vehicleB ?? {} },
        });
      }
      setFrame(false);
      reportRef.current = report;
    }else{
      setWaitingForOtherParty(false);
      setFrame(true);
      setShowReport(true);
      await AsyncStorage.setItem('@accident_report', JSON.stringify(report));
      const res = await createClaim(report as ReportBody);
    }
  }
  wait()
  }, [sessionData]);
useEffect(()=>{},[report]);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {frame && <View style={styles.banner}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.bannerTitle}>Report Submitted</Text>
        <Text style={styles.bannerSubtitle}>
          Your accident report has been successfully submitted.
        </Text>
        <Text style={styles.bannerDate}>
          Submitted on {report.submittedAt ?? new Date().toLocaleDateString('fr-TN')}
        </Text>
      </View>}

      <TouchableOpacity
        style={styles.toggleReportBtn}
        onPress={() => setShowReport(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleReportBtnText}>
          {inSession.current && (!frame && !waitingForOtherParty ? showReport ? 'Hide Report ↑' : 'View Full Report ↓' : "Waiting For Other Party") }
          {!inSession.current && (showReport ? 'Hide Report ↑' : 'View Full Report ↓')} 
        </Text>
      </TouchableOpacity>

      {showReport && !waitingForOtherParty && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Accident Info</Text>
            <InfoRow label="Date" value={report.accidentDate ?? '—'} />
            <Divider />
            <InfoRow label="Location" value={report.accidentLocation ?? '—'} />
            <Divider />
            <InfoRow
              label="Injuries"
              value={report.injuries?.anyInjuries
                ? report.injuries?.injuryDetails ?? 'Yes'
                : 'None'}
            />
            <Divider />
            <InfoRow
              label="Other vehicles"
              value={report.otherVehiclesDamaged?.otherVehicleInvolved
                ? `${report.otherVehiclesDamaged?.numberOfVehicles} vehicle(s)`
                : 'None'}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Driver A</Text>
            <InfoRow label="Name" value={report.driver?.driverA?.fullName ?? '—'} />
            <Divider />
            <InfoRow label="Address" value={report.driver?.driverA?.address ?? '—'} />
            <Divider />
            <InfoRow label="Date of Birth" value={report.driver?.driverA?.dateOfBirth ?? '—'} />
            <Divider />
            <InfoRow label="License" value={report.driver?.driverA?.license ?? '—'} />
            <Divider />
            <InfoRow label="Insurance" value={report.insuranceCompany?.vehicleA?.companyName ?? '—'} />
            <Divider />
            <InfoRow label="Contract No." value={report.insuranceCompany?.vehicleA?.contractNumber ?? '—'} />
            <Divider />
            <InfoRow label="Visible Damage" value={report.visibiledamage?.vehicleA ?? '—'} />
            <Divider />
            <InfoRow
              label="Circumstances"
              value={`${report.circumstances?.vehicleA?.totalChecked ?? 0} checked`}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Driver B</Text>
            <InfoRow label="Name" value={report.driver?.driverB?.fullName ?? '—'} />
            <Divider />
            <InfoRow label="Address" value={report.driver?.driverB?.address ?? '—'} />
            <Divider />
            <InfoRow label="Date of Birth" value={report.driver?.driverB?.dateOfBirth ?? '—'} />
            <Divider />
            <InfoRow label="License" value={report.driver?.driverB?.license ?? '—'} />
            <Divider />
            <InfoRow label="Insurance" value={report.insuranceCompany?.vehicleB?.companyName ?? '—'} />
            <Divider />
            <InfoRow label="Contract No." value={report.insuranceCompany?.vehicleB?.contractNumber ?? '—'} />
            <Divider />
            <InfoRow label="Visible Damage" value={report.visibiledamage?.vehicleB ?? '—'} />
            <Divider />
            <InfoRow
              label="Circumstances"
              value={`${report.circumstances?.vehicleB?.totalChecked ?? 0} checked`}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            {(report.witnesses?.length ?? 0) === 0 ? (
              <Text style={styles.emptyText}>No witnesses.</Text>
            ) : (
              report.witnesses?.map((w, i) => (
                <View key={i}>
                  {i > 0 && <Divider />}
                  <InfoRow label={`Witness ${i + 1}`} value={w.full_name ?? '—'} />
                  <InfoRow label="Address" value={w.address ?? '—'} />
                  <InfoRow
                    label="Passenger"
                    value={w.isPassangerOfVehicle ? 'Yes' : 'No'}
                  />
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Accident Perspective</Text>
            <Text style={styles.perspectiveLabel}>Driver A</Text>
            <Text style={styles.perspectiveText}>
              {report.accidentPerspective?.driverA ?? '—'}
            </Text>
            <Divider />
            <Text style={styles.perspectiveLabel}>Driver B</Text>
            <Text style={styles.perspectiveText}>
              {report.accidentPerspective?.driverB ?? '—'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <InfoRow
              label="Vehicle A"
              value={report.signatures?.vehicleA?.signed
                ? `Signed on ${report.signatures?.vehicleA?.signedAt}`
                : 'Not signed'}
            />
            <Divider />
            <InfoRow
              label="Vehicle B"
              value={report.signatures?.vehicleB?.signed
                ? `Signed on ${report.signatures?.vehicleB?.signedAt}`
                : 'Not signed'}
            />
          </View>
          { frame && <TouchableOpacity
            style={styles.downloadBtn}
            onPress={()=> downloadReport(report)}
            activeOpacity={0.8}
          >
            <Text style={styles.downloadBtnText}>⬇ Download PDF</Text>
          </TouchableOpacity>}
        </>
      )}

      { frame && <TouchableOpacity
        style={styles.homeBtn}
        onPress={async() => {
          setUser1Progress(0);
          setUser2Progress(0);
          await AsyncStorage.setItem("@report",JSON.stringify(report));
          update(defaultReport)
          inSession.current = false;
          switchDriver();
          router.replace('/')
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.homeBtnText}>Go back to Home</Text>
      </TouchableOpacity>}
      { sessionData && <TouchableOpacity 
        style={[styles.homeBtn, frame && { backgroundColor : "#d6d6d6" }]}
        activeOpacity={0.8}
        onPress={async()=> {
          const user = await getUser();
          if(sessionData.createdBy === user) await createClaim(reportRef.current as ReportBody);
          setFrame(true);
        }}
        disabled = { !frame && waitingForOtherParty }>
        <Text style={styles.homeBtnText}>Validate Report</Text>
      </TouchableOpacity>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop:100
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