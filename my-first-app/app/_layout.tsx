import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={{ headerShown:false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }}/>
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }}/>
        <Stack.Screen name="(auth)/verify-email" options={{headerShown: false }}/>
        <Stack.Screen name="(accident_report)/step-1" options={{ title: "Step 1" }} />
        <Stack.Screen name="(accident_report)/step-2" options={{title:"Step 2"}}/>
        <Stack.Screen name="(accident_report)/step-3" options={{title:"Step 3"}}/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
