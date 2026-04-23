import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccidentReportProvider, useAccidentReport } from '@/context/AccidentReportContext';
import { SharedAccidentReportProvider, useSharedAccidentReport } from '@/context/SharedAccidentReportContext';
import StepProgressBar from '@/components/step-progress-bar';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRef, useState, useCallback } from 'react';
import { Sidebar } from '@/components/side-bar';
import { UserProvider, useUser } from '@/context/UserContext';
import { User } from '@/constants/appData';
import { NotificationIcon } from '@/components/ui/notification-icon';

export const unstable_settings = { anchor: '(tabs)' };



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

// ─── Hamburger Button ─────────────────────────────────────────────────────────
const HamburgerButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.hamburger} activeOpacity={0.7}>
    <View style={styles.hamburgerLine} />
    <View style={styles.hamburgerLine} />
    <View style={styles.hamburgerLine} />
  </TouchableOpacity>
);

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const colorScheme = useColorScheme();
  const { sessionData } = useSharedAccidentReport();
  const path = usePathname();
  const router = useRouter();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { userInfo, getData, userPresent } = useUser();
  const { user1Progress, user2Progress} = useAccidentReport();
  const [user, setUser] = useState<User | null>(null);
  const openSidebar = useCallback(async() => {
    setSidebarVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
    if(!userPresent.current){
      const data = await getData();
      if(!data){
        router.replace("/(auth)/login");
      }
      setUser(data);
    }
  }, [slideAnim]);

  const closeSidebar = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  }, [slideAnim]);

  const handleNavigate = useCallback(
    (route: string) => {
      closeSidebar();
      setTimeout(() => router.push(route as any), 220);
    },
    [closeSidebar, router]
  );

  const hamburgerHeaderLeft = useCallback(
    () => <HamburgerButton onPress={openSidebar} />,
    [openSidebar]
  );

const homeHeaderOptions = {
  headerShown: true,
  title: 'Home',
  headerLeft: hamburgerHeaderLeft,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: C.bg },
  headerRight: () => <NotificationIcon hasNotification={false} onPress={()=> router.push("/notifications")} />,
};

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {(path.includes('step-') || path.includes('sheet')) && (
        <StepProgressBar
          user1Step={sessionData?.sharedData?.user1Progress || user1Progress || 0}
          user2Step={sessionData?.sharedData?.user2Progress || user2Progress || 0}
          user1Label={sessionData?.createdBy || "You"}
          user2Label={sessionData?.participants[1] || "Other User"}
        />
      )}

      <Stack>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={homeHeaderOptions} />
        <Stack.Screen name="(auth)/login"        options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup"       options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-1" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-2" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-3" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-4" options={{ headerShown: false }} />
        <Stack.Screen name="(accident_report)/step-5" options={{ headerShown: false }} />
        <Stack.Screen name="(shared_accident_report)/room"    options={{ title: 'Session Room' }} />
        <Stack.Screen name="(shared_accident_report)/session" options={{ title: 'Session Page' }} />
        <Stack.Screen name="(accident_report)/sheet"          options={{ title: 'Successful Report' }} />
        <Stack.Screen name="(account_setup)/setup"            options={{ title: 'Account Setup' }} />
        <Stack.Screen name="profile"                         options={{ title: 'Profile' }} />
        <Stack.Screen name="notifications"                         options={{ title: 'Notifications' }} />
      </Stack>

      <Sidebar
        visible={sidebarVisible}
        slideAnim={slideAnim}
        onClose={closeSidebar}
        onNavigate={handleNavigate}
        currentPath={path}
        userInfo={user}
      />

      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <SharedAccidentReportProvider>
        <AccidentReportProvider>
          <AppContent />
        </AccidentReportProvider>
      </SharedAccidentReportProvider>
    </UserProvider>
  );
}

const styles  = StyleSheet.create({
      // Hamburger
      hamburger: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 4,
        marginLeft: Platform.OS === 'ios' ? 8 : 4,
        marginInline:20,
        borderRadius:50
      },
      hamburgerLine: {
        height: 2,
        backgroundColor: C.text,
        borderRadius: 2,
        width: '100%',
      },
})