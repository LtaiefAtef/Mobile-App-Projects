import { ThemedText } from '@/components/themed-text';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>();
  const [errorMsg, setErrorMsg] = useState<string | null>();

  useEffect(() => {
    (async () => {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission denied');
        return;
      }

      // 2. Get current position
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <ThemedText>
      {errorMsg ?? JSON.stringify(location?.coords)}
    </ThemedText>
  );
}