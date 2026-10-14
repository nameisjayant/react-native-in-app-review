import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  isAvailable,
  openStoreListing,
  requestReview,
} from '@nameisjayant/react-native-in-app-review';

// Replace with your app's numeric App Store ID to try "Write a review" on iOS.
const IOS_APP_ID = '';

function describeError(error: unknown): string {
  const { code, message } = error as { code?: string; message?: string };
  return `${code ?? 'ERROR'}: ${message ?? String(error)}`;
}

export default function App() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    isAvailable()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  const onRequestReview = async () => {
    setStatus('Requesting review…');
    try {
      await requestReview();
      setStatus('Review flow finished');
    } catch (error) {
      setStatus(describeError(error));
    }
  };

  const onOpenStore = async () => {
    try {
      await openStoreListing({ iosAppId: IOS_APP_ID });
      setStatus('Opened store page');
    } catch (error) {
      setStatus(describeError(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>In-App Review</Text>
      <Text>
        Available: {available === null ? 'checking…' : String(available)}
      </Text>
      <Pressable style={styles.button} onPress={onRequestReview}>
        <Text style={styles.buttonText}>Request review</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onOpenStore}>
        <Text style={styles.buttonText}>Write a review in store</Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  status: {
    marginTop: 8,
    textAlign: 'center',
  },
});
