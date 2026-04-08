import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect } from 'react';

export default function ModalScreen() {
  // In your SessionHomeScreen (or whatever your screen is called)

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to FTUSA</ThemedText>
      <Link href="/(shared_accident_report)/room" dismissTo style={styles.link}> 
        <ThemedText type="link">User Login</ThemedText>
      </Link>
      <Link href="/(auth)/login" dismissTo style={styles.link}> 
        <ThemedText type="link">User Login</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
