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
import { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";

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
};

// ── Change this to your backend URL ──────────────────────────────────────────
const API_URL = 'http://localhost:8000/generate';

export default function Step6() {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setResultImage(null);
    // try {
    //   const res = await fetch(API_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({}),
    //   });
    //   if (!res.ok) throw new Error(`Server error: ${res.status}`);
    //   const data = await res.json();
    //   setResultImage(`data:image/png;base64,${data.image_base64}`);
    // } catch (e: any) {
    //   setError(e.message || 'Generation failed. Make sure your backend is running.');
    // } finally {
    //   setLoading(false);
    // }
  };
  useEffect(()=>{
    setError(null);
    setLoading(true);
    setResultImage(null);
  },[])
  // ── Download result ───────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Storage access is required to save.');
        return;
      }
      const FS = require('expo-file-system');
      const base64Data = resultImage.replace('data:image/png;base64,', '');
      const fileUri = FS.cacheDirectory + `generated_${Date.now()}.png`;
      await FS.writeAsStringAsync(fileUri, base64Data, {
        encoding: FS.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Saved!', 'Image saved to your photo library.');
    } catch (e) {
      Alert.alert('Error', 'Could not save image.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginTop: 120 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={styles.pageTitle}>Generate Sketch Scene</Text>

        {/* ── Error ── */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <View style={styles.card}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.text} />
              <Text style={styles.loadingTitle}>Creating your image</Text>
              <Text style={styles.loadingSubtitle}>
                This usually takes 15-60 seconds depending on your hardware
              </Text>
            </View>
          </View>
        )}

        {/* ── Result ── */}
        {resultImage && !loading && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Image</Text>
            <Image
              source={{ uri: resultImage }}
              style={styles.resultImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
              <Text style={styles.downloadBtnText}>⬇  Save to Photos</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
    gap: 12,
    paddingTop: 25,
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
  addBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultImage: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    backgroundColor: C.inputBg,
  },
  downloadBtn: {
    backgroundColor: C.addBg,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.addText,
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 12,
    color: C.removeRed,
    marginTop: -4,
  },
});