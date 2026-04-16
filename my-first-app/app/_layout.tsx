import { DarkTheme, DefaultTheme, ThemeProvider, useRoute } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccidentReportProvider } from '@/context/AccidentReportContext';
import { SharedAccidentReportProvider, useSharedAccidentReport } from '@/context/SharedAccidentReportContext';
import StepProgressBar from '@/components/step-progress-bar';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const colorScheme = useColorScheme();
  const { sessionData } = useSharedAccidentReport();
  const path = usePathname();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {(path.includes("step-") || path.includes("sheet")) && <StepProgressBar
        user1Step={ sessionData?.sharedData?.user1Progress ?? null }
        user2Step={ sessionData?.sharedData?.user2Progress ?? null }
        user1Label={sessionData?.createdBy ?? null}
        user2Label={sessionData?.participants[1] ?? null}
      />}
      <Stack>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-1" options={{ headerShown: false, title: "Step 1" }} />
        <Stack.Screen name="(accident_report)/step-2" options={{ headerShown: false, title: "Step 2" }} />
        <Stack.Screen name="(accident_report)/step-3" options={{ headerShown: false, title: "Step 3" }} />
        <Stack.Screen name="(accident_report)/step-4" options={{ headerShown: false, title: "Step 4" }} />
        <Stack.Screen name="(accident_report)/step-5" options={{ headerShown: false, title: "Step 5" }} />
        <Stack.Screen name="(shared_accident_report)/room" options={{ title: "Session Room" }} />
        <Stack.Screen name="(shared_accident_report)/session" options={{ title: "Session Page" }} />
        <Stack.Screen name="(accident_report)/sheet" options={{ title: "Successful Report" }} />
        <Stack.Screen name="(account_setup)/setup" options={{ title: "Account Setup" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SharedAccidentReportProvider>
      <AccidentReportProvider>
        <AppContent />
      </AccidentReportProvider>
    </SharedAccidentReportProvider>
  );
}