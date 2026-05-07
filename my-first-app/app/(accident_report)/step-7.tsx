import { useSharedAccidentReport } from "@/context/SharedAccidentReportContext";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useUser } from "@/context/UserContext";
import { useAccidentReport } from "@/context/AccidentReportContext";
import { checkIfAuthor } from "@/services/auth";
import { SessionData } from "@/constants/appData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ComfyUIServerURL } from "@/services/api";

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

const xhrRequest = (method: string, url: string, body?: string): Promise<{ status: number, text: string }> => {
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

export default function Step7() {
  // ✅ FIX 1: All context hooks declared FIRST, before any state or effects
  const { selectedDriver, reportDataRef, setUser1Progress, setUser2Progress } = useAccidentReport();
  const { sessionData, updateBackendSession, setSessionData, inSession, sessionDataRef } = useSharedAccidentReport();
  const { jobs } = useUser();

  // ✅ FIX 2: jobIds derived immediately after hooks, so it's available to useEffect below
  const jobIds: string[] = jobs.current?.job_ids ?? [];

  const selectedImgUrl = useRef("");
  const [resultImages, setResultImages] = useState<(string | null)[]>([null, null, null]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ FIX 3: mounted guard — prevents setState calls after the component unmounts,
    // which was corrupting the Fabric Shadow Tree and causing the native SIGABRT crash
    let isMounted = true;

    if (jobIds.length === 0) {
      setError('No jobs found. Please go back and generate again.');
      return;
    }

    setResultImages([null, null, null]);
    setSelectedImage(null);
    setAllDone(false);

    // ✅ FIX 4: pollJob defined inside useEffect so isMounted is in scope,
    // and it uses the REAL response status instead of a hardcoded 200
    const pollJob = (jobId: string, index: number) => {
      if (!jobId || jobId.length === 0) return; // guard against empty job IDs

      setTimeout(async () => {
        if (!isMounted) return; // stop if unmounted

        try {
          const { status } = await xhrRequest('GET', `${ComfyUIServerURL}/status/${jobId}`);
          if (!isMounted) return;

          if (status === 202) {
            // Job still processing — poll again
            pollJob(jobId, index);
            return;
          }

          if (status === 200) {
            const imageUrl = `${ComfyUIServerURL}/file/${jobId}.png`;
            setResultImages(prev => {
              const updated = [...prev];
              updated[index] = imageUrl;
              return updated;
            });
            return;
          }

          // Unexpected status — show error for this slot
          console.warn(`Unexpected status ${status} for job ${jobId}`);
          setResultImages(prev => {
            const updated = [...prev];
            updated[index] = 'error';
            return updated;
          });

        } catch (e: any) {
          if (!isMounted) return; // don't retry if unmounted
          console.log(`[POLL ERROR job ${index}] retrying...`, e.message);
          pollJob(jobId, index);
        }
      }, 3000);
    };

    jobIds.forEach((id, i) => pollJob(id, i));

    // ✅ FIX 5: cleanup sets isMounted = false so all pending timeouts/retries stop
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resultImages.every(img => img !== null)) {
      setAllDone(true);
    }
  }, [resultImages]);

  async function saveAndRedirect() {
    if (inSession.current && sessionData) {
      const isAuthor = await checkIfAuthor(sessionData?.createdBy);
      if (isAuthor) {
        reportDataRef.current.sketchImageUrl = selectedImage ?? "";
        updateBackendSession({
          ...sessionData?.sharedData,
          user1Progress: 8,
          sender: sessionData?.createdBy,
          reportDataRef,
          action: "final"
        })
          sessionDataRef.current = {...sessionDataRef.current, sharedData:{...sessionDataRef.current.sharedData, user1Progress:8 }}
          setSessionData((prev: SessionData) => ({ ...prev, sharedData: { ...prev.sharedData, user1Progress: 8 } }))
      }
      router.push("/(accident_report)/sheet");
      return;
    } else {
      if (selectedDriver === "driverA") {
        if (!inSession.current) {
          setUser1Progress(8);
        }
      } else {
        if (!inSession.current) {
          setUser2Progress(8);
        }
        reportDataRef.current = {
          ...reportDataRef.current,
          sketchImageUrl: selectedImgUrl.current.length > 0 ? selectedImgUrl.current : "picture not done yet"
        };
      }
    }
    await AsyncStorage.setItem('@accident_report', JSON.stringify(reportDataRef.current));
    router.push("/(accident_report)/sheet");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Text style={styles.pageTitle}>Choose your accident diagram</Text>
      <Text style={styles.pageSubtitle}>
        {allDone
          ? 'Tap an image to select it'
          : 'Images will appear as they finish generating…'}
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {[0, 1, 2].map((i) => {
        const imgUrl = resultImages[i];
        const isSelected = selectedImage === imgUrl && imgUrl !== null;
        const isError = imgUrl === 'error';

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={imgUrl && !isError ? 0.85 : 1}
            onPress={() => {
              if (imgUrl && !isError) {
                setSelectedImage(imgUrl);
                selectedImgUrl.current = imgUrl;
              }
            }}
            style={[
              styles.imageSlot,
              isSelected && styles.imageSlotSelected,
            ]}
          >
            {isError ? (
              <View style={styles.loadingBox}>
                <Text style={styles.errorText}>Failed to generate option {i + 1}</Text>
              </View>
            ) : imgUrl ? (
              <>
                <Image source={{ uri: imgUrl }} style={{ width: '100%', height: 250 }} contentFit="cover" />
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={C.textMuted} />
                <Text style={styles.loadingTitle}>Generating option {i + 1}…</Text>
                <Text style={styles.loadingSubtitle}>This usually takes 15–60 seconds</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {selectedImage && (
        <TouchableOpacity style={styles.confirmBtn} onPress={saveAndRedirect}>
          <Text style={styles.confirmBtnText}>Use this diagram →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white", marginTop: 40 },
  screenContent: { padding: 16, paddingBottom: 60, paddingTop: 25, gap: 12 },
  pageTitle: { fontSize: 25, fontWeight: 'bold', color: C.text, marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: C.textMuted, marginBottom: 4, lineHeight: 18 },
  errorText: { fontSize: 13, color: C.removeRed },
  imageSlot: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
    overflow: 'hidden',
    minHeight: 220,
  },
  imageSlotSelected: {
    borderColor: C.accent,
    borderWidth: 3,
  },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  loadingSubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confirmBtn: {
    backgroundColor: C.addBg,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: C.addText, letterSpacing: 0.3 },
});